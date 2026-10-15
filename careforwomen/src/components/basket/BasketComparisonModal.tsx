import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, ShieldCheck, AlertCircle, TrendingDown, Scale } from 'lucide-react';
import { BasketComparisonMetrics } from '../../types/basket';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';

export interface BasketComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BasketComparisonMetrics | null;
}

export const BasketComparisonModal: React.FC<BasketComparisonModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  if (!isOpen || !metrics) return null;

  const { totalCost, safetyConcerns, nutritionalMismatches, incompleteInfoProducts, nutritionalTotals } = metrics;

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
              padding: '18px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(232, 143, 167, 0.15)',
                  color: 'var(--accent-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scale size={16} />
              </div>
              <div>
                <h3 className="title-md" style={{ fontSize: '17px', margin: 0 }}>
                  Basket Comparison
                </h3>
                <span className="caption" style={{ color: 'var(--accent-lavender)' }}>
                  Current vs. Improved Basket
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

          {/* Scrollable Content */}
          <div
            style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Safety Concerns & Cautions Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Safety Concerns */}
              <GlassCard padding="sm" style={{ border: '1px solid rgba(248, 113, 113, 0.25)' }}>
                <span className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Safety Concerns (Red)
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-red)' }}>
                    {safetyConcerns.original}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-green)' }}>
                    {safetyConcerns.improved}
                  </span>
                  {safetyConcerns.diff < 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(52, 211, 153, 0.15)',
                        color: 'var(--verdict-green)',
                      }}
                    >
                      {safetyConcerns.diff}
                    </span>
                  )}
                </div>
              </GlassCard>

              {/* Nutritional Mismatches */}
              <GlassCard padding="sm" style={{ border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                <span className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Caution / Thresholds
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-yellow)' }}>
                    {nutritionalMismatches.original}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-green)' }}>
                    {nutritionalMismatches.improved}
                  </span>
                  {nutritionalMismatches.diff < 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(52, 211, 153, 0.15)',
                        color: 'var(--verdict-green)',
                      }}
                    >
                      {nutritionalMismatches.diff}
                    </span>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Estimated Cost Comparison */}
            <GlassCard padding="md" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Estimated Basket Cost
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {totalCost.original !== null ? `$${totalCost.original.toFixed(2)}` : '—'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <strong style={{ color: 'var(--accent-rose)', fontSize: '14px' }}>
                    {totalCost.improved !== null ? `$${totalCost.improved.toFixed(2)}` : '—'}
                  </strong>
                </div>
              </div>
              {totalCost.hasIncompleteData && (
                <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>
                  *Some grocery products in this basket do not declare verified retail price information.
                </div>
              )}
            </GlassCard>

            {/* Nutritional Totals Section */}
            <div>
              <h4 className="title-md" style={{ fontSize: '14px', marginBottom: '8px' }}>
                Cumulative Basket Nutrients (across all units)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Total Sugar */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Total Sugar
                    </span>
                    <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      Summed across all basket portions
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {nutritionalTotals.sugarGrams.original}g → <strong style={{ color: 'var(--verdict-green)' }}>{nutritionalTotals.sugarGrams.improved}g</strong>
                    </div>
                    {nutritionalTotals.sugarGrams.diff !== null && nutritionalTotals.sugarGrams.diff < 0 && (
                      <span className="caption" style={{ color: 'var(--verdict-green)', fontWeight: 700 }}>
                        {nutritionalTotals.sugarGrams.diff}g saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Total Carbohydrates */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Total Carbohydrates
                    </span>
                    <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      Impact on glycemic load
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {nutritionalTotals.carbsGrams.original}g → <strong style={{ color: 'var(--verdict-green)' }}>{nutritionalTotals.carbsGrams.improved}g</strong>
                    </div>
                    {nutritionalTotals.carbsGrams.diff !== null && (
                      <span className="caption" style={{ color: nutritionalTotals.carbsGrams.diff <= 0 ? 'var(--verdict-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {nutritionalTotals.carbsGrams.diff <= 0 ? `${nutritionalTotals.carbsGrams.diff}g` : `+${nutritionalTotals.carbsGrams.diff}g`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Total Sodium */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Total Sodium
                    </span>
                    <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      Blood pressure & prenatal balance
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {nutritionalTotals.sodiumMg.original}mg → <strong style={{ color: 'var(--verdict-green)' }}>{nutritionalTotals.sodiumMg.improved}mg</strong>
                    </div>
                    {nutritionalTotals.sodiumMg.diff !== null && (
                      <span className="caption" style={{ color: nutritionalTotals.sodiumMg.diff <= 0 ? 'var(--verdict-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {nutritionalTotals.sodiumMg.diff <= 0 ? `${nutritionalTotals.sodiumMg.diff}mg` : `+${nutritionalTotals.sodiumMg.diff}mg`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Missing Data & Clinical Consumption Disclaimer */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: 1.45,
              }}
            >
              <strong>Important Notice:</strong> Basket nutritional totals reflect the cumulative quantities of items purchased for your pantry, not food consumed in a single sitting. Incomplete packaging values are excluded from comparisons rather than assumed to be zero.
            </div>

            <Button variant="secondary" size="md" fullWidth onClick={onClose}>
              Close Comparison
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
