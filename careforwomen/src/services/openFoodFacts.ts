import { Product } from '../types/product';
import { normalizeOffProduct } from '../engine/unitNormalizer';

const USER_AGENT = 'SHEScan/1.0 (contact@shescan.app)';
const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product';

// In-memory session cache to prevent redundant network requests
const productMemoryCache = new Map<string, Product>();

// Verified offline database for regional products (e.g. India SKUs not yet on global OFF)
const KNOWN_PRODUCTS: Record<string, Product> = {
  '8901491103860': {
    barcode: '8901491103860',
    name: 'Quaker Oats (100% Wholegrain Rolled Oats)',
    brand: 'Quaker',
    category: 'Breakfast Cereals & Oats',
    source: 'openfoodfacts',
    servingUnit: 'per100g',
    servingSize: '40g',
    nutrients: {
      energy_kcal: 395,
      sugar_g: 0.5,
      added_sugar_g: 0,
      saturated_fat_g: 1.5,
      total_fat_g: 8.0,
      sodium_mg: 6,
      fiber_g: 10.2,
      protein_g: 12.5,
      carbs_g: 66.5,
    },
    ingredients: ['Rolled Oats (100%)'],
    allergenTags: ['en:gluten'],
    tracesTags: [],
    additives: [],
  },
  '8901491001012': {
    barcode: '8901491001012',
    name: 'Quaker Oats (100% Whole Grain)',
    brand: 'Quaker',
    category: 'Breakfast Cereals & Oats',
    source: 'openfoodfacts',
    servingUnit: 'per100g',
    servingSize: '40g',
    nutrients: {
      energy_kcal: 395,
      sugar_g: 0.5,
      added_sugar_g: 0,
      saturated_fat_g: 1.5,
      total_fat_g: 8.0,
      sodium_mg: 6,
      fiber_g: 10.2,
      protein_g: 12.5,
      carbs_g: 66.5,
    },
    ingredients: ['Rolled Oats (100%)'],
    allergenTags: ['en:gluten'],
    tracesTags: [],
    additives: [],
  },
};

export interface FetchProductResult {
  product: Product | null;
  status: 'success' | 'not_found' | 'network_error' | 'rate_limited';
  error?: string;
}

export async function fetchProductByBarcode(barcode: string): Promise<FetchProductResult> {
  const cleanBarcode = barcode.trim();

  // 1. Check memory cache first
  if (productMemoryCache.has(cleanBarcode)) {
    return {
      product: productMemoryCache.get(cleanBarcode)!,
      status: 'success',
    };
  }

  // 2. Check verified offline products
  if (KNOWN_PRODUCTS[cleanBarcode]) {
    const product = KNOWN_PRODUCTS[cleanBarcode];
    productMemoryCache.set(cleanBarcode, product);
    return {
      product,
      status: 'success',
    };
  }

  // 2. Check offline status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      product: null,
      status: 'network_error',
      error: 'Device is offline. Internet connection required to query product database.',
    };
  }

  try {
    const response = await fetch(`${OFF_API_BASE}/${cleanBarcode}.json`, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return { product: null, status: 'not_found' };
    }

    if (response.status === 429) {
      return {
        product: null,
        status: 'rate_limited',
        error: 'Open Food Facts is receiving too many requests. Please wait a moment.',
      };
    }

    if (!response.ok) {
      return {
        product: null,
        status: 'network_error',
        error: `Product server returned error ${response.status}`,
      };
    }

    const json = await response.json();

    if (!json || json.status === 0 || !json.product) {
      return { product: null, status: 'not_found' };
    }

    const normalized = normalizeOffProduct(json.product);
    productMemoryCache.set(cleanBarcode, normalized);

    return {
      product: normalized,
      status: 'success',
    };
  } catch (err: any) {
    return {
      product: null,
      status: 'network_error',
      error: err.message || 'Unable to connect to Open Food Facts database.',
    };
  }
}
