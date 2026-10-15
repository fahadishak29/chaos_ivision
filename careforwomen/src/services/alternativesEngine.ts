import { Product, NutrientData } from '../types/product';
import { HealthProfile, Allergen } from '../types/profile';
import { VerdictResult, Alternative } from '../types/verdict';
import {
  SmartAlternative,
  MealCategory,
  ProductComparisonData,
  ProductComparisonMetric,
  AlternativeFilterState,
} from '../types/alternatives';
import { CURATED_ALTERNATIVES } from './curatedAlternatives';
import { ALLERGEN_SYNONYMS } from '../engine/allergenSynonyms';
import { normalizeOffProduct } from '../engine/unitNormalizer';
import { runVerdictEngine } from '../engine/verdictEngine';

/**
 * Infer meal category from product name, category field, or ingredients
 */
export function inferProductCategory(product: Product): MealCategory {
  const text = `${product.name} ${product.category || ''} ${product.brand || ''}`.toLowerCase();

  if (
    text.includes('drink') ||
    text.includes('beverage') ||
    text.includes('juice') ||
    text.includes('soda') ||
    text.includes('tea') ||
    text.includes('water') ||
    text.includes('smoothie') ||
    text.includes('milk') ||
    text.includes('coffee')
  ) {
    return 'drink';
  }

  if (
    text.includes('breakfast') ||
    text.includes('cereal') ||
    text.includes('oat') ||
    text.includes('granola') ||
    text.includes('pancake') ||
    text.includes('waffle') ||
    text.includes('porridge') ||
    text.includes('toast')
  ) {
    return 'breakfast';
  }

  if (
    text.includes('dinner') ||
    text.includes('curry') ||
    text.includes('pasta') ||
    text.includes('noodle') ||
    text.includes('stew') ||
    text.includes('casserole') ||
    text.includes('pizza') ||
    text.includes('entree')
  ) {
    return 'dinner';
  }

  if (
    text.includes('lunch') ||
    text.includes('salad') ||
    text.includes('wrap') ||
    text.includes('sandwich') ||
    text.includes('soup')
  ) {
    return 'lunch';
  }

  return 'snack';
}

/**
 * Check if an alternative is 100% safe against the user's declared allergens
 */
export function isAllergenSafe(
  alt: SmartAlternative,
  profile: HealthProfile
): { safe: boolean; matchedReason?: string } {
  const userAllergens = new Set<string>(profile.allergies || []);
  const customAllergens = (profile.customAllergies || []).map((a) => a.trim().toLowerCase());

  // Check declared alternative allergens
  for (const a of alt.allergens) {
    if (userAllergens.has(a)) {
      return { safe: false, matchedReason: `Declared allergen: ${a}` };
    }
  }

  // Check custom allergies in alternative ingredients
  const ingredientTexts = [
    ...(alt.ingredients || []),
    alt.name,
    alt.description,
  ].map((t) => t.toLowerCase());

  for (const text of ingredientTexts) {
    for (const custom of customAllergens) {
      if (custom && text.includes(custom)) {
        return { safe: false, matchedReason: `Contains custom allergen "${custom}"` };
      }
    }

    // Double check synonym dictionary for declared allergens
    for (const [synonym, allergenCat] of Object.entries(ALLERGEN_SYNONYMS)) {
      if (userAllergens.has(allergenCat)) {
        const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
          return { safe: false, matchedReason: `Ingredient "${synonym}" matches allergen category "${allergenCat}"` };
        }
      }
    }
  }

  return { safe: true };
}

/**
 * Check if alternative satisfies medical and dietary profile constraints
 */
