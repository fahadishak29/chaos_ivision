import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { Product, ServingUnit } from '../../types/product';

export interface LabelReviewScreenProps {
  initialData: Partial<Product>;
  onConfirm: (confirmedProduct: Product) => void;
  onCancel: () => void;
}

export const LabelReviewScreen: React.FC<LabelReviewScreenProps> = ({
  initialData,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState(initialData.name || 'Extracted Food Item');
  const [brand, setBrand] = useState(initialData.brand || '');
  const [servingSize, setServingSize] = useState(initialData.servingSize || '30g');
  const [servingUnit, setServingUnit] = useState<ServingUnit>(initialData.servingUnit || 'per100g');

  // Nutrients
  const [sugar, setSugar] = useState(initialData.nutrients?.sugar_g?.toString() ?? '');
  const [addedSugar, setAddedSugar] = useState(initialData.nutrients?.added_sugar_g?.toString() ?? '');
  const [satFat, setSatFat] = useState(initialData.nutrients?.saturated_fat_g?.toString() ?? '');
  const [sodium, setSodium] = useState(initialData.nutrients?.sodium_mg?.toString() ?? '');
  const [carbs, setCarbs] = useState(initialData.nutrients?.carbs_g?.toString() ?? '');
  const [fiber, setFiber] = useState(initialData.nutrients?.fiber_g?.toString() ?? '');
  const [protein, setProtein] = useState(initialData.nutrients?.protein_g?.toString() ?? '');

  // Ingredients text
  const [ingredientsText, setIngredientsText] = useState(
    initialData.ingredientsRaw || (initialData.ingredients || []).join(', ')
  );

  const handleConfirm = () => {
    const parsedIngredients = ingredientsText
      .split(/[,;\n•]/)
      .map((s) => s.trim().replace(/^[-*]\s*/, ''))
      .filter((s) => s.length > 0);

    const product: Product = {
      name: name.trim() || 'Scanned Packaged Product',
      brand: brand.trim() || undefined,
      source: 'ocr',
      servingUnit,
      servingSize: servingSize.trim() || undefined,
      nutrients: {
        sugar_g: sugar !== '' ? parseFloat(sugar) : undefined,
        added_sugar_g: addedSugar !== '' ? parseFloat(addedSugar) : undefined,
        saturated_fat_g: satFat !== '' ? parseFloat(satFat) : undefined,
        sodium_mg: sodium !== '' ? parseFloat(sodium) : undefined,
        carbs_g: carbs !== '' ? parseFloat(carbs) : undefined,
        fiber_g: fiber !== '' ? parseFloat(fiber) : undefined,
        protein_g: protein !== '' ? parseFloat(protein) : undefined,
      },
      ingredients: parsedIngredients,
      ingredientsRaw: ingredientsText,
      allergenTags: initialData.allergenTags || [],
      tracesTags: initialData.tracesTags || [],
      additives: initialData.additives || [],
    };

    onConfirm(product);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 40px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#fbf8f3',
        color: '#342134',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            marginRight: '12px',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.04em' }}>
          VERIFY EXTRACTED VALUES
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 className="title-lg" style={{ marginBottom: '6px' }}>
          Check These Values
        </h2>
        <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
          {initialData.name === 'Extracted Packaged Product'
            ? 'Demo Mode: Because no Gemini Vision API key is configured in .env, template placeholder values are shown below. Adjust them to match your physical packaging label before continuing.'
            : 'Review and adjust any values before running your personalized safety verdict.'}
        </p>

        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setName('Quaker Oats (100% Wholegrain Rolled Oats)');
              setBrand('Quaker');
              setServingSize('40g');
              setServingUnit('per100g');
              setSugar('0.5');
              setAddedSugar('0');
              setSatFat('1.5');
              setSodium('6');
              setCarbs('66.5');
              setFiber('10.2');
              setProtein('12.5');
              setIngredientsText('Rolled Oats (100%)');
            }}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(116, 61, 105, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(116, 61, 105, 0.3)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🌾 Load Quaker Oats Values (0g Added Sugar)</span>
          </button>
        </div>
      </div>

      <GlassCard padding="lg" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Product Name & Brand */}
          <div>
            <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Serving Size
              </label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="e.g. 30g"
                className="glass-input"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Unit Base
              </label>
              <select
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value as ServingUnit)}
                className="glass-input"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
              >
                <option value="per100g" style={{ background: '#12121f' }}>Per 100g (Solid)</option>
                <option value="per100ml" style={{ background: '#12121f' }}>Per 100ml (Drink)</option>
              </select>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-lavender)' }}>
            Key Nutrients (per {servingUnit === 'per100ml' ? '100ml' : '100g'})
          </span>

          {/* Grid of Nutrients */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Sugar (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                className="glass-input"
                placeholder="e.g. 8.5"
              />
            </div>

            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Saturated Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={satFat}
                onChange={(e) => setSatFat(e.target.value)}
                className="glass-input"
                placeholder="e.g. 2.0"
              />
            </div>

            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Sodium (mg)
              </label>
              <input
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                className="glass-input"
                placeholder="e.g. 250"
              />
            </div>

            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Total Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="glass-input"
                placeholder="e.g. 25"
              />
            </div>

            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                className="glass-input"
                placeholder="e.g. 4.0"
              />
            </div>

            <div>
              <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="glass-input"
                placeholder="e.g. 6.0"
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

          {/* Ingredients Textarea */}
          <div>
            <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Ingredients List (Comma separated)
            </label>
            <textarea
              rows={4}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="glass-input"
              placeholder="e.g. Rolled oats, sugar, milk powder, salt..."
              style={{ resize: 'vertical', lineHeight: 1.5, fontSize: '13px' }}
            />
          </div>
        </div>
      </GlassCard>

      <Button variant="primary" size="lg" fullWidth onClick={handleConfirm} icon={<Check size={20} />}>
        Confirm & Run Safety Verdict
      </Button>
    </div>
  );
};
