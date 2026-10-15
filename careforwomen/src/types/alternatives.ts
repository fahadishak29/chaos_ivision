import { NutrientData } from './product';
import { Allergen, LifeStage, DiabetesType } from './profile';

export type MealCategory = 'snack' | 'breakfast' | 'lunch' | 'dinner' | 'drink';
export type AlternativeType = 'packaged' | 'homemade';
export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'low_glycemic'
  | 'low_sodium'
  | 'high_protein'
  | 'pregnancy_safe';

export type BudgetTier = '$' | '$$' | '$$$';

export interface SmartAlternative {
  id: string;
  name: string;
  brand?: string; // only for verified packaged products
  barcode?: string;
  category: MealCategory;
  type: AlternativeType;
  imageUrl?: string;
  imageEmoji?: string;
  description: string;
  ingredients: string[];
  servingSize: string; // e.g. "1 bowl (180g)", "1 cup (240ml)", "30g"
  prepTimeMinutes?: number; // for homemade, e.g. 5, 10
  estimatedCost: BudgetTier;
  estimatedCostDetails?: string; // e.g. "~$1.20 / serving"
  instructions?: string[]; // step-by-step instructions for homemade recipes
  nutrients: NutrientData; // Calories, carbs, sugar, added_sugar, protein, total_fat, saturated_fat, sodium, fiber
  allergens: Allergen[]; // allergens present
  dietaryTags: DietaryTag[];
  pregnancySafe: boolean;
  breastfeedingSafe: boolean;
  lactoseFree: boolean;
  source: 'curated_verified' | 'openfoodfacts' | 'ai_suggested';
  safetyConfidence: 'verified' | 'high_confidence' | 'unverified_data';
  explanation?: string; // Dynamic explainable personalisation reason
  matchScore?: number; // Relevance score
  comparisonHighlights?: string[]; // Quick badges like "-14g Sugar", "Dairy Free"
}

export interface ProductComparisonMetric {
  label: string;
  unit: string;
  scannedValue: number | null;
  scannedDisplay: string;
  altValue: number | null;
  altDisplay: string;
  difference: number | null; // alt - scanned (negative means lower)
  diffDisplay: string | null;
  status: 'better' | 'worse' | 'neutral' | 'unknown';
  notes?: string;
}

export interface ProductComparisonData {
  scannedProduct: {
    name: string;
    brand?: string;
    imageUrl?: string;
    servingSize?: string;
    servingUnit: string;
    allergens: string[];
  };
  alternative: SmartAlternative;
  metrics: ProductComparisonMetric[];
  safetySummary: string;
  allergenSummary: string;
}

export interface AlternativeFilterState {
  category: 'all' | MealCategory;
  type: 'all' | AlternativeType;
  dietary: 'all' | 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free';
  maxPrepTime: number | 'any'; // in minutes, e.g. 10, 20
  nutritionGoal: 'all' | 'low_sugar' | 'low_carb' | 'high_protein' | 'low_sodium';
  budget: 'all' | BudgetTier;
  onlyFavourites: boolean;
  searchQuery: string;
}
