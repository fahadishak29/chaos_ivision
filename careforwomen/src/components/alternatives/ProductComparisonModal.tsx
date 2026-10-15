import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProductComparisonData } from '../../types/alternatives';
import { GlassCard } from '../ui/Card/GlassCard';

export interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisonData: ProductComparisonData | null;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  comparisonData,
}) => {
  if (!isOpen || !comparisonData) return null;

  const { scannedProduct, alternative, metrics, safetySummary, allergenSummary } = comparisonData;

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
                <ArrowRightLeft size={16} />
              </div>
              <h3 className="title-md" style={{ fontSize: '17px' }}>
                Nutritional Comparison
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
              padding: '18px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Products Comparison Header Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {/* Scanned Item */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: 'var(--verdict-red)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Scanned Product
                </span>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={scannedProduct.name}
                >
                  {scannedProduct.name}
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  {scannedProduct.brand || 'Packaged item'}
                </div>
              </div>

              {/* Alternative Item */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(52, 211, 153, 0.05)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: 'var(--verdict-green)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Smart Alternative
                </span>
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={alternative.name}
                >
                  {alternative.name}
                </div>
                <div className="caption" style={{ color: 'var(--accent-lavender)', fontSize: '11px', marginTop: '2px' }}>
                  {alternative.type === 'homemade' ? '🍳 Fresh Recipe' : alternative.brand || 'Verified Packaged'}
                </div>
              </div>
            </div>

            {/* Serving Basis Note */}
            <div
              style={{
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Comparing nutritional values per standardized 100g / 100ml basis.
            </div>

            {/* Metrics Table */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {metrics.map((m, idx) => {
                let badgeBg = 'rgba(255, 255, 255, 0.05)';
                let badgeColor = 'var(--text-muted)';
                let badgeBorder = 'rgba(255, 255, 255, 0.1)';

                if (m.status === 'better') {
                  badgeBg = 'rgba(52, 211, 153, 0.12)';
                  badgeColor = 'var(--verdict-green)';
                  badgeBorder = 'rgba(52, 211, 153, 0.3)';
                } else if (m.status === 'worse') {
                  badgeBg = 'rgba(248, 113, 113, 0.12)';
                  badgeColor = 'var(--verdict-red)';
                  badgeBorder = 'rgba(248, 113, 113, 0.3)';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.label}
                      </span>

                      {m.diffDisplay && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                          }}
                        >
                          {m.diffDisplay}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        fontSize: '12.5px',
                        marginTop: '2px',
                      }}
                    >
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Scanned: <strong style={{ color: 'var(--text-primary)' }}>{m.scannedDisplay}</strong>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        Alt: <strong style={{ color: 'var(--verdict-green)' }}>{m.altDisplay}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allergen & Safety Comparison Card */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.08) 0%, rgba(52, 211, 153, 0.08) 100%)',
                border: '1px solid rgba(232, 143, 167, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--verdict-green)' }}>
                <ShieldCheck size={16} />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Profile Safety Alignment
                </span>
              </div>
              <p className="caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {safetySummary}
              </p>
              <div className="caption" style={{ color: 'var(--accent-lavender)', fontWeight: 600 }}>
                {allergenSummary}
              </div>
            </div>

            {/* Safety Disclaimer */}
            <p className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', lineHeight: 1.4 }}>
              Values represent packaged label declarations and calculated whole-food estimates. Nutritional needs vary; this is general food education and not medical advice.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
