import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Check,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Info,
  ClipboardCheck,
  UserRound,
  Leaf,
  ScanLine,
  History,
  X,
} from 'lucide-react';
import { NutriButton } from '../../components/ui/NutriButton';
import { NutriVerdictBadge } from '../../components/ui/NutriVerdictBadge';
import { ProductArt } from '../../components/ui/ProductArt';
import { useProfile } from '../../context/ProfileContext';
import { ScanRecord } from '../../types/scan';
import { Alternative } from '../../types/verdict';
import { fetchVerifiedGreenAlternatives } from '../../services/alternatives';

export interface ResultScreenProps {
  record: ScanRecord;
  onScanAnother: () => void;
  onBack: () => void;
  onHistory?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  record,
  onScanAnother,
  onBack,
  onHistory,
}) => {
  const { profile } = useProfile();
  const { product, verdict, explanation } = record;

  const [alternatives, setAlternatives] = useState<Alternative[]>(verdict.alternatives || []);
  const [loadingAlts, setLoadingAlts] = useState(false);

  // Fetch verified alternatives from Open Food Facts if not already attached
  useEffect(() => {
    async function loadAlternatives() {
      if (!profile) return;
      if (verdict.alternatives && verdict.alternatives.length > 0) {
        setAlternatives(verdict.alternatives);
        return;
      }

      const category = product.category || 'cereals';
      setLoadingAlts(true);
      try {
        const alts = await fetchVerifiedGreenAlternatives(category, profile);
        setAlternatives(alts);
      } catch {
        // Fallback
      } finally {
        setLoadingAlts(false);
      }
    }

    loadAlternatives();
  }, [product.category, profile, verdict.alternatives]);

  // Compute data completeness percentage
  const coreFields = ['energy_kcal', 'sugar_g', 'saturated_fat_g', 'sodium_mg', 'protein_g', 'carbs_g', 'fiber_g'];
  const presentCount = coreFields.filter(
    (field) => product.nutrients && product.nutrients[field] !== undefined
  ).length;
  const completeness = Math.max(20, Math.round((presentCount / coreFields.length) * 100));

  // Verdict config mapping
  const overall = verdict.overall;
  const isGreen = overall === 'green';
  const isYellow = overall === 'yellow';
  const isRed = overall === 'red';

  const verdictClass = isGreen
    ? 'verdict-suitable'
    : isYellow
    ? 'verdict-caution'
    : isRed
    ? 'verdict-avoid'
    : 'verdict-caution';

  const verdictWord = isGreen
    ? 'SUITABLE'
    : isYellow
    ? 'CAUTION'
    : isRed
    ? 'AVOID'
    : 'INCOMPLETE';

  const handleShareOrSave = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NutriLens Verdict: ${product.name}`,
          text: `${product.name} scored ${verdictWord} on NutriLens for your personalized health profile.`,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    window.print();
  };

  // Active profile summary string
  const activeConditionLabels: string[] = [];
  if (profile?.lifeStages?.includes('pcos')) activeConditionLabels.push('PCOS / PCOD');
  if (profile?.lifeStages?.includes('pregnancy')) activeConditionLabels.push('Pregnancy');
  if (profile?.lifeStages?.includes('breastfeeding')) activeConditionLabels.push('Breastfeeding');
  if (profile?.diabetesType && profile.diabetesType !== 'none') {
    activeConditionLabels.push(profile.diabetesType === 'type1' ? 'Type 1 Diabetes' : 'Type 2 Diabetes');
  }
  if (profile?.lactoseIntolerant) activeConditionLabels.push('Lactose sensitive');
  if (profile?.allergies && profile.allergies.length > 0) {
    activeConditionLabels.push(`${profile.allergies.length} active allergen alerts`);
  }

  // Format nutrition snapshot items
  const nutrients = product.nutrients || {};
  const nutritionItems: { label: string; value: string }[] = [];
  if (product.servingSize) nutritionItems.push({ label: 'Serving size', value: product.servingSize });
  if (nutrients.energy_kcal !== undefined) nutritionItems.push({ label: 'Calories', value: `${nutrients.energy_kcal} kcal` });
  if (nutrients.sugar_g !== undefined) nutritionItems.push({ label: 'Sugars', value: `${nutrients.sugar_g} g` });
  if (nutrients.added_sugar_g !== undefined) nutritionItems.push({ label: 'Added sugar', value: `${nutrients.added_sugar_g} g` });
  if (nutrients.carbs_g !== undefined) nutritionItems.push({ label: 'Carbohydrates', value: `${nutrients.carbs_g} g` });
  if (nutrients.protein_g !== undefined) nutritionItems.push({ label: 'Protein', value: `${nutrients.protein_g} g` });
  if (nutrients.fiber_g !== undefined) nutritionItems.push({ label: 'Dietary fiber', value: `${nutrients.fiber_g} g` });
  if (nutrients.total_fat_g !== undefined) nutritionItems.push({ label: 'Total fat', value: `${nutrients.total_fat_g} g` });
  if (nutrients.saturated_fat_g !== undefined) nutritionItems.push({ label: 'Saturated fat', value: `${nutrients.saturated_fat_g} g` });
  if (nutrients.sodium_mg !== undefined) nutritionItems.push({ label: 'Sodium', value: `${nutrients.sodium_mg} mg` });

  return (
    <div className="animate-in">
      {/* Back button */}
      <button className="back-link" onClick={onBack} type="button">
        <ArrowLeft className="size-4" />
        <span>Back to scan</span>
      </button>

      {/* Top Header */}
      <div className="result-top">
        <div>
          <div className="eyebrow">
            {product.source === 'manual' ? 'DEMONSTRATION ASSESSMENT' : 'PERSONALIZED ASSESSMENT'}
          </div>
          <h1 className="result-title">{product.name}</h1>
          <p className="result-brand">
            {product.brand || 'Verified Product'} {product.category ? `· ${product.category}` : ''}
          </p>
        </div>
        <NutriButton variant="outline" size="sm" onClick={handleShareOrSave}>
          <Download className="size-3.5" />
          <span>Save / Share result</span>
        </NutriButton>
      </div>

      {/* Verdict Hero Banner */}
      <div className={`verdict-hero ${verdictClass}`}>
        <div className="verdict-symbol">
          {isGreen ? (
            <Check />
          ) : isYellow ? (
            <AlertTriangle />
          ) : isRed ? (
            <XCircle />
          ) : (
            <HelpCircle />
          )}
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">
            Personalized verdict
          </div>
          <div className="verdict-word">{verdictWord}</div>
          <p>{explanation || 'Evaluated against your active health profile and safety guidelines.'}</p>
        </div>

        <div className="verdict-side">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">
            Data completeness
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="progress">
              <span style={{ width: `${completeness}%` }} />
            </div>
            <span className="text-sm font-semibold">{completeness}%</span>
          </div>
        </div>
      </div>

      {/* High-priority allergen warning alert if allergens matched */}
      {verdict.allergenMatches && verdict.allergenMatches.length > 0 && (
        <div className="allergen-alert">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <div className="text-sm font-bold">Higher-priority allergen warning</div>
            <p className="mt-1 text-xs leading-relaxed">
              {verdict.allergenMatches.map((m) => `"${m.synonym}" (triggers ${m.allergen})`).join(', ')} was found in the ingredients record. Even trace amounts can pose an immediate safety risk.
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="result-grid">
        {/* Left Column: Product Summary & Ingredients & Nutrition */}
        <div className="result-column">
          {/* Product details card */}
          <div className="result-card">
            <div className="result-card-heading">
              <h2>Product details</h2>
              <span className="text-[10px] uppercase tracking-[0.12em] text-plum/40">
                {product.source === 'openfoodfacts' ? 'Open Food Facts' : product.source === 'ocr' ? 'OCR Extracted' : 'Sample Label'}
              </span>
            </div>

            <div className="product-summary-body">
              <ProductArt product={product} large />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-plum/50">{product.brand || 'Food Product'}</div>
                <div className="mt-1 font-serif text-2xl font-semibold text-plum truncate">
                  {product.name}
                </div>
                <div className="mt-3">
                  <NutriVerdictBadge verdict={verdict.overall} />
                </div>
              </div>
            </div>

            {/* Ingredients statement */}
            <div className="ingredients">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-plum/50">
                Ingredients list
              </div>
              <p>
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map((ing, i) => {
                    const isAllergenMatch = verdict.allergenMatches.some((m) =>
                      ing.toLowerCase().includes(m.synonym.toLowerCase())
                    );
                    return (
                      <span
                        key={i}
                        className={isAllergenMatch ? 'ingredient-alert font-bold' : ''}
                      >
                        {ing}
                        {i < product.ingredients.length - 1 ? ', ' : ''}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-plum/50 italic">
                    Ingredients statement was not provided on this package record.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Nutrition snapshot card */}
          <div className="result-card">
            <div className="result-card-heading">
              <h2>Nutrition snapshot</h2>
              <Info className="size-4 text-plum/30" />
            </div>

            {nutritionItems.length > 0 ? (
              <div className="nutrition-grid">
                {nutritionItems.map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[11px] text-plum/50">{label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-plum">{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-plum/50 italic">
                Nutrition panel data was not included in this product record.
              </p>
            )}

            <p className="mt-4 text-[11px] text-plum/45">
              Values normalized per 100g or package serving. Always confirm with the physical packaging label.
            </p>
          </div>
        </div>

        {/* Right Column: Why you got this result & Active Profile Context */}
        <div className="result-column">
          {/* Rules triggered card */}
          <div className="result-card">
            <div className="result-card-heading">
              <div>
                <h2>Why you got this result</h2>
                <p className="mt-1 text-xs text-plum/50">Transparent deterministic rules triggered by your profile.</p>
              </div>
              <ClipboardCheck className="size-5 text-primary shrink-0" />
            </div>

            <div className="rules-list">
              {/* Allergen matches */}
              {verdict.allergenMatches.map((m, idx) => (
                <div className="rule-row" key={`allergen-${idx}`}>
                  <div className="rule-icon rule-danger">
                    <X />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-plum">Confirmed allergen match: {m.allergen}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-plum/60">
                      Detected "{m.synonym}" via {m.foundIn}. Conflicts with your saved profile.
                    </p>
                  </div>
                </div>
              ))}

              {/* Standard rule results */}
              {verdict.ruleResults.map((rule, idx) => {
                const toneClass =
                  rule.verdict === 'green'
                    ? 'rule-positive'
                    : rule.verdict === 'yellow'
                    ? 'rule-warning'
                    : rule.verdict === 'red'
                    ? 'rule-danger'
                    : 'rule-neutral';

                return (
                  <div className="rule-row" key={`rule-${idx}`}>
                    <div className={`rule-icon ${toneClass}`}>
                      {rule.verdict === 'green' ? (
                        <Check />
                      ) : rule.verdict === 'yellow' ? (
                        <AlertTriangle />
                      ) : rule.verdict === 'red' ? (
                        <X />
                      ) : (
                        <Info />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-plum">{rule.nutrient} limit</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-plum/60">{rule.message}</p>
                    </div>
                  </div>
                );
              })}

              {verdict.ruleResults.length === 0 && verdict.allergenMatches.length === 0 && (
                <div className="rule-row">
                  <div className="rule-icon rule-positive">
                    <Check />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-plum">Clean ingredient & nutrient baseline</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-plum/60">
                      No allergen conflicts or sugar/fat threshold violations were triggered.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active profile context card */}
          <div className="result-card">
            <div className="result-card-heading">
              <h2>Active profile context</h2>
              <UserRound className="size-4 text-plum/30" />
            </div>

            <p className="mt-3 text-xs leading-relaxed text-plum/60">
              {activeConditionLabels.join(' · ') || 'General safety baseline profile'}
            </p>

            {verdict.missingNutrients && verdict.missingNutrients.length > 0 && (
              <div className="missing-box">
                <Info />
                <div>
                  <strong>Missing or unverified</strong>
                  <p className="mt-0.5">
                    {verdict.missingNutrients.join(', ')} was not provided. Missing data is never silently assumed safe.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Alternatives Card */}
      <div className="result-card alternatives-card">
        <div className="result-card-heading">
          <div>
            <h2>Recommended alternatives</h2>
            <p className="mt-1 text-xs text-plum/50">Verified green alternatives that fit your profile.</p>
          </div>
          <Leaf className="size-5 text-sage-strong shrink-0" />
        </div>

        {loadingAlts ? (
          <p className="mt-4 text-xs text-plum/50 italic">Finding safer alternatives in this category…</p>
        ) : alternatives.length > 0 ? (
          <div className="alternatives-list">
            {alternatives.map((alt, i) => (
              <div className="alternative-item" key={i}>
                <ProductArt product={{ name: alt.name, brand: alt.description }} />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-semibold text-plum">{alt.name}</div>
                  <div className="mt-0.5 text-xs text-plum/50 truncate">{alt.description || 'Verified alternative'}</div>
                </div>
                <NutriVerdictBadge verdict="green" />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-plum/50">
            No specific alternative products were verified for this category.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <NutriButton onClick={onScanAnother} variant="outline" className="border-plum/20 text-plum">
          <ScanLine className="size-4" />
          <span>Scan another product</span>
        </NutriButton>

        {onHistory && (
          <NutriButton onClick={onHistory} className="scan-button">
            <History className="size-4" />
            <span>Open scan history</span>
          </NutriButton>
        )}
      </div>
    </div>
  );
};

export default ResultScreen;
