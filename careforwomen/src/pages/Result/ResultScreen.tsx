import React, { useState } from 'react';
import { ArrowLeft, Scan, Share2, AlertTriangle, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { VerdictBadge } from '../../components/ui/VerdictBadge/VerdictBadge';
import { AllergenAlert } from '../../components/result/AllergenAlert';
import { NutrientBreakdown } from '../../components/result/NutrientBreakdown';
import { AvoidList } from '../../components/result/AvoidList';
import { Explanation } from '../../components/result/Explanation';
import { Alternatives } from '../../components/result/Alternatives';
import { AlternativesExplorer } from '../../components/alternatives/AlternativesExplorer';
import { ProductComparisonModal } from '../../components/alternatives/ProductComparisonModal';
import { AlternativeDetailModal } from '../../components/alternatives/AlternativeDetailModal';
import { ScanRecord } from '../../types/scan';
import { SmartAlternative, ProductComparisonData } from '../../types/alternatives';
import { useProfile } from '../../context/ProfileContext';
import { useFavourites } from '../../context/FavouritesContext';
import { useBasket } from '../../context/BasketContext';
import { generateProductComparison } from '../../services/alternativesEngine';

export interface ResultScreenProps {
  record: ScanRecord;
  onScanAnother: () => void;
  onBack: () => void;
  onOpenBasket?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  record,
  onScanAnother,
  onBack,
  onOpenBasket,
}) => {
  const { product, verdict, explanation } = record;
  const { profile } = useProfile();
  const { toggleFavourite, isFavourite } = useFavourites();
  const { addItem, updateQuantity, getItemByProductId, totalUnits } = useBasket();

  const [viewingAlternatives, setViewingAlternatives] = useState(false);
  const [comparisonData, setComparisonData] = useState<ProductComparisonData | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [detailAlternative, setDetailAlternative] = useState<SmartAlternative | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Basket state for this product
  const productId = product.barcode || product.name;
  const existingBasketItem = getItemByProductId(productId);
  const isInBasket = !!existingBasketItem;
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToBasket = () => {
    addItem(product, addQty, undefined, 'scanner');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SHE Scan Verdict: ${product.name}`,
          text: `${product.name} scored ${verdict.overall.toUpperCase()} on SHE Scan for women's health conditions.`,
          url: window.location.href,
        });
      } catch {
        // Ignored
      }
    }
  };

  const handleOpenCompare = (alt: SmartAlternative) => {
    if (!profile) return;
    const comp = generateProductComparison(product, alt, profile);
    setComparisonData(comp);
    setIsComparisonOpen(true);
  };

  const handleOpenDetails = (alt: SmartAlternative) => {
    setDetailAlternative(alt);
    setIsDetailOpen(true);
  };

  // If user tapped to explore full alternatives
  if (viewingAlternatives) {
    return (
      <AlternativesExplorer
        scannedProduct={product}
        verdict={verdict}
        onBack={() => setViewingAlternatives(false)}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 20px 48px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          style={{
            color: 'var(--text-primary)',
            background: 'rgba(255, 255, 255, 0.08)',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.04em' }}>
          SAFETY REPORT
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenBasket && (
            <button
              type="button"
              onClick={onOpenBasket}
              aria-label="View Grocery Basket"
              style={{
                position: 'relative',
                color: 'var(--text-primary)',
                background: 'rgba(255, 255, 255, 0.08)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={18} />
              {totalUnits > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    background: 'var(--gradient-primary)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                  }}
                >
                  {totalUnits}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share Safety Report"
            style={{
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.08)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Product Summary Header Card */}
      <GlassCard padding="md" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              padding: '4px',
            }}
          />
        ) : (
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            📦
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </h2>
          <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            {product.brand ? `${product.brand} • ` : ''}
            {product.source === 'ocr' ? 'Extracted from Photo' : 'Barcode Scanned'}
          </div>
        </div>
      </GlassCard>

      {/* Smart Basket Integration Card */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: isInBasket
            ? 'rgba(52, 211, 153, 0.08)'
            : 'rgba(255, 255, 255, 0.03)',
          border: isInBasket
            ? '1px solid rgba(52, 211, 153, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={17} color={isInBasket ? 'var(--verdict-green)' : 'var(--accent-lavender)'} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isInBasket ? 'Already In Your Basket' : 'Grocery Basket'}
            </span>
          </div>

          {isInBasket && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--verdict-green)',
                background: 'rgba(52, 211, 153, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {existingBasketItem.quantity} {existingBasketItem.quantity === 1 ? 'unit' : 'units'}
            </span>
          )}
        </div>

        {isInBasket ? (
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              You scanned a product already in your basket. Adjust quantity or review basket intelligence:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Stepper */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3px',
                }}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(existingBasketItem.id, existingBasketItem.quantity - 1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Minus size={14} />
                </button>
                <span
                  style={{
                    minWidth: '32px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {existingBasketItem.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(existingBasketItem.id, existingBasketItem.quantity + 1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>

              {onOpenBasket && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onOpenBasket}
                  style={{ flex: 1, fontSize: '12.5px', padding: '7px 12px' }}
                >
                  View in Basket
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
              }}
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setAddQty(Math.max(1, addQty - 1))}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Minus size={14} />
              </button>
              <span
                style={{
                  minWidth: '32px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {addQty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setAddQty(addQty + 1)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <Button
              variant={justAdded ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleAddToBasket}
              icon={justAdded ? <Check size={15} /> : <ShoppingBag size={15} />}
              style={{ flex: 1, fontSize: '12.5px', padding: '7px 14px' }}
            >
              {justAdded ? 'Added to Basket!' : `Add to Basket (${addQty})`}
            </Button>
          </div>
        )}
      </div>

      {/* Allergen Alert (Overrides Everything if present) */}
      <AllergenAlert matches={verdict.allergenMatches} />

      {/* Traces Caution Alert Banner */}
      {verdict.tracesWarnings && verdict.tracesWarnings.length > 0 && verdict.allergenMatches.length === 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: 'var(--verdict-yellow)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Traces Warning:</strong> Packaging indicates traces of allergen: {verdict.tracesWarnings.map((t) => t.allergen).join(', ')}.
          </span>
        </div>
      )}

      {/* Big Animated Verdict Badge */}
      <div style={{ marginBottom: '24px' }}>
        <VerdictBadge verdict={verdict.overall} score={verdict.score} size="lg" />
      </div>

      {/* AI Plain-Language Explanation Block */}
      <Explanation explanation={explanation} />

      {/* Blacklist / Avoid List & Health Impact */}
      <AvoidList
        avoidIngredients={verdict.avoidIngredients}
        consequences={verdict.consequences}
      />

      {/* Nutrient Breakdown Bars (Value vs Limit) */}
      <NutrientBreakdown ruleResults={verdict.ruleResults} product={product} />

      {/* Smart Food Alternatives Section */}
      <Alternatives
        scannedProduct={product}
        verdict={verdict}
        onExploreAll={() => setViewingAlternatives(true)}
        onOpenCompare={handleOpenCompare}
        onOpenDetails={handleOpenDetails}
      />

      {/* Scan Another Button */}
      <div style={{ marginTop: '16px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={onScanAnother} icon={<Scan size={20} />}>
          Scan Another Product
        </Button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <span className="caption" style={{ color: 'var(--text-muted)' }}>
          Evaluated using SHE Scan Engine v{verdict.rulesVersion}
        </span>
      </div>

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        comparisonData={comparisonData}
      />

      {/* Alternative Detail Modal */}
      <AlternativeDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        alternative={detailAlternative}
        onCompare={handleOpenCompare}
        onToggleFavourite={toggleFavourite}
        isFavourite={detailAlternative ? isFavourite(detailAlternative.id) : false}
      />
    </div>
  );
};
