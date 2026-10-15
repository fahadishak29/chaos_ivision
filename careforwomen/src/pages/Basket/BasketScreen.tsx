import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Sparkles,
  ArrowRightLeft,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Info,
  DollarSign,
  Scan,
} from 'lucide-react';
import { useBasket } from '../../context/BasketContext';
import { useProfile } from '../../context/ProfileContext';
import { BasketItemAnalysis, BasketImprovementSuggestion } from '../../types/basket';
import {
  analyzeBasket,
  generateBasketImprovements,
  compareBaskets,
} from '../../services/basketEngine';
import { BasketItemDetailModal } from '../../components/basket/BasketItemDetailModal';
import { ImproveBasketModal } from '../../components/basket/ImproveBasketModal';
import { BasketComparisonModal } from '../../components/basket/BasketComparisonModal';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { Modal } from '../../components/ui/Modal/Modal';

export interface BasketScreenProps {
  onStartScan: () => void;
  onExploreAlternatives?: () => void;
}

export const BasketScreen: React.FC<BasketScreenProps> = ({
  onStartScan,
  onExploreAlternatives,
}) => {
  const { profile } = useProfile();
  const {
    basketItems,
    totalItemsCount,
    uniqueProductsCount,
    removeItem,
    updateQuantity,
    clearBasket,
    replaceItem,
    addItem,
    undoLastAction,
    canUndo,
    toastMessage,
  } = useBasket();

  // Selected filter: 'all' | 'red' | 'yellow' | 'green'
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  // Modals state
  const [selectedAnalysis, setSelectedAnalysis] = useState<BasketItemAnalysis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<BasketImprovementSuggestion[]>([]);
  const [isLoadingImprovements, setIsLoadingImprovements] = useState(false);

  // Compute live basket intelligence summary
  const summary = useMemo(() => {
    if (!profile) {
      return {
        totalUniqueProducts: 0,
        totalUnits: 0,
        totalEstimatedCost: null,
        hasPartialPricing: false,
        pricedItemCount: 0,
        unpricedItemCount: 0,
        safetyConcernCount: 0,
        nutritionalMismatchCount: 0,
        insufficientDataCount: 0,
        cleanCount: 0,
        overviewText: 'Sign in or select health preferences to analyze basket items.',
        itemsAnalysis: [],
      };
    }
    return analyzeBasket(basketItems, profile);
  }, [basketItems, profile]);

  // Filtered items
  const filteredAnalysis = useMemo(() => {
    if (filterSeverity === 'all') return summary.itemsAnalysis;
    return summary.itemsAnalysis.filter((a) => a.severity === filterSeverity);
  }, [summary.itemsAnalysis, filterSeverity]);

  // Load improvement suggestions
  const handleOpenImproveModal = async () => {
    if (!profile) return;
    setIsLoadingImprovements(true);
    try {
      const sugs = await generateBasketImprovements(basketItems, profile);
      setSuggestions(sugs);
      setIsImproveModalOpen(true);
    } catch (err) {
      console.warn('Failed to generate basket improvements:', err);
    } finally {
      setIsLoadingImprovements(false);
    }
  };

  const handleOpenDetail = (analysis: BasketItemAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsDetailOpen(true);
  };

  const handleConfirmClear = () => {
    clearBasket();
    setIsClearConfirmOpen(false);
  };

  // Compare original vs currently improved basket
  const comparisonMetrics = useMemo(() => {
    if (!profile || basketItems.length === 0) return null;
    return compareBaskets(basketItems, basketItems, profile);
  }, [basketItems, profile]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 80px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 110,
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(232, 143, 167, 0.95)',
              color: '#120815',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <span className="caption" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.04em' }}>
            GROCERY INTELLIGENCE
          </span>
          <h1 className="title-xl" style={{ marginTop: '2px', fontSize: '24px' }}>
            Smart Basket 🧺
          </h1>
        </div>

        {basketItems.length > 0 && (
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
              color: 'var(--verdict-red)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Undo Action Bar */}
      {canUndo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginBottom: '14px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(196, 181, 253, 0.1)',
            border: '1px solid rgba(196, 181, 253, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--accent-lavender)' }}>
            Revert your latest basket change?
          </span>
          <button
            type="button"
            onClick={undoLastAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent-rose)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Undo</span>
          </button>
        </motion.div>
      )}

      {/* Main Content */}
      {basketItems.length === 0 ? (
        <GlassCard padding="lg" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '10px' }}>
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.15) 0%, rgba(196, 181, 253, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '36px',
            }}
          >
            🧺
          </div>
          <h3 className="title-md" style={{ marginBottom: '8px' }}>Your Grocery Basket is Empty</h3>
          <p className="body-md" style={{ color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto 20px', fontSize: '13.5px' }}>
            Collect items from the scanner or smart alternatives to evaluate your entire shopping list against your personal health profile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="primary" size="md" fullWidth onClick={onStartScan} icon={<Scan size={18} />}>
              Scan First Item
            </Button>
            {onExploreAlternatives && (
              <Button variant="secondary" size="md" fullWidth onClick={onExploreAlternatives} icon={<Sparkles size={16} />}>
                Browse Smart Alternatives
              </Button>
            )}
          </div>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Basket Intelligence Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <div
              onClick={() => setFilterSeverity('red')}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: filterSeverity === 'red' ? 'rgba(248, 113, 113, 0.22)' : 'rgba(248, 113, 113, 0.08)',
                border: `1px solid ${filterSeverity === 'red' ? 'var(--verdict-red)' : 'rgba(248, 113, 113, 0.2)'}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-red)' }}>
                {summary.safetyConcernCount}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Safety
              </div>
            </div>

            <div
              onClick={() => setFilterSeverity('yellow')}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: filterSeverity === 'yellow' ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.08)',
                border: `1px solid ${filterSeverity === 'yellow' ? 'var(--verdict-yellow)' : 'rgba(251, 191, 36, 0.2)'}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-yellow)' }}>
                {summary.nutritionalMismatchCount}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Caution
              </div>
            </div>

            <div
              onClick={() => setFilterSeverity('green')}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: filterSeverity === 'green' ? 'rgba(52, 211, 153, 0.22)' : 'rgba(52, 211, 153, 0.08)',
                border: `1px solid ${filterSeverity === 'green' ? 'var(--verdict-green)' : 'rgba(52, 211, 153, 0.2)'}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--verdict-green)' }}>
                {summary.cleanCount}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Clean
              </div>
            </div>

            <div
              onClick={() => setFilterSeverity('all')}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-md)',
                background: filterSeverity === 'all' ? 'rgba(232, 143, 167, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${filterSeverity === 'all' ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.08)'}`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {uniqueProductsCount}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Total Items
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar: Total Units & Cost */}
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
            <span className="caption" style={{ color: 'var(--text-secondary)' }}>
              Total Volume: <strong style={{ color: 'var(--text-primary)' }}>{totalItemsCount} units</strong>
            </span>
            <span className="caption" style={{ color: 'var(--text-secondary)' }}>
              Est. Cost:{' '}
              <strong style={{ color: 'var(--accent-rose)' }}>
                {summary.totalEstimatedCost !== null ? `$${summary.totalEstimatedCost.toFixed(2)}` : 'Pricing pending'}
              </strong>
            </span>
          </div>

          {/* Your Basket Overview Card */}
          <GlassCard
            variant="default"
            padding="md"
            style={{
              border: '1px solid rgba(232, 143, 167, 0.25)',
              background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.06) 0%, rgba(196, 181, 253, 0.04) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="var(--accent-rose)" />
              <h3 className="title-md" style={{ fontSize: '14.5px', color: 'var(--text-primary)' }}>
                Your Basket Overview
              </h3>
            </div>
            <p className="caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {summary.overviewText}
            </p>
          </GlassCard>

          {/* "Improve My Basket" Signature CTA */}
          {(summary.safetyConcernCount > 0 || summary.nutritionalMismatchCount > 0) && (
            <GlassCard
              variant="rose"
              padding="md"
              style={{
                boxShadow: '0 8px 30px rgba(232, 143, 167, 0.15)',
                border: '1px solid rgba(232, 143, 167, 0.35)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 className="title-md" style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Improve My Basket ✨
                  </h3>
                  <p className="caption" style={{ color: 'var(--text-secondary)' }}>
                    Resolve identified safety concerns and sugar spikes with verified whole-food swaps.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleOpenImproveModal}
                  isLoading={isLoadingImprovements}
                  icon={<Sparkles size={16} />}
                >
                  Improve My Basket
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsComparisonModalOpen(true)}
                  icon={<ArrowRightLeft size={16} />}
                  title="Compare Basket Metrics"
                >
                  Compare
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Basket Items List Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={16} color="var(--accent-lavender)" />
                <h3 className="title-md" style={{ fontSize: '15px' }}>
                  Basket Products ({filteredAnalysis.length})
                </h3>
              </div>

              {filterSeverity !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilterSeverity('all')}
                  className="caption"
                  style={{ color: 'var(--accent-rose)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Show all
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredAnalysis.map((analysis) => {
                const { item, severity, flags } = analysis;
                const { product } = item;

                let badgeColor = 'var(--verdict-green)';
                let badgeBg = 'rgba(52, 211, 153, 0.12)';
                let badgeBorder = 'rgba(52, 211, 153, 0.3)';
                let badgeLabel = 'Clean';

                if (severity === 'red') {
                  badgeColor = 'var(--verdict-red)';
                  badgeBg = 'rgba(248, 113, 113, 0.12)';
                  badgeBorder = 'rgba(248, 113, 113, 0.3)';
                  badgeLabel = 'Concern';
                } else if (severity === 'yellow') {
                  badgeColor = 'var(--verdict-yellow)';
                  badgeBg = 'rgba(251, 191, 36, 0.12)';
                  badgeBorder = 'rgba(251, 191, 36, 0.3)';
                  badgeLabel = 'Caution';
                } else if (severity === 'grey') {
                  badgeColor = 'var(--verdict-grey)';
                  badgeBg = 'rgba(156, 163, 175, 0.12)';
                  badgeBorder = 'rgba(156, 163, 175, 0.3)';
                  badgeLabel = 'Unknown';
                }

                return (
                  <GlassCard
                    key={item.id}
                    padding="sm"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      border: `1px solid ${severity === 'red' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
                    }}
                  >
                    {/* Top Row: Thumbnail, Info, Health Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div
                        onClick={() => handleOpenDetail(analysis)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'contain',
                              background: '#fff',
                              padding: '2px',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                              flexShrink: 0,
                            }}
                          >
                            📦
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: '14px',
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
                          <div className="caption" style={{ color: 'var(--text-muted)' }}>
                            {product.brand || 'Grocery product'}
                            {item.unitPrice !== undefined && ` • $${item.unitPrice.toFixed(2)}`}
                          </div>
                        </div>
                      </div>

                      {/* Health Status Badge */}
                      <span
                        onClick={() => handleOpenDetail(analysis)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Flag Reason */}
                    {flags.length > 0 && (
                      <div
                        onClick={() => handleOpenDetail(analysis)}
                        style={{
                          fontSize: '11.5px',
                          color: severity === 'red' ? 'var(--verdict-red)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {severity === 'red' && <AlertTriangle size={12} style={{ flexShrink: 0 }} />}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {flags[0]}
                        </span>
                      </div>
                    )}

                    {/* Bottom Row: Quantity Stepper & Price / Actions */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '6px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--radius-full)',
                          padding: '3px 8px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Minus size={12} />
                        </button>

                        <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price subtotal and Analysis details link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.unitPrice !== undefined && (
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-rose)' }}>
                            ${(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenDetail(analysis)}
                          title="View Details"
                          style={{
                            color: 'var(--accent-lavender)',
                            background: 'rgba(196, 181, 253, 0.1)',
                            border: '1px solid rgba(196, 181, 253, 0.25)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          <Info size={12} />
                          <span>Report</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                          style={{
                            color: 'var(--text-muted)',
                            background: 'transparent',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Item Analysis Detail Modal */}
      <BasketItemDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        analysis={selectedAnalysis}
        onRemoveItem={removeItem}
        onFindAlternative={() => handleOpenImproveModal()}
      />

      {/* Improve My Basket Modal */}
      <ImproveBasketModal
        isOpen={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        suggestions={suggestions}
        onReplaceItem={(origId, replProduct, price) => replaceItem(origId, replProduct, price)}
        onKeepBoth={(replProduct, price) => addItem(replProduct, 1, price, 'alternative')}
        onCompareBasket={() => setIsComparisonModalOpen(true)}
      />

      {/* Basket Comparison Modal */}
      <BasketComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        metrics={comparisonMetrics}
      />

      {/* Clear Basket Confirmation Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Clear Entire Grocery Basket?"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
            This will remove all {totalItemsCount} units from your basket. You can undo this action immediately after clearing.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="danger" fullWidth onClick={handleConfirmClear}>
              Yes, Clear Basket
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
