import { Product } from '../types/product';
import { HealthProfile } from '../types/profile';
import { VerdictResult } from '../types/verdict';
import { SmartAlternative } from '../types/alternatives';
import {
  BasketItem,
  BasketItemAnalysis,
  BasketIntelligenceSummary,
  BasketImprovementSuggestion,
  BasketComparisonMetrics,
  BasketItemConcernType,
} from '../types/basket';
import { runVerdictEngine } from '../engine/verdictEngine';
import { getSmartAlternatives } from './alternativesEngine';

/**
 * Convert a SmartAlternative into a standard Product representation
 * so it can be evaluated by the verdict engine, stored in the basket, or compared.
 */
export function alternativeToProduct(alt: SmartAlternative): Product {
  const allergenTags = (alt.allergens || []).map((a) => `en:${a}`);

  return {
    barcode: alt.barcode,
    name: alt.name || (alt as unknown as { title?: string }).title || 'Unknown Product',
    brand: alt.brand || (alt.type === 'homemade' ? 'Fresh Homemade Recipe' : 'Verified Alternative'),
    imageUrl: alt.imageUrl,
    source: alt.source === 'openfoodfacts' ? 'openfoodfacts' : 'manual',
    servingUnit: 'per100g',
    servingSize: alt.servingSize,
    nutrients: alt.nutrients,
    ingredients: alt.ingredients,
    ingredientsRaw: alt.ingredients?.join(', ') || '',
    allergenTags,
    tracesTags: [],
    additives: [],
    category: alt.category,
  };
}

/**
 * Extract numeric price from cost details if available (e.g. "~$1.25 / serving" -> 1.25)
 */
