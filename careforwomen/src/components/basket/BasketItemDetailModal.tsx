import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ShieldCheck, Trash2, ArrowRightLeft, Sparkles, AlertCircle } from 'lucide-react';
import { BasketItemAnalysis } from '../../types/basket';
import { VerdictBadge } from '../ui/VerdictBadge/VerdictBadge';
import { NutrientBreakdown } from '../result/NutrientBreakdown';
import { AllergenAlert } from '../result/AllergenAlert';
import { AvoidList } from '../result/AvoidList';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';

export interface BasketItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: BasketItemAnalysis | null;
  onRemoveItem: (itemId: string) => void;
  onFindAlternative?: (analysis: BasketItemAnalysis) => void;
}

export const BasketItemDetailModal: React.FC<BasketItemDetailModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onRemoveItem,
  onFindAlternative,
}) => {
  if (!isOpen || !analysis) return null;

  const { item, verdict, flags, severity } = analysis;
  const { product } = item;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 12, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-float)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="caption" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.04em' }}>
                BASKET ITEM ANALYSIS
              </span>
              <h3 className="title-md" style={{ fontSize: '16px', margin: 0 }}>
                Health & Safety Report
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div
            style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Product Summary Header Card */}
            <GlassCard padding="md" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    objectFit: 'contain',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    padding: '3px',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    flexShrink: 0,
                  }}
                >
                  📦
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '2px',
                  }}
                >
                  {product.name}
                </h4>
                <div className="caption" style={{ color: 'var(--text-secondary)' }}>
                  {product.brand ? `${product.brand} • ` : ''}
                  Quantity in basket: <strong>{item.quantity}</strong>
                </div>
                {item.unitPrice !== undefined && (
                  <div className="caption" style={{ color: 'var(--accent-lavender)', fontWeight: 600, marginTop: '2px' }}>
                    ${item.unitPrice.toFixed(2)} / unit (${(item.unitPrice * item.quantity).toFixed(2)} total)
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Verdict Badge */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <VerdictBadge verdict={verdict.overall} score={verdict.score} size="md" />
            </div>

            {/* Personalized Flags Alert Banner */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background:
                  severity === 'red'
                    ? 'rgba(248, 113, 113, 0.12)'
                    : severity === 'yellow'
                    ? 'rgba(251, 191, 36, 0.12)'
                    : severity === 'grey'
                    ? 'rgba(156, 163, 175, 0.12)'
                    : 'rgba(52, 211, 153, 0.12)',
                border: `1px solid ${
                  severity === 'red'
                    ? 'rgba(248, 113, 113, 0.35)'
                    : severity === 'yellow'
                    ? 'rgba(251, 191, 36, 0.35)'
                    : severity === 'grey'
                    ? 'rgba(156, 163, 175, 0.35)'
                    : 'rgba(52, 211, 153, 0.35)'
                }`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {severity === 'red' || severity === 'yellow' ? (
                  <AlertTriangle size={18} color={severity === 'red' ? 'var(--verdict-red)' : 'var(--verdict-yellow)'} />
                ) : severity === 'grey' ? (
                  <AlertCircle size={18} color="var(--verdict-grey)" />
                ) : (
                  <ShieldCheck size={18} color="var(--verdict-green)" />
                )}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color:
                      severity === 'red'
                        ? 'var(--verdict-red)'
                        : severity === 'yellow'
                        ? 'var(--verdict-yellow)'
                        : severity === 'grey'
                        ? 'var(--verdict-grey)'
                        : 'var(--verdict-green)',
                  }}
                >
                  {severity === 'red'
                    ? 'Health & Safety Concern'
                    : severity === 'yellow'
                    ? 'Nutritional Threshold Caution'
                    : severity === 'grey'
                    ? 'Incomplete Label Data'
                    : 'Clean Profile Match'}
                </span>
              </div>

              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {flags.map((flag, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>

            {/* Allergen Alerts if present */}
            {verdict.allergenMatches && verdict.allergenMatches.length > 0 && (
              <AllergenAlert matches={verdict.allergenMatches} />
            )}

            {/* Avoid Ingredients / Consequences */}
            {verdict.avoidIngredients && verdict.avoidIngredients.length > 0 && (
              <AvoidList
                avoidIngredients={verdict.avoidIngredients}
                consequences={verdict.consequences}
              />
            )}

            {/* Nutrient Breakdown Bars */}
            {verdict.ruleResults && verdict.ruleResults.length > 0 && (
              <NutrientBreakdown ruleResults={verdict.ruleResults} product={product} />
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {severity !== 'green' && onFindAlternative && (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    onFindAlternative(analysis);
                    onClose();
                  }}
                  icon={<Sparkles size={16} />}
                >
                  Find Healthier Alternative
                </Button>
              )}

              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => {
                  onRemoveItem(item.id);
                  onClose();
                }}
                icon={<Trash2 size={15} />}
              >
                Remove from Basket
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