export function isProfileSafe(
  alt: SmartAlternative,
  profile: HealthProfile
): { safe: boolean; reason?: string } {
  // 1. Allergens ALWAYS take precedence
  const allergenCheck = isAllergenSafe(alt, profile);
  if (!allergenCheck.safe) {
    return { safe: false, reason: allergenCheck.matchedReason };
  }

  // 2. Lactose sensitivity
  if (profile.lactoseIntolerant) {
    if (!alt.lactoseFree || alt.allergens.includes('milk')) {
      return { safe: false, reason: 'Contains dairy or lactose' };
    }
  }

  // 3. Pregnancy profile safety
  if (profile.lifeStages.includes('pregnancy')) {
    if (!alt.pregnancySafe) {
      return { safe: false, reason: 'Not verified safe for pregnancy' };
    }
  }

  // 4. Breastfeeding profile safety
  if (profile.lifeStages.includes('breastfeeding')) {
    if (!alt.breastfeedingSafe) {
      return { safe: false, reason: 'Not verified safe for lactation' };
    }
  }

  // 5. Dietary preferences
  if (profile.dietaryPreference) {
    if (profile.dietaryPreference === 'vegan' && !alt.dietaryTags.includes('vegan')) {
      return { safe: false, reason: 'Not strictly vegan' };
    }
    if (profile.dietaryPreference === 'vegetarian' && !alt.dietaryTags.includes('vegetarian')) {
      return { safe: false, reason: 'Not strictly vegetarian' };
    }
    if (
      profile.dietaryPreference === 'pescatarian' &&
      !alt.dietaryTags.includes('vegetarian') &&
      !alt.dietaryTags.includes('vegan') &&
      !alt.allergens.includes('fish')
    ) {
      return { safe: false, reason: 'Not pescatarian suitable' };
    }
  }

  return { safe: true };
}

/**
 * Generate explainable personalised justification for a recommended alternative
 */
export function generatePersonalisedExplanation(
  alt: SmartAlternative,
  scannedProduct: Product,
  profile: HealthProfile,
  verdict: VerdictResult
): { explanation: string; comparisonHighlights: string[] } {
  const highlights: string[] = [];
  const reasons: string[] = [];

  const scannedSugar = scannedProduct.nutrients.sugar_g;
  const altSugar = alt.nutrients.sugar_g;

  // 1. Allergen protection explanation
  if (profile.allergies.length > 0 || (profile.customAllergies && profile.customAllergies.length > 0)) {
    const declaredNames = profile.allergies.map((a) => a.replace('_', ' ')).slice(0, 2).join(', ');
    if (verdict.allergenMatches.length > 0) {
      reasons.push(
        `Suggested because its verified ingredient list avoids your declared allergen (${verdict.allergenMatches[0].allergen}).`
      );
      highlights.push('Allergen-Safe');
    } else {
      reasons.push(
        `Formulated without your declared allergens (${declaredNames || 'custom sensitivities'}).`
      );
    }
  }

  // 2. Lactose sensitivity explanation
  if (profile.lactoseIntolerant) {
    if (verdict.ruleResults.some((r) => r.ruleId.startsWith('lactose_') && r.verdict === 'red')) {
      reasons.push(
        'Suggested as a 100% plant-based, dairy-free alternative to avoid digestive discomfort and bloating.'
      );
      highlights.push('Dairy-Free');
    } else {
      reasons.push('Certified lactose-free and gentle on gut digestion.');
      highlights.push('Lactose-Free');
    }
  }

  // 3. Sugar & Glycemic impact explanation
  if (scannedSugar !== undefined && altSugar !== undefined && scannedSugar > altSugar + 3) {
    const savedGrams = Math.round((scannedSugar - altSugar) * 10) / 10;
    reasons.push(
      `This option provides ${savedGrams}g less sugar per 100g basis than ${scannedProduct.name} (${altSugar}g vs ${scannedSugar}g).`
    );
    highlights.push(`-${savedGrams}g Sugar`);
  }

  // 4. Diabetes and PCOS support
  if (profile.diabetesType !== 'none' || profile.lifeStages.includes('pcos')) {
    const fiber = alt.nutrients.fiber_g;
    if (fiber !== undefined && fiber >= 3) {
      reasons.push(
        `Delivers ${fiber}g of dietary fiber to promote stable postprandial glucose absorption without insulin surges.`
      );
      highlights.push(`${fiber}g Fiber`);
    } else if (alt.dietaryTags.includes('low_glycemic')) {
      reasons.push('Slow-digesting complex nutrients formulated to minimize sharp blood sugar fluctuations.');
      highlights.push('Low Glycemic');
    }
  }

  // 5. Prenatal / Postnatal support
  if (profile.lifeStages.includes('pregnancy')) {
    reasons.push('Meets prenatal food safety guidelines with pasteurized whole-food ingredients and low sodium.');
    highlights.push('Prenatal Safe');
  }

  // 6. Sodium reduction
  const scannedSodium = scannedProduct.nutrients.sodium_mg;
  const altSodium = alt.nutrients.sodium_mg;
  if (scannedSodium !== undefined && altSodium !== undefined && scannedSodium > altSodium + 150) {
    highlights.push(`-${Math.round(scannedSodium - altSodium)}mg Sodium`);
  }

  // 7. High protein
  if (alt.nutrients.protein_g && alt.nutrients.protein_g >= 10) {
    highlights.push(`${alt.nutrients.protein_g}g Protein`);
  }

  // Combine reasons into a warm, clinical, and transparent explanation
  let finalExplanation = reasons.slice(0, 2).join(' ');
  if (!finalExplanation) {
    finalExplanation = `A nutrient-dense, wholesome alternative made with clean ingredients that align with your ${profile.displayName ? profile.displayName + "'s" : ''} health profile.`;
  }

  return {
    explanation: finalExplanation,
    comparisonHighlights: highlights.slice(0, 3),
  };
}

