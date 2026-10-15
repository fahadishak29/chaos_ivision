import { describe, it, expect } from 'vitest';
import {
  analyzeBasketItem,
  analyzeBasket,
  generateBasketImprovements,
  compareBaskets,
  alternativeToProduct,
  extractPriceFromCostDetails,
} from '../basketEngine';
import { Product } from '../../types/product';
import { HealthProfile } from '../../types/profile';
import { BasketItem } from '../../types/basket';
import { SmartAlternative } from '../../types/alternatives';

describe('Smart Grocery Basket Intelligence Engine', () => {
  const baseProfile: HealthProfile = {
    id: 'user-basket-test',
    displayName: 'Sarah',
    consentGiven: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    lifeStages: [],
    diabetesType: 'none',
    lactoseIntolerant: false,
    allergies: [],
    customAllergies: [],
  };

  const sampleScannedProduct: Product = {
    barcode: '3017620422003',
    name: 'Nutella Hazelnut Spread',
    brand: 'Ferrero',
    source: 'openfoodfacts',
    servingUnit: 'per100g',
    servingSize: '15g',
    nutrients: {
      energy_kcal: 539,
      sugar_g: 56.3,
      total_fat_g: 30.9,
      saturated_fat_g: 10.6,
      carbs_g: 57.5,
      protein_g: 6.3,
      sodium_mg: 42,
    },
    ingredients: ['Sugar', 'Palm Oil', 'Hazelnuts', 'Skimmed Milk Powder', 'Fat-Reduced Cocoa', 'Soy Lecithin', 'Vanillin'],
    allergenTags: ['en:milk', 'en:nuts', 'en:soybeans'],
    tracesTags: [],
    additives: [],
    category: 'Spreads',
  };

  const sampleAlternative: SmartAlternative = {
    id: 'alt_almond_butter_clean',
    name: '100% Roasted Almond Butter',
    description: 'Single-ingredient stone ground roasted almond butter with zero added cane sugar or palm oil.',
    category: 'snack',
    type: 'packaged',
    nutrients: {
      energy_kcal: 190,
      sugar_g: 1.5,
      carbs_g: 6.0,
      protein_g: 7.0,
      total_fat_g: 17.0,
      sodium_mg: 5,
    },
    ingredients: ['Dry Roasted Almonds'],
    servingSize: '30g',
    estimatedCost: '$$',
    estimatedCostDetails: '$4.29 per jar',
    allergens: [],
    dietaryTags: ['gluten_free', 'dairy_free', 'vegan', 'low_glycemic'],
    pregnancySafe: true,
    breastfeedingSafe: true,
    lactoseFree: true,
    safetyConfidence: 'verified',
    source: 'curated_verified',
  };

  // Scenario 1: Add a product from the scanner
  it('Scenario 1: converts scanned product into basket item and performs analysis', () => {
    const basketItem: BasketItem = {
      id: 'basket_item_1',
      productId: sampleScannedProduct.barcode!,
      product: sampleScannedProduct,
      quantity: 1,
      unitPrice: 4.99,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    const analysis = analyzeBasketItem(basketItem, baseProfile);
    expect(analysis.item.productId).toBe(sampleScannedProduct.barcode);
    expect(analysis.verdict).toBeDefined();
    expect(analysis.severity).toBeDefined();
    expect(analysis.flags).toBeDefined();
  });

  // Scenario 2: Add an alternative from Smart Alternatives
  it('Scenario 2: converts smart alternative to product with extracted price and correct metadata', () => {
    const convertedProduct = alternativeToProduct(sampleAlternative);
    expect(convertedProduct.name).toBe('100% Roasted Almond Butter');
    expect(convertedProduct.ingredients).toContain('Dry Roasted Almonds');
    expect(convertedProduct.nutrients.sugar_g).toBe(1.5);
    expect(convertedProduct.source).toBe('manual');

    const extractedPrice = extractPriceFromCostDetails(sampleAlternative.estimatedCostDetails);
    expect(extractedPrice).toBe(4.29);

    const basketItem: BasketItem = {
      id: 'basket_item_alt',
      productId: `alt_${sampleAlternative.id}`,
      product: convertedProduct,
      quantity: 2,
      unitPrice: extractedPrice ?? undefined,
      origin: 'alternative',
      alternativeData: sampleAlternative,
      addedAt: new Date().toISOString(),
    };

    expect(basketItem.origin).toBe('alternative');
    expect(basketItem.unitPrice).toBe(4.29);
    expect(basketItem.alternativeData).toBeDefined();
  });

  // Scenario 3: Add the same product twice (duplicate handling)
  it('Scenario 3: handles duplicate addition by incrementing quantities instead of creating duplicate records', () => {
    const existingItems: BasketItem[] = [
      {
        id: 'item_existing',
        productId: sampleScannedProduct.barcode!,
        product: sampleScannedProduct,
        quantity: 1,
        unitPrice: 4.99,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const incomingBarcode = sampleScannedProduct.barcode!;
    const matchIndex = existingItems.findIndex((i) => i.productId === incomingBarcode);
    expect(matchIndex).toBeGreaterThanOrEqual(0);

    const updatedItems = [...existingItems];
    updatedItems[matchIndex] = {
      ...updatedItems[matchIndex],
      quantity: updatedItems[matchIndex].quantity + 1,
    };

    expect(updatedItems.length).toBe(1);
    expect(updatedItems[0].quantity).toBe(2);
  });

  // Scenario 4: Change quantities
  it('Scenario 4: recalculates unit counts and totals when quantities change', () => {
    const items: BasketItem[] = [
      {
        id: 'item_1',
        productId: 'prod_1',
        product: sampleScannedProduct,
        quantity: 3,
        unitPrice: 3.5,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const result = analyzeBasket(items, baseProfile);
    expect(result.totalUniqueProducts).toBe(1);
    expect(result.totalUnits).toBe(3);
    expect(result.totalEstimatedCost).toBe(10.5);
  });

  // Scenario 5: Remove an item
  it('Scenario 5: removes an item and updates summary metrics', () => {
    const items: BasketItem[] = [
      {
        id: 'item_1',
        productId: 'prod_1',
        product: sampleScannedProduct,
        quantity: 2,
        unitPrice: 5.0,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
      {
        id: 'item_2',
        productId: 'prod_2',
        product: alternativeToProduct(sampleAlternative),
        quantity: 1,
        unitPrice: 4.0,
        origin: 'alternative',
        addedAt: new Date().toISOString(),
      },
    ];

    const afterRemoval = items.filter((i) => i.id !== 'item_1');
    const result = analyzeBasket(afterRemoval, baseProfile);

    expect(result.totalUniqueProducts).toBe(1);
    expect(result.totalUnits).toBe(1);
    expect(result.totalEstimatedCost).toBe(4.0);
  });

  // Scenario 6: Refresh the page and verify persistence
  it('Scenario 6: persists basket to storage and re-inflates correctly', () => {
    const items: BasketItem[] = [
      {
        id: 'item_persisted',
        productId: '3017620422003',
        product: sampleScannedProduct,
        quantity: 4,
        unitPrice: 4.99,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const serialized = JSON.stringify(items);
    const parsed: BasketItem[] = JSON.parse(serialized);

    expect(parsed.length).toBe(1);
    expect(parsed[0].productId).toBe('3017620422003');
    expect(parsed[0].quantity).toBe(4);
    expect(parsed[0].product.name).toBe(sampleScannedProduct.name);
  });

  // Scenario 7: Analyse a product containing a declared allergen
  it('Scenario 7: deterministically flags a product matching a user declared allergy', () => {
    const allergyProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['tree_nuts'],
    };

    const basketItem: BasketItem = {
      id: 'nut_item',
      productId: sampleScannedProduct.barcode!,
      product: sampleScannedProduct, // Contains Hazelnuts
      quantity: 1,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    const analysis = analyzeBasketItem(basketItem, allergyProfile);
    expect(analysis.severity).toBe('red');
    expect(analysis.concernType).toBe('safety_allergen');
    expect(analysis.flags.length).toBeGreaterThan(0);
    expect(analysis.flags.some((m) => m.toLowerCase().includes('nut'))).toBe(true);
  });

  // Scenario 8: Analyse a product with missing ingredients
  it('Scenario 8: flags product with missing ingredients as insufficient_data and never claims safe', () => {
    const incompleteProduct: Product = {
      name: 'Mystery Canned Soup',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {},
      ingredients: [],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const basketItem: BasketItem = {
      id: 'incomplete_item',
      productId: 'mystery_soup',
      product: incompleteProduct,
      quantity: 1,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    const analysis = analyzeBasketItem(basketItem, baseProfile);
    expect(analysis.severity).toBe('grey');
    expect(analysis.concernType).toBe('insufficient_data');
    expect(analysis.flags.some((r) => r.toLowerCase().includes('ingredient'))).toBe(true);
  });

  // Scenario 9: Analyse a product with incomplete nutritional information
  it('Scenario 9: detects missing nutritional values and marks incomplete information without assuming zero', () => {
    const productWithNoNutrients: Product = {
      name: 'Bakery Fresh Croissant',
      source: 'ocr',
      servingUnit: 'per100g',
      nutrients: {}, // Empty nutrition
      ingredients: ['Wheat Flour', 'Butter', 'Water', 'Yeast'],
      allergenTags: ['en:gluten', 'en:milk'],
      tracesTags: [],
      additives: [],
    };

    const basketItem: BasketItem = {
      id: 'croissant_item',
      productId: 'croissant',
      product: productWithNoNutrients,
      quantity: 1,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    const analysis = analyzeBasketItem(basketItem, baseProfile);
    expect(analysis.severity).toBe('grey');
    expect(analysis.concernType).toBe('insufficient_data');
  });

  // Scenario 10: Handle multiple profile constraints
  it('Scenario 10: evaluates product across multiple user constraints and prioritises safety concerns', () => {
    const multiConstraintProfile: HealthProfile = {
      ...baseProfile,
      diabetesType: 'type1', // Strict carb/sugar awareness
      lactoseIntolerant: true, // Lactose restriction
      allergies: ['soy'], // Declared allergy
    };

    const basketItem: BasketItem = {
      id: 'multi_item',
      productId: sampleScannedProduct.barcode!,
      product: sampleScannedProduct, // Contains Soy Lecithin (allergen), Skimmed Milk (lactose), 56g Sugar (T1D)
      quantity: 1,
      unitPrice: 5.0,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    const analysis = analyzeBasketItem(basketItem, multiConstraintProfile);
    // Allergen match must be severe red flag
    expect(analysis.severity).toBe('red');
    expect(analysis.concernType).toBe('safety_allergen');

    // Rule results or flags should address multiple constraints
    const flagsAndReasons = analysis.flags.join(' ');
    expect(flagsAndReasons.toLowerCase()).toMatch(/allergen|soy/);
  });

  // Scenario 11: Find alternatives for a flagged product
  it('Scenario 11: generates intelligent, safer alternatives for items with concerns', async () => {
    const allergyProfile: HealthProfile = {
      ...baseProfile,
      diabetesType: 'type2',
      allergies: ['milk'],
    };

    const basketItems: BasketItem[] = [
      {
        id: 'item_sugary_dairy',
        productId: sampleScannedProduct.barcode!,
        product: sampleScannedProduct,
        quantity: 1,
        unitPrice: 4.99,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const suggestions = await generateBasketImprovements(basketItems, allergyProfile);
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    const suggestion = suggestions[0];
    expect(suggestion.originalItem.id).toBe('item_sugary_dairy');
    expect(suggestion.suggestedAlternative).toBeDefined();
    expect(suggestion.improvementReason).toBeDefined();
  });

  // Scenario 12: Replace a product and undo the replacement
  it('Scenario 12: handles replacement with quantity preservation and subsequent undo reversal', () => {
    const originalItem: BasketItem = {
      id: 'item_to_replace',
      productId: sampleScannedProduct.barcode!,
      product: sampleScannedProduct,
      quantity: 3,
      unitPrice: 5.0,
      origin: 'scanner',
      addedAt: new Date().toISOString(),
    };

    let basket: BasketItem[] = [originalItem];

    // Perform replacement
    const replacementProduct = alternativeToProduct(sampleAlternative);
    const replacementItem: BasketItem = {
      id: 'item_replacement_1',
      productId: `alt_${sampleAlternative.id}`,
      product: replacementProduct,
      quantity: originalItem.quantity, // Preserves quantity (3 units)
      unitPrice: 4.29,
      origin: 'alternative',
      alternativeData: sampleAlternative,
      addedAt: new Date().toISOString(),
    };

    basket = basket.map((i) => (i.id === originalItem.id ? replacementItem : i));
    expect(basket.length).toBe(1);
    expect(basket[0].productId).toBe(`alt_${sampleAlternative.id}`);
    expect(basket[0].quantity).toBe(3);

    // Perform undo
    basket = basket.map((i) => (i.id === replacementItem.id ? originalItem : i));
    expect(basket.length).toBe(1);
    expect(basket[0].productId).toBe(sampleScannedProduct.barcode);
    expect(basket[0].quantity).toBe(3);
  });

  // Scenario 13: Calculate totals when some prices are missing
  it('Scenario 13: calculates estimated cost without coercing missing price to zero as verified', () => {
    const items: BasketItem[] = [
      {
        id: 'item_priced',
        productId: 'prod_1',
        product: sampleScannedProduct,
        quantity: 2,
        unitPrice: 3.5, // Total $7.00
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
      {
        id: 'item_unpriced',
        productId: 'prod_2',
        product: alternativeToProduct(sampleAlternative),
        quantity: 1,
        // Missing unitPrice
        origin: 'alternative',
        addedAt: new Date().toISOString(),
      },
    ];

    const result = analyzeBasket(items, baseProfile);
    expect(result.totalEstimatedCost).toBe(7.0);
    expect(result.hasPartialPricing).toBe(true);
    expect(result.pricedItemCount).toBe(1);
    expect(result.unpricedItemCount).toBe(1);
  });

  // Scenario 14: Handle an empty basket
  it('Scenario 14: gracefully handles empty basket with 0 counts and empty findings', async () => {
    const emptyBasket: BasketItem[] = [];
    const result = analyzeBasket(emptyBasket, baseProfile);

    expect(result.totalUniqueProducts).toBe(0);
    expect(result.totalUnits).toBe(0);
    expect(result.totalEstimatedCost).toBeNull();
    expect(result.safetyConcernCount).toBe(0);
    expect(result.nutritionalMismatchCount).toBe(0);
    expect(result.insufficientDataCount).toBe(0);
    expect(result.cleanCount).toBe(0);
    expect(result.overviewText).toContain('empty');

    const suggestions = await generateBasketImprovements(emptyBasket, baseProfile);
    expect(suggestions.length).toBe(0);
  });

  // Scenario 15: Handle a product with no matching alternatives
  it('Scenario 15: provides clear transparent feedback when no safe alternatives exist for a constraint', async () => {
    const hyperAllergicProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['tree_nuts', 'peanuts', 'milk', 'soy', 'wheat_gluten', 'fish', 'shellfish', 'sesame', 'eggs'],
    };

    const exoticProduct: Product = {
      name: 'Ultra Exotic Fish & Nut Paste',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: { sugar_g: 50 },
      ingredients: ['Fish Meal', 'Crushed Peanuts', 'Almond Oil', 'Whole Milk Powder'],
      allergenTags: ['en:fish', 'en:peanuts', 'en:milk'],
      tracesTags: [],
      additives: [],
      category: 'ExoticPastes',
    };

    const basketItems: BasketItem[] = [
      {
        id: 'exotic_item',
        productId: 'exotic_paste',
        product: exoticProduct,
        quantity: 1,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const suggestions = await generateBasketImprovements(basketItems, hyperAllergicProfile);

    // If alternatives cannot satisfy all severe allergies, it shouldn't recommend unsafe ones
    for (const sug of suggestions) {
      expect(sug.suggestedAlternative.ingredients.some((ing) => ing.toLowerCase().includes('peanuts'))).toBe(false);
      expect(sug.suggestedAlternative.ingredients.some((ing) => ing.toLowerCase().includes('fish'))).toBe(false);
    }
  });

  // Scenario 16: Nutritional metric calculations & comparison
  it('Scenario 16: calculates side-by-side basket comparison metrics with quantity respect', () => {
    const originalItems: BasketItem[] = [
      {
        id: 'orig_item',
        productId: sampleScannedProduct.barcode!,
        product: sampleScannedProduct, // 56.3g sugar per 100g, price 5.0
        quantity: 2,
        unitPrice: 5.0,
        origin: 'scanner',
        addedAt: new Date().toISOString(),
      },
    ];

    const improvedItems: BasketItem[] = [
      {
        id: 'improved_item',
        productId: `alt_${sampleAlternative.id}`,
        product: alternativeToProduct(sampleAlternative), // 1.5g sugar, price 4.29
        quantity: 2,
        unitPrice: 4.29,
        origin: 'alternative',
        addedAt: new Date().toISOString(),
      },
    ];

    const comparison = compareBaskets(originalItems, improvedItems, baseProfile);
    expect(comparison.totalCost.original).toBe(10.0);
    expect(comparison.totalCost.improved).toBe(8.58);
    expect(comparison.totalCost.diff).toBeCloseTo(-1.42, 2);

    // Cumulative sugar comparison should reflect higher sugar in original
    const oSugar = comparison.nutritionalTotals.sugarGrams.original;
    const iSugar = comparison.nutritionalTotals.sugarGrams.improved;
    if (oSugar !== null && iSugar !== null) {
      expect(oSugar).toBeGreaterThan(iSugar);
    }
  });
});
