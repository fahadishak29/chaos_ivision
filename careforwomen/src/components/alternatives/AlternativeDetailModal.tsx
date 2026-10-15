import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, DollarSign, Heart, Sparkles, ShieldAlert, ArrowRightLeft, ChefHat, Package, ShoppingBag } from 'lucide-react';
import { SmartAlternative } from '../../types/alternatives';
import { Button } from '../ui/Button/Button';
import { useBasket } from '../../context/BasketContext';
import { alternativeToProduct, extractPriceFromCostDetails } from '../../services/basketEngine';

export interface AlternativeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alternative: SmartAlternative | null;
  onCompare?: (alt: SmartAlternative) => void;
  onToggleFavourite: (alt: SmartAlternative) => void;
  isFavourite: boolean;
}

export const AlternativeDetailModal: React.FC<AlternativeDetailModalProps> = ({
  isOpen,
  onClose,
  alternative,
  onCompare,
  onToggleFavourite,
  isFavourite,
}) => {
  const { addItem, getItemByProductId } = useBasket();
  if (!isOpen || !alternative) return null;

  const existingBasketItem = getItemByProductId(`alt_${alternative.id}`);
  const isInBasket = !!existingBasketItem;

  const handleAddToBasket = () => {
    const prod = alternativeToProduct(alternative);
    const price = extractPriceFromCostDetails(alternative.estimatedCostDetails);
    addItem(prod, 1, price, 'alternative', alternative);
  };

  const n = alternative.nutrients;

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
                {alternative.type === 'homemade' ? <ChefHat size={16} /> : <Package size={16} />}
              </div>
              <h3 className="title-md" style={{ fontSize: '17px' }}>
                {alternative.type === 'homemade' ? 'Homemade Recipe' : 'Packaged Alternative'}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onToggleFavourite(alternative)}
                title={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
                style={{
                  background: isFavourite ? 'rgba(232, 143, 167, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isFavourite ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.1)'}`,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isFavourite ? 'var(--accent-rose)' : 'var(--text-muted)',
                }}
              >
                <Heart size={16} fill={isFavourite ? 'var(--accent-rose)' : 'none'} />
              </button>

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
            {/* Title & Emoji Card */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.2) 0%, rgba(196, 181, 253, 0.15) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  flexShrink: 0,
                }}
              >
                {alternative.imageEmoji || '🥗'}
              </div>

              <div>
                <h3 className="title-md" style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {alternative.name}
                </h3>
                {alternative.brand && (
                  <div className="caption" style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                    Brand: {alternative.brand}
                  </div>
                )}
                <div className="caption" style={{ color: 'var(--text-muted)' }}>
                  Serving size: <strong>{alternative.servingSize}</strong>
                </div>
              </div>
            </div>

            {/* Prep & Cost Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {alternative.prepTimeMinutes && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(196, 181, 253, 0.12)',
                    border: '1px solid rgba(196, 181, 253, 0.3)',
                    color: 'var(--accent-lavender)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Clock size={13} />
                  {alternative.prepTimeMinutes} mins prep time
                </span>
              )}

              {alternative.estimatedCostDetails && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <DollarSign size={13} />
                  Est. Cost: {alternative.estimatedCostDetails}
                </span>
              )}
            </div>

            {/* Explanation Card */}
            {alternative.explanation && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, rgba(196, 181, 253, 0.05) 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Sparkles size={18} color="var(--verdict-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  <strong>Personalized recommendation:</strong> {alternative.explanation}
                </div>
              </div>
            )}

            {/* Ingredients Section */}
            <div>
              <h4 className="title-md" style={{ fontSize: '15px', marginBottom: '8px' }}>
                Key Ingredients ({alternative.ingredients.length})
              </h4>
              <ul
                style={{
                  paddingLeft: '18px',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {alternative.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Instructions (For Homemade) */}
            {alternative.instructions && alternative.instructions.length > 0 && (
              <div>
                <h4 className="title-md" style={{ fontSize: '15px', marginBottom: '8px' }}>
                  Preparation Instructions
                </h4>
                <ol
                  style={{
                    paddingLeft: '18px',
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                  }}
                >
                  {alternative.instructions.map((step, idx) => (
                    <li key={idx} style={{ paddingLeft: '4px' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Full Nutrition Facts Grid */}
            <div>
              <h4 className="title-md" style={{ fontSize: '15px', marginBottom: '8px' }}>
                Nutritional Breakdown (per {alternative.servingSize})
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calories</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.energy_kcal !== undefined ? `${n.energy_kcal} kcal` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Carbs</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.carbs_g !== undefined ? `${n.carbs_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Sugar</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.sugar_g !== undefined ? `${n.sugar_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Added Sugar</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.added_sugar_g !== undefined ? `${n.added_sugar_g}g` : '0g'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dietary Fiber</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--verdict-green)' }}>
                    {n.fiber_g !== undefined ? `${n.fiber_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Protein</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.protein_g !== undefined ? `${n.protein_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Fat</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.total_fat_g !== undefined ? `${n.total_fat_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saturated Fat</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.saturated_fat_g !== undefined ? `${n.saturated_fat_g}g` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sodium</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.sodium_mg !== undefined ? `${n.sodium_mg}mg` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Health and Safety Notice */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <ShieldAlert size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="caption" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                For Type 1 Diabetes, carbohydrate information is provided for personal carb counting and is not an insulin dosage prescription. Nutritional values are curated and estimated; verify labels where applicable.
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
              <Button
                variant={isInBasket ? 'secondary' : 'primary'}
                fullWidth
                onClick={handleAddToBasket}
                icon={<ShoppingBag size={16} color={isInBasket ? 'var(--verdict-green)' : 'currentColor'} />}
                style={{
                  borderColor: isInBasket ? 'rgba(52, 211, 153, 0.4)' : undefined,
                  color: isInBasket ? 'var(--verdict-green)' : undefined,
                }}
              >
                {isInBasket ? `In Basket (${existingBasketItem.quantity}) • Add Another Unit` : 'Add to Grocery Basket'}
              </Button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {onCompare && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      onCompare(alternative);
                      onClose();
                    }}
                    icon={<ArrowRightLeft size={16} />}
                  >
                    Compare with Scanned
                  </Button>
                )}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => onToggleFavourite(alternative)}
                  icon={<Heart size={16} fill={isFavourite ? 'currentColor' : 'none'} />}
                >
                  {isFavourite ? 'In Favourites' : 'Add to Favourites'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