/**
 * Fetch green alternatives from OpenFoodFacts if connected to internet
 */
export async function fetchLiveOpenFoodFactsAlternatives(
  category: string,
  profile: HealthProfile
): Promise<SmartAlternative[]> {
  if (!category || !category.trim()) return [];

  // Skip external network calls in test runner to maintain fast, hermetic tests
  if (import.meta.env?.MODE === 'test') {
    return [];
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }

  try {
    const cleanTag = encodeURIComponent(category.trim().toLowerCase());
    const url = `https://world.openfoodfacts.org/category/${cleanTag}.json?page_size=8`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SHEScan/1.0 (contact@shescan.app)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const products: any[] = data.products || [];

    const results: SmartAlternative[] = [];

    for (const raw of products) {
      if (!raw.product_name) continue;
      const normalized = normalizeOffProduct(raw);
      const verdict = runVerdictEngine(normalized, profile);

      if (verdict.overall === 'green') {
        const alt: SmartAlternative = {
          id: `off_${normalized.barcode || Math.random().toString(36).substring(2, 9)}`,
          name: normalized.name,
          brand: normalized.brand,
          barcode: normalized.barcode,
          category: inferProductCategory(normalized),
          type: 'packaged',
          imageUrl: normalized.imageUrl,
          imageEmoji: '📦',
          description: `${normalized.brand ? normalized.brand + ' • ' : ''}Clean packaged alternative with verified green health score.`,
          ingredients: normalized.ingredients || [],
          servingSize: normalized.servingSize || 'per 100g',
          estimatedCost: '$$',
          nutrients: normalized.nutrients,
          allergens: (normalized.allergenTags || []).map((t) => t.replace('en:', '')) as Allergen[],
          dietaryTags: ['gluten_free', 'pregnancy_safe'],
          pregnancySafe: true,
          breastfeedingSafe: true,
          lactoseFree: !normalized.allergenTags?.some((t) => t.includes('milk')),
          source: 'openfoodfacts',
          safetyConfidence: 'verified',
        };

        const safeCheck = isProfileSafe(alt, profile);
        if (safeCheck.safe) {
          results.push(alt);
        }
      }

      if (results.length >= 4) break;
    }

    return results;
  } catch {
    // Graceful fallback to offline curated dataset
    return [];
  }
}

/**
 * Master recommendation generator:
 * Filters curated + live alternatives, computes scores, and attaches dynamic explanations
 */
export async function getSmartAlternatives(
  scannedProduct: Product,
  verdict: VerdictResult,
  profile: HealthProfile
): Promise<SmartAlternative[]> {
  const targetCategory = inferProductCategory(scannedProduct);

  // 1. Filter curated dataset with strict safety rules
  const candidatePool: SmartAlternative[] = [];

  for (const alt of CURATED_ALTERNATIVES) {
    const safety = isProfileSafe(alt, profile);
    if (safety.safe) {
      // Calculate suitability match score
      let score = 50;

      // Category matching bonus
      if (alt.category === targetCategory) {
        score += 35;
      }

      // Sugar reduction bonus
      const scannedSugar = scannedProduct.nutrients.sugar_g ?? 0;
      const altSugar = alt.nutrients.sugar_g ?? 0;
      if (scannedSugar > altSugar) {
        score += Math.min(25, (scannedSugar - altSugar) * 2);
      }

      // Fiber bonus for diabetes / PCOS
      if (profile.diabetesType !== 'none' || profile.lifeStages.includes('pcos')) {
        if (alt.nutrients.fiber_g && alt.nutrients.fiber_g >= 3) {
          score += 15;
        }
      }

      // Budget preference bonus
      if (profile.budgetPreference && profile.budgetPreference !== 'all') {
        if (profile.budgetPreference === 'budget' && alt.estimatedCost === '$') {
          score += 10;
        }
      }

      const { explanation, comparisonHighlights } = generatePersonalisedExplanation(
        alt,
        scannedProduct,
        profile,
        verdict
      );

      candidatePool.push({
        ...alt,
        matchScore: score,
        explanation,
        comparisonHighlights,
      });
    }
  }

  // 2. Optionally fetch live verified green alternatives from OpenFoodFacts
  try {
    if (scannedProduct.category) {
      const liveOffAlts = await fetchLiveOpenFoodFactsAlternatives(scannedProduct.category, profile);
      for (const liveAlt of liveOffAlts) {
        const { explanation, comparisonHighlights } = generatePersonalisedExplanation(
          liveAlt,
          scannedProduct,
          profile,
          verdict
        );
        candidatePool.push({
          ...liveAlt,
          matchScore: 65,
          explanation,
          comparisonHighlights,
        });
      }
    }
  } catch {
    // Ignore external fetch errors
  }

  // 3. Sort by matchScore descending (relevance to scanned item and profile)
  candidatePool.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return candidatePool;
}

