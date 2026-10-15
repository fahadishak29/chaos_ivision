import React, { useState } from 'react';
import {
  Search,
  ScanLine,
  Upload,
  Camera,
  Check,
  FileText,
  Info,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { NutriButton } from '../../components/ui/NutriButton';
import { NutriVerdictBadge } from '../../components/ui/NutriVerdictBadge';
import { ProductArt } from '../../components/ui/ProductArt';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { LabelUploader } from '../../components/scanner/LabelUploader';
import { fetchProductByBarcode } from '../../services/openFoodFacts';
import { runVerdictEngine } from '../../engine/verdictEngine';
import { explainVerdict } from '../../services/edgeFunctions';
import { useProfile } from '../../context/ProfileContext';
import { useHistory } from '../../context/HistoryContext';
import { Product } from '../../types/product';
import { ScanRecord } from '../../types/scan';
import { v4 as uuidv4 } from 'uuid';

export interface ScanScreenProps {
  onBack: () => void;
  onScanComplete: (record: ScanRecord) => void;
  onStartReview: (extractedData: Partial<Product>) => void;
}

export const DEMO_PRODUCTS: Product[] = [
  {
    barcode: 'demo-oat',
    name: 'Oat & Seed Granola',
    brand: 'Field Day',
    category: 'Breakfast',
    source: 'manual',
    servingUnit: 'per100g',
    servingSize: '40g',
    nutrients: {
      energy_kcal: 390,
      sugar_g: 3.5,
      added_sugar_g: 0,
      saturated_fat_g: 1.2,
      total_fat_g: 7.0,
      sodium_mg: 45,
      fiber_g: 5.0,
      protein_g: 6.0,
      carbs_g: 58,
    },
    ingredients: ['Whole grain oats', 'Pumpkin seeds', 'Chia seeds', 'Cinnamon', 'Sea salt'],
    allergenTags: [],
    tracesTags: [],
    additives: [],
  },
  {
    barcode: 'demo-yogurt',
    name: 'Strawberry Yogurt',
    brand: 'Morrow Farms',
    category: 'Dairy',
    source: 'manual',
    servingUnit: 'per100g',
    servingSize: '150g',
    nutrients: {
      energy_kcal: 140,
      sugar_g: 16.0,
      added_sugar_g: 14.0,
      saturated_fat_g: 2.5,
      total_fat_g: 3.5,
      sodium_mg: 85,
      fiber_g: 0.5,
      protein_g: 5.0,
      carbs_g: 22,
    },
    ingredients: ['Cultured milk', 'Strawberries', 'Cane sugar', 'Natural flavor', 'Pectin'],
    allergenTags: ['en:milk'],
    tracesTags: [],
    additives: ['Pectin'],
  },
  {
    barcode: 'demo-cookie',
    name: 'Chocolate Chip Cookies',
    brand: 'Sunday Market',
    category: 'Snacks',
    source: 'manual',
    servingUnit: 'per100g',
    servingSize: '30g',
    nutrients: {
      energy_kcal: 480,
      sugar_g: 28.0,
      added_sugar_g: 18.0,
      saturated_fat_g: 9.0,
      total_fat_g: 22.0,
      sodium_mg: 290,
      fiber_g: 2.0,
      protein_g: 5.5,
      carbs_g: 64,
    },
    ingredients: ['Wheat flour', 'Cane sugar', 'Butter', 'Peanuts', 'Chocolate chips', 'Eggs'],
    allergenTags: ['en:peanuts', 'en:milk', 'en:gluten', 'en:eggs'],
    tracesTags: [],
    additives: [],
  },
];

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onBack: _onBack,
  onScanComplete,
  onStartReview,
}) => {
  const { profile } = useProfile();
  const { addScan } = useHistory();

  // State
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<Product>(DEMO_PRODUCTS[0]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scan modes: 'manual' (search/inputs) | 'camera' (live webcam) | 'ocr' (label photo)
  const [activeMode, setActiveMode] = useState<'input' | 'camera' | 'ocr'>('input');

  // Filter demo products by search query
  const filteredDemos = DEMO_PRODUCTS.filter((p) =>
    `${p.name} ${p.brand || ''} ${p.category || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Shared processing function: runs verdict engine, fetches AI explanation, saves scan record
  const processProductAssessment = async (product: Product, source: 'openfoodfacts' | 'ocr' | 'manual') => {
    if (!profile) return;
    setLoading(true);
    setLoadingMessage(`Evaluating ${product.name} against your health profile…`);
    setErrorMsg(null);

    try {
      // 1. Run deterministic rule engine
      const verdict = runVerdictEngine(product, profile);

      // 2. Fetch AI / deterministic explanation
      const conditionSummaries = [
        ...profile.lifeStages.map((s) => s.toUpperCase()),
        profile.diabetesType !== 'none' ? profile.diabetesType.toUpperCase() : null,
        profile.lactoseIntolerant ? 'Lactose Intolerant' : null,
      ].filter(Boolean) as string[];

      const explResult = await explainVerdict(
        product,
        verdict,
        conditionSummaries,
        profile.allergies,
        profile.id
      );

      // 3. Create full scan record
      const record: ScanRecord = {
        id: uuidv4(),
        userId: profile.id,
        barcode: product.barcode,
        source,
        product,
        verdict,
        explanation: explResult.explanation,
        rulesVersion: verdict.rulesVersion,
        scannedAt: new Date().toISOString(),
      };

      // 4. Save to HistoryContext (syncs to Supabase and localStorage)
      await addScan(record);

      setLoading(false);
      onScanComplete(record);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'An error occurred during assessment.');
    }
  };

  // Handle direct barcode search via Open Food Facts
  const handleAnalyzeBarcode = async (barcode: string) => {
    const clean = barcode.trim();
    if (!clean) return;

    setLoading(true);
    setLoadingMessage(`Looking up barcode "${clean}" in Open Food Facts database…`);
    setErrorMsg(null);

    const res = await fetchProductByBarcode(clean);

    if (res.status === 'not_found' || !res.product) {
      setLoading(false);
      setErrorMsg(`Barcode "${clean}" was not found in the product database. Try uploading the ingredient label photo instead!`);
      return;
    }

    if (res.status === 'network_error') {
      setLoading(false);
      setErrorMsg(res.error || 'Failed to reach product database. Check your internet connection.');
      return;
    }

    await processProductAssessment(res.product, 'openfoodfacts');
  };

  return (
    <div className="animate-in">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">Product assessment</div>
          <h1>Scan a product</h1>
          <p>Search a barcode, use your camera, or test with a demonstration scenario.</p>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="allergen-alert mb-6">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Unable to analyze product</div>
            <p className="mt-1 text-xs leading-relaxed">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-danger hover:opacity-75" type="button">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="scan-layout">
        {/* Left Column: Live Inputs / Camera / OCR */}
        <div className="scan-main">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-[#eadfd9] pb-3">
            <button
              type="button"
              onClick={() => setActiveMode('input')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'input'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-plum/60 hover:text-plum hover:bg-black/5'
              }`}
            >
              Barcode & Search
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('camera')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'camera'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-plum/60 hover:text-plum hover:bg-black/5'
              }`}
            >
              <Camera className="size-3.5" />
              <span>Live Camera Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('ocr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'ocr'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-plum/60 hover:text-plum hover:bg-black/5'
              }`}
            >
              <Upload className="size-3.5" />
              <span>Label Photo OCR</span>
            </button>
          </div>

          {/* Mode 1: Search & Barcode Input */}
          {activeMode === 'input' && (
            <div className="space-y-4">
              <div className="search-box">
                <Search className="size-4 text-plum/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter demonstration scenarios by name or category"
                  aria-label="Search demo scenarios"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-plum/40 hover:text-plum text-xs">
                    Clear
                  </button>
                )}
              </div>

              <div className="scan-or">
                <span>or lookup by barcode</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyzeBarcode(barcodeInput);
                }}
                className="input-row"
              >
                <div className="barcode-input">
                  <ScanLine className="size-4 text-plum/40" />
                  <input
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Enter barcode number (e.g. 7622210449283)"
                    aria-label="Barcode number"
                  />
                  <span>OPEN FOOD FACTS</span>
                </div>
                <NutriButton
                  type="submit"
                  disabled={!barcodeInput.trim() || loading}
                  className="scan-button shrink-0"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : 'Analyze'}
                </NutriButton>
              </form>

              {/* Helpful Preset Barcode chips */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-plum/50 mb-2">Popular test barcodes:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: '3017620422003', label: 'Nutella Spread' },
                    { code: '7622210449283', label: 'Oreo Cookies' },
                    { code: '5449000000996', label: 'Coca-Cola' },
                    { code: '3033490004523', label: 'Danone Yogurt' },
                  ].map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => {
                        setBarcodeInput(p.code);
                        handleAnalyzeBarcode(p.code);
                      }}
                      className="text-[11px] bg-secondary/80 hover:bg-secondary text-plum px-2.5 py-1 rounded-md transition-colors"
                    >
                      {p.label} <span className="opacity-40">({p.code.slice(-4)})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="upload-zone mt-6">
                <Camera className="size-5 text-plum/40 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-plum">Switch to real camera scanner</div>
                  <div className="mt-0.5 text-xs text-plum/50">
                    Use your device webcam or phone camera to scan packaging in real time.
                  </div>
                </div>
                <NutriButton
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveMode('camera')}
                  className="ml-auto"
                >
                  Open camera
                </NutriButton>
              </div>
            </div>
          )}

          {/* Mode 2: Live Camera Barcode Scanner */}
          {activeMode === 'camera' && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#eadfd9] bg-black">
                <BarcodeScanner
                  onDetected={(code) => handleAnalyzeBarcode(code)}
                  onSwitchToUpload={() => setActiveMode('ocr')}
                  isProcessing={loading}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-plum/50 pt-1">
                <span>Hold barcode steady inside the viewfinder window.</span>
                <button
                  type="button"
                  onClick={() => setActiveMode('input')}
                  className="text-primary font-semibold hover:underline"
                >
                  Return to text input
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Label Image OCR */}
          {activeMode === 'ocr' && (
            <div className="space-y-4">
              <div className="border border-dashed border-[#d8c7d1] rounded-xl p-4 bg-[#fffdfa]">
                <LabelUploader
                  onExtracted={(extracted) => onStartReview(extracted)}
                  userId={profile?.id}
                />
              </div>
              <div className="text-xs text-plum/50">
                Snap or upload a clear photo of the nutrition label or ingredient list for automatic extraction.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Demo Dataset Scenario Panel */}
        <div className="demo-panel">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">DEMO DATASET</div>
              <h2 className="mt-1 font-serif text-xl font-semibold text-plum">Try a scenario</h2>
            </div>
            <FileText className="size-5 text-plum/30" />
          </div>

          <div className="demo-list">
            {filteredDemos.map((product) => {
              const demoVerdict = profile ? runVerdictEngine(product, profile).overall : 'green';
              const isSelected = selectedDemo.barcode === product.barcode;

              return (
                <button
                  key={product.barcode}
                  onClick={() => setSelectedDemo(product)}
                  className={`demo-product ${isSelected ? 'demo-product-selected' : ''}`}
                  type="button"
                >
                  <ProductArt product={product} />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-semibold text-plum">{product.name}</div>
                    <div className="mt-0.5 text-[11px] text-plum/45">
                      {product.brand} · {product.category}
                    </div>
                    <div className="mt-2">
                      <NutriVerdictBadge verdict={demoVerdict} />
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-primary shrink-0" />}
                </button>
              );
            })}

            {filteredDemos.length === 0 && (
              <div className="py-8 text-center text-sm text-plum/50">No demonstration products match your search.</div>
            )}
          </div>

          <NutriButton
            disabled={!filteredDemos.length || loading}
            onClick={() => processProductAssessment(selectedDemo, 'manual')}
            className="w-full scan-button h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{loadingMessage || 'Analyzing…'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>View personalized assessment</span>
                <ArrowRight className="size-4" />
              </span>
            )}
          </NutriButton>

          <div className="demo-note">
            <Info className="size-4 shrink-0 text-plum/40 mt-0.5" />
            <span>
              Demonstration scenarios evaluate locally against your active profile with realistic nutrition records.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanScreen;
