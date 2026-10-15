import { describe, it, expect } from 'vitest';
import {
  isAllergenSafe,
  isProfileSafe,
  getSmartAlternatives,
  filterAlternatives,
  generateProductComparison,
  inferProductCategory,
  generatePersonalisedExplanation,
} from '../alternativesEngine';
import { Product } from '../../types/product';
import { HealthProfile } from '../../types/profile';
import { VerdictResult } from '../../types/verdict';
import { SmartAlternative, AlternativeFilterState } from '../../types/alternatives';
import { CURATED_ALTERNATIVES } from '../curatedAlternatives';

// Base mock user profile
const baseProfile: HealthProfile = {
  id: 'test-user-1',
  displayName: 'Elena',
  consentGiven: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  lifeStages: [],
  diabetesType: 'none',
  lactoseIntolerant: false,
  allergies: [],
  customAllergies: [],
};

// Base mock scanned product
const sampleScannedProduct: Product = {
  name: 'Crunchy Hazelnut Milk Chocolate Bar',
  brand: 'ChocoDelight',
  source: 'openfoodfacts',
  servingUnit: 'per100g',
  servingSize: '40g',
  nutrients: {
    energy_kcal: 540,
    sugar_g: 48,
    carbs_g: 58,
    protein_g: 6,
    total_fat_g: 32,
    saturated_fat_g: 18,
    sodium_mg: 120,
  },
  ingredients: ['Sugar', 'Whole Milk Powder', 'Cocoa Butter', 'Hazelnuts', 'Soy Lecithin'],
  allergenTags: ['en:milk', 'en:nuts', 'en:soy'],
  tracesTags: ['en:peanuts'],
  additives: [],
  category: 'Snacks',
};

// Mock verdict
const sampleRedVerdict: VerdictResult = {
  overall: 'red',
  score: 30,
  allergenMatches: [],
  tracesWarnings: [],
  ruleResults: [],
  avoidIngredients: [],
  missingNutrients: [],
  softWarnings: [],
  consequences: [],
  rulesVersion: '1.0.0-draft',
};