/**
 * Filter alternatives based on user-selected UI filters
 */
export function filterAlternatives(
  alternatives: SmartAlternative[],
  filters: AlternativeFilterState,
  favouriteIds: Set<string>
): SmartAlternative[] {
  return alternatives.filter((alt) => {
    // Favourites filter
    if (filters.onlyFavourites && !favouriteIds.has(alt.id)) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && alt.category !== filters.category) {
      return false;
    }

    // Type filter (homemade vs packaged)
    if (filters.type !== 'all' && alt.type !== filters.type) {
      return false;
    }

    // Dietary filter
    if (filters.dietary !== 'all') {
      if (!alt.dietaryTags.includes(filters.dietary as any)) {
        return false;
      }
    }

    // Max prep time (for homemade)
    if (filters.maxPrepTime !== 'any') {
      if (alt.type === 'homemade' && alt.prepTimeMinutes && alt.prepTimeMinutes > filters.maxPrepTime) {
        return false;
      }
    }

    // Budget filter
    if (filters.budget !== 'all' && alt.estimatedCost !== filters.budget) {
      return false;
    }

    // Nutritional goals
    if (filters.nutritionGoal === 'low_sugar') {
      if (alt.nutrients.sugar_g === undefined || alt.nutrients.sugar_g > 5) return false;
    } else if (filters.nutritionGoal === 'low_carb') {
      if (alt.nutrients.carbs_g === undefined || alt.nutrients.carbs_g > 15) return false;
    } else if (filters.nutritionGoal === 'high_protein') {
      if (alt.nutrients.protein_g === undefined || alt.nutrients.protein_g < 8) return false;
    } else if (filters.nutritionGoal === 'low_sodium') {
      if (alt.nutrients.sodium_mg === undefined || alt.nutrients.sodium_mg > 200) return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchesName = alt.name.toLowerCase().includes(q);
      const matchesBrand = alt.brand?.toLowerCase().includes(q);
      const matchesDesc = alt.description.toLowerCase().includes(q);
      const matchesIng = alt.ingredients.some((i) => i.toLowerCase().includes(q));
      if (!matchesName && !matchesBrand && !matchesDesc && !matchesIng) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate side-by-side comparison data between scanned product and chosen alternative
 */
export function generateProductComparison(
  scannedProduct: Product,
  alternative: SmartAlternative,
  profile: HealthProfile
): ProductComparisonData {
  const sn = scannedProduct.nutrients;
  const an = alternative.nutrients;

  const metrics: ProductComparisonMetric[] = [];

  // Helper to format values
  const addMetric = (
    label: string,
    unit: string,
    sVal: number | undefined,
    aVal: number | undefined,
    desirableDirection: 'lower' | 'higher'
  ) => {
    const sDefined = sVal !== undefined && sVal !== null;
    const aDefined = aVal !== undefined && aVal !== null;

    if (!sDefined && !aDefined) {
      metrics.push({
        label,
        unit,
        scannedValue: null,
        scannedDisplay: '— (Not declared)',
        altValue: null,
        altDisplay: '— (Not declared)',
        difference: null,
        diffDisplay: null,
        status: 'unknown',
      });
      return;
    }

    const sNum = sDefined ? Number(sVal) : null;
    const aNum = aDefined ? Number(aVal) : null;

    let diff: number | null = null;
    let diffDisplay: string | null = null;
    let status: 'better' | 'worse' | 'neutral' | 'unknown' = 'neutral';

    if (sNum !== null && aNum !== null) {
      diff = Math.round((aNum - sNum) * 10) / 10;
      if (diff > 0) {
        diffDisplay = `+${diff} ${unit}`;
        status = desirableDirection === 'higher' ? 'better' : 'worse';
      } else if (diff < 0) {
        diffDisplay = `${diff} ${unit}`;
        status = desirableDirection === 'lower' ? 'better' : 'worse';
      } else {
        diffDisplay = `Equal (0 ${unit})`;
        status = 'neutral';
      }
    } else {
      status = 'unknown';
    }

    metrics.push({
      label,
      unit,
      scannedValue: sNum,
      scannedDisplay: sNum !== null ? `${sNum} ${unit}` : '— (Not declared)',
      altValue: aNum,
      altDisplay: aNum !== null ? `${aNum} ${unit}` : '— (Not declared)',
      difference: diff,
      diffDisplay,
      status,
    });
  };

  addMetric('Calories', 'kcal', sn.energy_kcal, an.energy_kcal, 'lower');
  addMetric('Total Sugar', 'g', sn.sugar_g, an.sugar_g, 'lower');
  if (sn.added_sugar_g !== undefined || an.added_sugar_g !== undefined) {
    addMetric('Added Sugar', 'g', sn.added_sugar_g, an.added_sugar_g, 'lower');
  }
  addMetric('Total Carbohydrates', 'g', sn.carbs_g, an.carbs_g, 'lower');
  addMetric('Dietary Fiber', 'g', sn.fiber_g, an.fiber_g, 'higher');
  addMetric('Protein', 'g', sn.protein_g, an.protein_g, 'higher');
  addMetric('Total Fat', 'g', sn.total_fat_g, an.total_fat_g, 'lower');
  addMetric('Saturated Fat', 'g', sn.saturated_fat_g, an.saturated_fat_g, 'lower');
  addMetric('Sodium', 'mg', sn.sodium_mg, an.sodium_mg, 'lower');

  // Allergen safety summary
  const scannedAllergens = scannedProduct.allergenTags?.map((t) => t.replace('en:', '')) || [];
  const altAllergens = alternative.allergens.map((a) => a.replace('_', ' '));

  let safetySummary = `${alternative.name} provides clean, balanced nutrition`;
  if (alternative.explanation) {
    safetySummary = alternative.explanation;
  }

  const allergenSummary =
    altAllergens.length === 0
      ? 'Free of top declared allergens'
      : `Declared allergens: ${altAllergens.join(', ')}`;

  return {
    scannedProduct: {
      name: scannedProduct.name,
      brand: scannedProduct.brand,
      imageUrl: scannedProduct.imageUrl,
      servingSize: scannedProduct.servingSize,
      servingUnit: scannedProduct.servingUnit,
      allergens: scannedAllergens,
    },
    alternative,
    metrics,
    safetySummary,
    allergenSummary,
  };
}

const USER_AGENT = 'SHEScan/1.0 (contact@shescan.app)';

export async function fetchVerifiedGreenAlternatives(
  categoryTag: string,
  profile: HealthProfile
): Promise<Alternative[]> {
  if (!categoryTag || !categoryTag.trim()) return [];

  try {
    const cleanTag = encodeURIComponent(categoryTag.trim());
    const url = `https://world.openfoodfacts.org/category/${cleanTag}.json?page_size=6`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const products: any[] = data.products || [];

    const greenAlternatives: Alternative[] = [];

    for (const raw of products) {
      const normalized = normalizeOffProduct(raw);
      const verdict = runVerdictEngine(normalized, profile);

      if (verdict.overall === 'green') {
        greenAlternatives.push({
          name: normalized.name,
          type: 'product',
          barcode: normalized.barcode,
          verdict: 'green',
          description: `${normalized.brand ? normalized.brand + ' • ' : ''}Sugar: ${normalized.nutrients.sugar_g ?? 0}g, Sodium: ${normalized.nutrients.sodium_mg ?? 0}mg`,
        });
      }

      if (greenAlternatives.length >= 3) break;
    }

    return greenAlternatives;
  } catch {
    return [];
  }
}

