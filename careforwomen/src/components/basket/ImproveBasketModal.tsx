import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRightLeft, Plus, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { BasketImprovementSuggestion } from '../../types/basket';
import { alternativeToProduct, extractPriceFromCostDetails } from '../../services/basketEngine';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';

export interface ImproveBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: BasketImprovementSuggestion[];
  onReplaceItem: (originalItemId: string, replacementAlt: any, price?: number) => void;
  onKeepBoth: (replacementAlt: any, price?: number) => void;
  onCompareBasket: () => void;
}

export const ImproveBasketModal: React.FC<ImproveBasketModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onReplaceItem,
  onKeepBoth,
  onCompareBasket,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [confirmReplaceId, setConfirmReplaceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleConfirmReplace = (suggestion: BasketImprovementSuggestion) => {
    const product = alternativeToProduct(suggestion.suggestedAlternative);
    const price = extractPriceFromCostDetails(suggestion.suggestedAlternative.estimatedCostDetails);
    onReplaceItem(suggestion.originalItem.id, product, price);
    setConfirmReplaceId(null);
  };

  const handleKeepBothAction = (suggestion: BasketImprovementSuggestion) => {
    const product = alternativeToProduct(suggestion.suggestedAlternative);
    const price = extractPriceFromCostDetails(suggestion.suggestedAlternative.estimatedCostDetails);
    onKeepBoth(product, price);
    handleDismiss(suggestion.id);
  };

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
            maxWidth: '480px',
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
              padding: '18px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
                  color: '#120815',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="title-md" style={{ fontSize: '17px', margin: 0 }}>
                  Improve My Basket
                </h3>
                <span className="caption" style={{ color: 'var(--accent-lavender)' }}>
                  {activeSuggestions.length} personalized improvement {activeSuggestions.length === 1 ? 'swap' : 'swaps'}
                </span>
              </div>
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

          {/* Scrollable Suggestions List */}
          <div
            style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {activeSuggestions.length === 0 ? (
              <GlassCard padding="lg" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                <h4 className="title-md" style={{ marginBottom: '6px' }}>Your Basket is Optimized!</h4>
                <p className="caption" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  All items currently in your basket align with your health thresholds, or all available suggestions have been evaluated.
                </p>
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Back to Basket
                </Button>
              </GlassCard>
            ) : (
              <>
                <p className="caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  We identified health concerns or elevated sugar/sodium in your basket items. Replace them with tailored, verified alternatives to optimize your grocery list.
                </p>

                {activeSuggestions.map((sug) => {
                  const orig = sug.originalItem;
                  const alt = sug.suggestedAlternative;
                  const diffs = sug.nutritionComparison;
                  const isConfirming = confirmReplaceId === sug.id;

                  return (
                    <GlassCard
                      key={sug.id}
                      padding="md"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.025)',
                      }}
                    >
                      {/* Original vs Suggested Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
                        {/* Original Flagged Item */}
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(248, 113, 113, 0.08)',
                            border: '1px solid rgba(248, 113, 113, 0.25)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              color: 'var(--verdict-red)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'block',
                              marginBottom: '2px',
                            }}
                          >
                            Current Item
                          </span>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={orig.product.name}
                          >
                            {orig.product.name}
                          </div>
                          <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                            Qty: {orig.quantity}
                          </div>
                        </div>

                        {/* Arrow Swapper Icon */}
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-rose)',
                          }}
                        >
                          <ArrowRightLeft size={14} />
                        </div>

                        {/* Suggested Alternative */}
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(52, 211, 153, 0.08)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              color: 'var(--verdict-green)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'block',
                              marginBottom: '2px',
                            }}
                          >
                            Recommended Swap
                          </span>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={alt.name}
                          >
                            {alt.name}
                          </div>
                          <div className="caption" style={{ color: 'var(--accent-lavender)', fontSize: '11px' }}>
                            {alt.type === 'homemade' ? '🍳 Fresh' : '📦 Clean'}
                          </div>
                        </div>
                      </div>

                      {/* Flag Reason */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--verdict-yellow)',
                          background: 'rgba(251, 191, 36, 0.08)',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                        <span>{sug.flagReason}</span>
                      </div>

                      {/* Improvement Rationale */}
                      <div
                        style={{
                          fontSize: '12.5px',
                          color: 'var(--text-primary)',
                          background: 'rgba(52, 211, 153, 0.06)',
                          border: '1px solid rgba(52, 211, 153, 0.2)',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                        }}
                      >
                        <ShieldCheck size={15} color="var(--verdict-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>
                          <strong>Why it fits:</strong> {sug.improvementReason}
                        </span>
                      </div>

                      {/* Nutrition Diff Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {diffs.sugarDiff !== null && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: diffs.sugarDiff <= 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                              color: diffs.sugarDiff <= 0 ? 'var(--verdict-green)' : 'var(--verdict-red)',
                              border: `1px solid ${diffs.sugarDiff <= 0 ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                            }}
                          >
                            {diffs.sugarDiff <= 0 ? `${diffs.sugarDiff}g Sugar` : `+${diffs.sugarDiff}g Sugar`}
                          </span>
                        )}

                        {diffs.fiberDiff !== null && diffs.fiberDiff > 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(52, 211, 153, 0.12)',
                              color: 'var(--verdict-green)',
                              border: '1px solid rgba(52, 211, 153, 0.3)',
                            }}
                          >
                            +{diffs.fiberDiff}g Fiber
                          </span>
                        )}

                        {diffs.sodiumDiff !== null && diffs.sodiumDiff < 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(52, 211, 153, 0.12)',
                              color: 'var(--verdict-green)',
                              border: '1px solid rgba(52, 211, 153, 0.3)',
                            }}
                          >
                            {diffs.sodiumDiff}mg Sodium
                          </span>
                        )}

                        {sug.priceComparison?.diff !== null && sug.priceComparison?.diff !== undefined && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-secondary)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {sug.priceComparison.diff <= 0
                              ? `Save $${Math.abs(sug.priceComparison.diff).toFixed(2)}/unit`
                              : `+$${sug.priceComparison.diff.toFixed(2)}/unit`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {isConfirming ? (
                        <div
                          style={{
                            padding: '10px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(232, 143, 167, 0.1)',
                            border: '1px solid var(--accent-rose)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Confirm replacing <strong>{orig.product.name}</strong> ({orig.quantity} units)?
                          </span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              fullWidth
                              onClick={() => handleConfirmReplace(sug)}
                            >
                              Yes, Replace
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              onClick={() => setConfirmReplaceId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', paddingTop: '4px' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setConfirmReplaceId(sug.id)}
                            icon={<ArrowRightLeft size={13} />}
                            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
                          >
                            Replace Item
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleKeepBothAction(sug)}
                            icon={<Plus size={13} />}
                            style={{ flex: 1, padding: '8px 10px', fontSize: '12px' }}
                          >
                            Keep Both
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDismiss(sug.id)}
                            title="Dismiss suggestion"
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}

                {/* Compare Before and After Button */}
                <div style={{ paddingTop: '8px' }}>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      onCompareBasket();
                      onClose();
                    }}
                    icon={<ArrowRightLeft size={16} />}
                  >
                    Compare Before & After Basket
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