export function extractPriceFromCostDetails(costDetails?: string): number | undefined {
  if (!costDetails) return undefined;
  const match = costDetails.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

/**
 * Analyze an individual basket item against the user's health profile
 */
export function analyzeBasketItem(
  item: BasketItem,
  profile: HealthProfile
): BasketItemAnalysis {
  const verdict = runVerdictEngine(item.product, profile);
  const flags: string[] = [];

  let concernType: BasketItemConcernType = 'clean';
  let severity: 'red' | 'yellow' | 'grey' | 'green' = 'green';

  // 1. Check Allergen Matches (Highest Priority)
  if (verdict.allergenMatches && verdict.allergenMatches.length > 0) {
    concernType = 'safety_allergen';
    severity = 'red';
    for (const m of verdict.allergenMatches) {
      flags.push(`Declared Allergen Alert: "${m.allergen}" found via "${m.synonym}"`);
    }
  }

  // 2. Check Pregnancy / Teratogenic / Alcohol / Mercury Hard limits
  const redPreg = verdict.ruleResults.filter((r) => r.ruleId.startsWith('preg_') && r.verdict === 'red');
  if (redPreg.length > 0) {
    concernType = 'safety_pregnancy';
    severity = 'red';
    for (const r of redPreg) {
      flags.push(`Prenatal Safety Concern: ${r.message}`);
    }
  }

  // 3. Check Lactose Intolerance
  if (profile.lactoseIntolerant) {
    const redLactose = verdict.ruleResults.filter((r) => r.ruleId.startsWith('lactose_') && r.verdict === 'red');
    if (redLactose.length > 0) {
      if (severity !== 'red') {
        concernType = 'safety_lactose';
        severity = 'red';
      }
      for (const r of redLactose) {
        flags.push(`Lactose Overload: ${r.message}`);
      }
    }
  }

  // 4. Check Nutritional Mismatches (Red / Yellow thresholds for PCOS, Diabetes, etc.)
  const redNutritional = verdict.ruleResults.filter(
    (r) => r.verdict === 'red' && !r.ruleId.startsWith('preg_') && !r.ruleId.startsWith('lactose_') && !r.isInformational
  );
  const yellowRules = verdict.ruleResults.filter((r) => r.verdict === 'yellow' && !r.isInformational);

  if (redNutritional.length > 0) {
    if (severity !== 'red') {
      concernType = 'nutritional_mismatch';
      severity = 'red';
    }
    for (const r of redNutritional) {
      flags.push(`${r.nutrient}: Exceeds target (${r.actualValue ?? 'High'} ${r.unit}, limit was ${r.limitValue} ${r.unit})`);
    }
  } else if (yellowRules.length > 0 || (verdict.tracesWarnings && verdict.tracesWarnings.length > 0)) {
    if (severity === 'green') {
      concernType = 'nutritional_mismatch';
      severity = 'yellow';
    }
    for (const r of yellowRules) {
      flags.push(`${r.nutrient}: ${r.message}`);
    }
    for (const t of verdict.tracesWarnings || []) {
      flags.push(`Traces warning: ${t.allergen}`);
    }
  }

  // 5. Incomplete / Missing Information
  const hasIngredients =
    (item.product.ingredients && item.product.ingredients.length > 0) ||
    Boolean(item.product.ingredientsRaw?.trim());
  const hasNutrients =
    Boolean(item.product.nutrients && Object.keys(item.product.nutrients).length > 0);

  if (!hasIngredients || !hasNutrients || verdict.overall === 'insufficient_data') {
    if (severity === 'green') {
      concernType = 'insufficient_data';
      severity = 'grey';
      if (!hasIngredients && !hasNutrients) {
        flags.push('Package is missing both verified ingredients and nutritional information.');
      } else if (!hasIngredients) {
        flags.push('Ingredient list is missing. Cannot verify allergen or dietary safety.');
      } else if (!hasNutrients) {
        flags.push('Nutritional breakdown is missing. Sugar, sodium, and carb values cannot be verified.');
      } else if (verdict.missingNutrients.length > 0) {
        flags.push(`Missing verified data for: ${verdict.missingNutrients.join(', ')}`);
      } else {
        flags.push('Package does not declare complete ingredient or nutrition information.');
      }
    }
  }

  if (flags.length === 0) {
    flags.push('No issues detected; aligns cleanly with your profile thresholds.');
  }

  return {
    item,
    verdict,
    concernType,
    flags,
    severity,
  };
}

/**
 * Generate comprehensive intelligence summary for the entire grocery basket
 */
export function analyzeBasket(
  items: BasketItem[],
  profile: HealthProfile
): BasketIntelligenceSummary {
  const itemsAnalysis = items.map((item) => analyzeBasketItem(item, profile));

  const totalUniqueProducts = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  let totalCostSum = 0;
  let pricedCount = 0;

  for (const item of items) {
    if (item.unitPrice !== undefined && item.unitPrice !== null && !isNaN(item.unitPrice)) {
      totalCostSum += item.unitPrice * item.quantity;
      pricedCount += 1;
    }
  }

  const unpricedCount = totalUniqueProducts - pricedCount;
  const totalEstimatedCost = pricedCount > 0 ? Math.round(totalCostSum * 100) / 100 : null;
  const hasPartialPricing = pricedCount > 0 && unpricedCount > 0;

  const safetyConcernCount = itemsAnalysis.filter((a) => a.severity === 'red').length;
  const nutritionalMismatchCount = itemsAnalysis.filter((a) => a.severity === 'yellow').length;
  const insufficientDataCount = itemsAnalysis.filter((a) => a.severity === 'grey').length;
  const cleanCount = itemsAnalysis.filter((a) => a.severity === 'green').length;

  // Synthesize concise natural language overview of the basket
  let overviewText = '';

  if (totalUniqueProducts === 0) {
    overviewText = 'Your basket is currently empty. Scan packaged food or browse smart alternatives to build your grocery list.';
  } else {
    const parts: string[] = [];
    parts.push(`You have ${totalUniqueProducts} ${totalUniqueProducts === 1 ? 'product' : 'products'} (${totalUnits} total units) in your basket.`);

    if (safetyConcernCount > 0) {
      parts.push(
        `${safetyConcernCount} ${safetyConcernCount === 1 ? 'item has' : 'items have'} potential safety concerns matching your declared profile.`
      );
    }

    if (nutritionalMismatchCount > 0) {
      parts.push(
        `${nutritionalMismatchCount} ${nutritionalMismatchCount === 1 ? 'item exceeds' : 'items exceed'} your nutritional thresholds or contain caution ingredients.`
      );
    }

    if (insufficientDataCount > 0) {
      parts.push(
        `${insufficientDataCount} ${insufficientDataCount === 1 ? 'product has' : 'products have'} incomplete label data requiring closer inspection.`
      );
    }

    if (cleanCount > 0) {
      parts.push(
        `${cleanCount} ${cleanCount === 1 ? 'product aligns' : 'products align'} cleanly with your dietary goals.`
      );
    }

    overviewText = parts.join(' ');
  }

  return {
    totalUniqueProducts,
    totalUnits,
    totalEstimatedCost,
    hasPartialPricing,
    pricedItemCount: pricedCount,
    unpricedItemCount: unpricedCount,
    safetyConcernCount,
    nutritionalMismatchCount,
    insufficientDataCount,
    cleanCount,
    overviewText,
    itemsAnalysis,
  };
}

/**
 * Generate candidate improvements for all flagged items in the basket
 */
export async function generateBasketImprovements(
  items: BasketItem[],
  profile: HealthProfile
): Promise<BasketImprovementSuggestion[]> {
  const suggestions: BasketImprovementSuggestion[] = [];
  const existingProductIds = new Set(items.map((i) => i.productId.toLowerCase()));

  for (const item of items) {
    const analysis = analyzeBasketItem(item, profile);

    // Only seek replacements for items that have red, yellow, or grey flags
    if (analysis.severity === 'green') continue;

    try {
      const alternatives = await getSmartAlternatives(item.product, analysis.verdict, profile);

      // Filter out alternatives that are already in the basket
      const candidates = alternatives.filter(
        (alt) => !existingProductIds.has((alt.barcode || alt.id).toLowerCase())
      );

      if (candidates.length === 0) continue;

      // Pick top-ranked candidate that provides safety
      const bestAlt = candidates[0];

      // Calculate nutrient differences
      const sn = item.product.nutrients;
      const an = bestAlt.nutrients;

      const calcDiff = (a?: number, s?: number) => {
        if (a !== undefined && s !== undefined) {
          return Math.round((a - s) * 10) / 10;
        }
        return null;
      };

      const sugarDiff = calcDiff(an.sugar_g, sn.sugar_g);
      const carbsDiff = calcDiff(an.carbs_g, sn.carbs_g);
      const fiberDiff = calcDiff(an.fiber_g, sn.fiber_g);
      const proteinDiff = calcDiff(an.protein_g, sn.protein_g);
      const sodiumDiff = calcDiff(an.sodium_mg, sn.sodium_mg);
      const caloriesDiff = calcDiff(an.energy_kcal, sn.energy_kcal);

      // Price comparison
      const altPrice = extractPriceFromCostDetails(bestAlt.estimatedCostDetails);
      let priceComparison: BasketImprovementSuggestion['priceComparison'] = undefined;
      if (item.unitPrice !== undefined || altPrice !== undefined) {
        const oPrice = item.unitPrice ?? null;
        const aPrice = altPrice ?? null;
        const pDiff = oPrice !== null && aPrice !== null ? Math.round((aPrice - oPrice) * 100) / 100 : null;
        priceComparison = {
          originalPrice: oPrice,
          alternativePrice: aPrice,
          diff: pDiff,
        };
      }

      // Generate improvement explanation
      let improvementReason = bestAlt.explanation || 'Clean label alternative verified to align with your health constraints.';
      if (sugarDiff !== null && sugarDiff <= -5) {
        improvementReason = `Saves ${Math.abs(sugarDiff)}g of sugar per portion while eliminating ${analysis.flags[0] || 'flagged ingredients'}.`;
      } else if (analysis.concernType === 'safety_allergen') {
        improvementReason = `Eliminates your declared allergen risk with verified safe, whole-food ingredients.`;
      } else if (analysis.concernType === 'safety_lactose') {
        improvementReason = `100% plant-based dairy alternative to prevent digestive inflammation.`;
      }

      suggestions.push({
        id: `sug_${item.id}_${bestAlt.id}`,
        originalItem: item,
        originalVerdict: analysis.verdict,
        flagReason: analysis.flags[0] || 'Nutritional concern identified for your profile',
        suggestedAlternative: bestAlt,
        improvementReason,
        nutritionComparison: {
          caloriesDiff,
          sugarDiff,
          carbsDiff,
          fiberDiff,
          proteinDiff,
          sodiumDiff,
        },
        priceComparison,
      });
    } catch (err) {
      console.warn('Error generating alternative for basket item:', err);
    }
  }

  return suggestions;
}

/**
 * Compare an original basket with an improved basket side-by-side
 */
export function compareBaskets(
  originalItems: BasketItem[],
  improvedItems: BasketItem[],
  profile: HealthProfile
): BasketComparisonMetrics {
  const origSummary = analyzeBasket(originalItems, profile);
  const impSummary = analyzeBasket(improvedItems, profile);

  // Price comparison
  const origCost = origSummary.totalEstimatedCost;
  const impCost = impSummary.totalEstimatedCost;
  const costDiff = origCost !== null && impCost !== null ? Math.round((impCost - origCost) * 100) / 100 : null;

  // Calculate nutrient sums (respecting quantity)
  const sumNutrient = (items: BasketItem[], key: string) => {
    let sum = 0;
    let missing = 0;
    for (const it of items) {
      const val = it.product.nutrients[key];
      if (val !== undefined && val !== null && !isNaN(val)) {
        sum += val * it.quantity;
      } else {
        missing += 1;
      }
    }
    return { sum: Math.round(sum * 10) / 10, missing };
  };

  const oSugar = sumNutrient(originalItems, 'sugar_g');
  const iSugar = sumNutrient(improvedItems, 'sugar_g');
  const sugarDiff = Math.round((iSugar.sum - oSugar.sum) * 10) / 10;

  const oCarbs = sumNutrient(originalItems, 'carbs_g');
  const iCarbs = sumNutrient(improvedItems, 'carbs_g');
  const carbsDiff = Math.round((iCarbs.sum - oCarbs.sum) * 10) / 10;

  const oSodium = sumNutrient(originalItems, 'sodium_mg');
  const iSodium = sumNutrient(improvedItems, 'sodium_mg');
  const sodiumDiff = Math.round((iSodium.sum - oSodium.sum) * 10) / 10;

  return {
    totalCost: {
      original: origCost,
      improved: impCost,
      diff: costDiff,
      hasIncompleteData: origSummary.hasPartialPricing || impSummary.hasPartialPricing,
    },
    safetyConcerns: {
      original: origSummary.safetyConcernCount,
      improved: impSummary.safetyConcernCount,
      diff: impSummary.safetyConcernCount - origSummary.safetyConcernCount,
    },
    nutritionalMismatches: {
      original: origSummary.nutritionalMismatchCount,
      improved: impSummary.nutritionalMismatchCount,
      diff: impSummary.nutritionalMismatchCount - origSummary.nutritionalMismatchCount,
    },
    incompleteInfoProducts: {
      original: origSummary.insufficientDataCount,
      improved: impSummary.insufficientDataCount,
      diff: impSummary.insufficientDataCount - origSummary.insufficientDataCount,
    },
    nutritionalTotals: {
      sugarGrams: { original: oSugar.sum, improved: iSugar.sum, diff: sugarDiff, missingCount: oSugar.missing + iSugar.missing },
      carbsGrams: { original: oCarbs.sum, improved: iCarbs.sum, diff: carbsDiff, missingCount: oCarbs.missing + iCarbs.missing },
      sodiumMg: { original: oSodium.sum, improved: iSodium.sum, diff: sodiumDiff, missingCount: oSodium.missing + iSodium.missing },
    },
  };
}
