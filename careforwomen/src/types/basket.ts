import { Product } from './product';
import { VerdictResult } from './verdict';
import { SmartAlternative } from './alternatives';

export type BasketItemConcernType =
  | 'safety_allergen'
  | 'safety_pregnancy'
  | 'safety_lactose'
  | 'nutritional_mismatch'
  | 'insufficient_data'
  | 'clean';

export interface BasketItem {
  id: string; // Unique UUID in basket
  productId: string; // Barcode or unique product identifier
  product: Product;
  quantity: number;
  unitPrice?: number; // Verified or estimated price in currency
  priceEstimated?: boolean; // True if price is an estimate
  currency?: string; // Default '$'
  addedAt: string; // ISO string
  origin: 'scanner' | 'alternative' | 'manual';
  alternativeData?: SmartAlternative; // Retained if added from Smart Alternatives
}

export interface BasketItemAnalysis {
  item: BasketItem;
  verdict: VerdictResult;
  concernType: BasketItemConcernType;
  flags: string[]; // Specific human-readable reasons (e.g. "Declared allergen: Peanuts")
  severity: 'red' | 'yellow' | 'grey' | 'green';
}

export interface BasketIntelligenceSummary {
  totalUniqueProducts: number;
  totalUnits: number;
  totalEstimatedCost: number | null; // Null if no prices available
  hasPartialPricing: boolean;
  pricedItemCount: number;
  unpricedItemCount: number;
  safetyConcernCount: number; // Red / allergen / strict medical limit
  nutritionalMismatchCount: number; // Yellow rule limits
  insufficientDataCount: number; // Incomplete data
  cleanCount: number; // Green compliant
  overviewText: string;
  itemsAnalysis: BasketItemAnalysis[];
}

export interface BasketImprovementSuggestion {
  id: string;
  originalItem: BasketItem;
  originalVerdict: VerdictResult;
  flagReason: string;
  suggestedAlternative: SmartAlternative;
  improvementReason: string;
  nutritionComparison: {
    caloriesDiff: number | null;
    sugarDiff: number | null;
    carbsDiff: number | null;
    fiberDiff: number | null;
    proteinDiff: number | null;
    sodiumDiff: number | null;
  };
  priceComparison?: {
    originalPrice: number | null;
    alternativePrice: number | null;
    diff: number | null;
  };
}

export interface BasketComparisonMetrics {
  totalCost: {
    original: number | null;
    improved: number | null;
    diff: number | null;
    hasIncompleteData: boolean;
  };
  safetyConcerns: {
    original: number;
    improved: number;
    diff: number;
  };
  nutritionalMismatches: {
    original: number;
    improved: number;
    diff: number;
  };
  incompleteInfoProducts: {
    original: number;
    improved: number;
    diff: number;
  };
  nutritionalTotals: {
    sugarGrams: { original: number | null; improved: number | null; diff: number | null; missingCount: number };
    carbsGrams: { original: number | null; improved: number | null; diff: number | null; missingCount: number };
    sodiumMg: { original: number | null; improved: number | null; diff: number | null; missingCount: number };
  };
}

export interface BasketUndoAction {
  type: 'replace' | 'remove' | 'clear';
  timestamp: number;
  previousItem?: BasketItem;
  replacedWithId?: string;
  previousBasket?: BasketItem[];
}