describe('Smart Food Alternatives Engine', () => {
  // Scenario 1: Product containing a user's declared allergen
  it('strictly excludes alternatives that contain any declared allergen (allergies take precedence)', async () => {
    const peanutProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['tree_nuts'],
    };

    const alternatives = await getSmartAlternatives(sampleScannedProduct, sampleRedVerdict, peanutProfile);

    // No alternative containing tree_nuts should ever be returned
    for (const alt of alternatives) {
      expect(alt.allergens).not.toContain('tree_nuts');
      const containsNutInIngredients = alt.ingredients.some((i) =>
        /walnut|almond|cashew|pecan|hazelnut/i.test(i)
      );
      expect(containsNutInIngredients).toBe(false);
    }

    // Verify raw walnuts alternative was filtered out
    expect(alternatives.some((a) => a.id === 'alt_snack_walnuts_dark_chocolate')).toBe(false);
  });

  // Scenario 2: Lactose-sensitive user
  it('excludes any dairy-containing alternatives for lactose-sensitive users', async () => {
    const lactoseProfile: HealthProfile = {
      ...baseProfile,
      lactoseIntolerant: true,
    };

    const alternatives = await getSmartAlternatives(sampleScannedProduct, sampleRedVerdict, lactoseProfile);

    expect(alternatives.length).toBeGreaterThan(0);
    for (const alt of alternatives) {
      expect(alt.lactoseFree).toBe(true);
      expect(alt.allergens).not.toContain('milk');
      const containsDairy = alt.ingredients.some((i) =>
        /milk|whey|casein|butter|lactose/i.test(i) && !/almond milk|oat milk/i.test(i)
      );
      expect(containsDairy).toBe(false);
    }
  });

  // Scenario 3: User monitoring carbohydrate intake (Type 1 Diabetes)
  it('prioritizes lower sugar and high fiber alternatives for Type 1 Diabetes', async () => {
    const t1dProfile: HealthProfile = {
      ...baseProfile,
      diabetesType: 'type1',
    };

    const alternatives = await getSmartAlternatives(sampleScannedProduct, sampleRedVerdict, t1dProfile);
    expect(alternatives.length).toBeGreaterThan(0);

    // Top suggestions should have low sugar and clear carb information
    const topAlt = alternatives[0];
    expect(topAlt.nutrients.sugar_g).toBeLessThan(10);
    expect(topAlt.nutrients.carbs_g).toBeDefined();
    expect(topAlt.explanation).toBeDefined();
  });

  // Scenario 4: User with multiple profile constraints (Pregnancy + Lactose + Tree Nut allergy)
  it('safely handles multi-condition profiles without conflict', async () => {
    const multiProfile: HealthProfile = {
      ...baseProfile,
      lifeStages: ['pregnancy'],
      lactoseIntolerant: true,
      allergies: ['tree_nuts'],
    };

    const alternatives = await getSmartAlternatives(sampleScannedProduct, sampleRedVerdict, multiProfile);

    for (const alt of alternatives) {
      // Must be pregnancy safe
      expect(alt.pregnancySafe).toBe(true);
      // Must be lactose free
      expect(alt.lactoseFree).toBe(true);
      // Must not contain tree nuts
      expect(alt.allergens).not.toContain('tree_nuts');
    }
  });

  // Scenario 5: Product with missing ingredient or nutrient information
  it('handles products with missing ingredient or nutrient fields without crashing', async () => {
    const bareProduct: Product = {
      name: 'Unlabeled Corner Store Biscuit',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {}, // missing all nutrients
      ingredients: [], // empty ingredients
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const emptyVerdict: VerdictResult = {
      overall: 'insufficient_data',
      score: 50,
      allergenMatches: [],
      tracesWarnings: [],
      ruleResults: [],
      avoidIngredients: [],
      missingNutrients: ['Sugar', 'Sodium'],
      softWarnings: [],
      consequences: [],
      rulesVersion: '1.0.0-draft',
    };

    const alternatives = await getSmartAlternatives(bareProduct, emptyVerdict, baseProfile);
    expect(alternatives.length).toBeGreaterThan(0);

    const comparison = generateProductComparison(bareProduct, alternatives[0], baseProfile);
    expect(comparison).toBeDefined();
    // Missing nutrients should be marked as unknown rather than invented as 0
    const sugarMetric = comparison.metrics.find((m) => m.label === 'Total Sugar');
    expect(sugarMetric?.scannedDisplay).toContain('Not declared');
    expect(sugarMetric?.status).toBe('unknown');
  });

  // Scenario 6: No matching alternatives handling
  it('returns empty array when impossible filter combination is requested', () => {
    const emptyFilters: AlternativeFilterState = {
      category: 'drink',
      type: 'homemade',
      dietary: 'vegan',
      maxPrepTime: 1, // no drink prepared in <= 1 min
      nutritionGoal: 'high_protein', // drinks rarely have >= 8g protein
      budget: '$',
      onlyFavourites: false,
      searchQuery: 'non_existent_supercalifragilistic_ingredient',
    };

    const filtered = filterAlternatives(CURATED_ALTERNATIVES, emptyFilters, new Set());
    expect(filtered.length).toBe(0);
  });

  // Scenario 7: Dietary preference enforcement (Allergy overrides ordinary dietary preferences)
  it('enforces that allergy constraint overrides ordinary dietary preferences', () => {
    const altWithSoy: SmartAlternative = {
      id: 'test_tofu',
      name: 'Tofu Dish',
      category: 'dinner',
      type: 'homemade',
      description: 'Vegan tofu',
      ingredients: ['Organic Soy Tofu'],
      servingSize: '200g',
      estimatedCost: '$',
      nutrients: { energy_kcal: 200, protein_g: 15 },
      allergens: ['soy'],
      dietaryTags: ['vegan', 'vegetarian'],
      pregnancySafe: true,
      breastfeedingSafe: true,
      lactoseFree: true,
      source: 'curated_verified',
      safetyConfidence: 'verified',
    };

    // User is vegan, BUT has soy allergy
    const veganWithSoyAllergy: HealthProfile = {
      ...baseProfile,
      allergies: ['soy'],
      dietaryPreference: 'vegan',
    };

    const check = isProfileSafe(altWithSoy, veganWithSoyAllergy);
    // Allergy must override: safe should be FALSE because of soy
    expect(check.safe).toBe(false);
    expect(check.reason).toContain('soy');
  });

  // Scenario 8: Product comparison generation & difference calculation
  it('accurately calculates side-by-side nutrient differences and labels better/worse', () => {
    const alt: SmartAlternative = CURATED_ALTERNATIVES[0]; // roasted chickpeas (sugar: 2.1g, protein: 6.2g)
    const comparison = generateProductComparison(sampleScannedProduct, alt, baseProfile);

    expect(comparison.scannedProduct.name).toBe(sampleScannedProduct.name);
    expect(comparison.alternative.name).toBe(alt.name);

    const sugarMetric = comparison.metrics.find((m) => m.label === 'Total Sugar');
    expect(sugarMetric).toBeDefined();
    // 2.1 - 48 = -45.9g sugar
    expect(sugarMetric?.difference).toBeCloseTo(-45.9, 1);
    expect(sugarMetric?.status).toBe('better'); // lower sugar is better
  });

  // Scenario 9: Category inference
  it('correctly infers categories for varied packaged items', () => {
    expect(inferProductCategory({ name: 'Oatmeal Porridge', category: 'Cereals' } as Product)).toBe('breakfast');
    expect(inferProductCategory({ name: 'Sparkling Lemon Beverage' } as Product)).toBe('drink');
    expect(inferProductCategory({ name: 'Tortilla Corn Chips' } as Product)).toBe('snack');
    expect(inferProductCategory({ name: 'Creamy Tomato Soup' } as Product)).toBe('lunch');
    expect(inferProductCategory({ name: 'Rigatoni Pasta Bake' } as Product)).toBe('dinner');
  });
});
