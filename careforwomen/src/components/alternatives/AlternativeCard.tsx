import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Heart, Sparkles, ArrowRightLeft, Info, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { SmartAlternative } from '../../types/alternatives';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';
import { useBasket } from '../../context/BasketContext';
import { alternativeToProduct, extractPriceFromCostDetails } from '../../services/basketEngine';

export interface AlternativeCardProps {
  alternative: SmartAlternative;
  onCompare: (alt: SmartAlternative) => void;
  onViewDetails: (alt: SmartAlternative) => void;
  onToggleFavourite: (alt: SmartAlternative) => void;
  isFavourite: boolean;
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({
  alternative,
  onCompare,
  onViewDetails,
  onToggleFavourite,
  isFavourite,
}) => {
  const { addItem, getItemByProductId } = useBasket();
  const existingBasketItem = getItemByProductId(`alt_${alternative.id}`);
  const isInBasket = !!existingBasketItem;

  const handleAddToBasket = () => {
    const prod = alternativeToProduct(alternative);
    const price = extractPriceFromCostDetails(alternative.estimatedCostDetails);
    addItem(prod, 1, price, 'alternative', alternative);
  };

  const n = alternative.nutrients;

  const categoryLabels: Record<string, string> = {
    snack: 'Snack',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    drink: 'Drink',
  };

  return (
    <GlassCard
      variant="default"
      padding="none"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        position: 'relative',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Top Header Banner with Category & Type Badges */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(232, 143, 167, 0.15)',
              border: '1px solid rgba(232, 143, 167, 0.3)',
              color: 'var(--accent-rose)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {categoryLabels[alternative.category] || alternative.category}
          </span>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
            }}
          >
            {alternative.type === 'homemade' ? '🍳 Homemade' : '📦 Packaged'}
          </span>

          {alternative.prepTimeMinutes && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-lavender)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
              }}
            >
              <Clock size={12} />
              {alternative.prepTimeMinutes}m prep
            </span>
          )}

          {alternative.estimatedCostDetails && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <DollarSign size={11} />
              {alternative.estimatedCostDetails}
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(alternative);
          }}
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
            cursor: 'pointer',
            color: isFavourite ? 'var(--accent-rose)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          <Heart size={16} fill={isFavourite ? 'var(--accent-rose)' : 'none'} />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '4px 16px 14px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
          {alternative.imageUrl ? (
            <img
              src={alternative.imageUrl}
              alt={alternative.name}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '3px',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.15) 0%, rgba(196, 181, 253, 0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                flexShrink: 0,
              }}
            >
              {alternative.imageEmoji || '🥗'}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '2px',
              }}
            >
              {alternative.name}
            </h4>
            {alternative.brand && (
              <span className="caption" style={{ color: 'var(--accent-lavender)', fontWeight: 600 }}>
                {alternative.brand} •{' '}
              </span>
            )}
            <span className="caption" style={{ color: 'var(--text-muted)' }}>
              Serving: {alternative.servingSize}
            </span>
          </div>
        </div>

        <p
          className="caption"
          style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '12px',
          }}
        >
          {alternative.description}
        </p>

        {/* Explainable Personalisation Badge */}
        {alternative.explanation && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08) 0%, rgba(196, 181, 253, 0.05) 100%)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={16} color="var(--verdict-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              <strong>Why this fits you:</strong> {alternative.explanation}
            </div>
          </div>
        )}

        {/* Comparison Highlights Tags */}
        {alternative.comparisonHighlights && alternative.comparisonHighlights.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {alternative.comparisonHighlights.map((hl, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: 'var(--verdict-green)',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={12} />
                {hl}
              </span>
            ))}
          </div>
        )}

        {/* Nutrition Quick Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            padding: '8px 10px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cals</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {n.energy_kcal !== undefined ? `${n.energy_kcal}` : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sugar</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {n.sugar_g !== undefined ? `${n.sugar_g}g` : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carbs</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {n.carbs_g !== undefined ? `${n.carbs_g}g` : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protein</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {n.protein_g !== undefined ? `${n.protein_g}g` : '—'}
            </div>
          </div>
        </div>

        {/* Basket Action Button */}
        <Button
          variant={isInBasket ? 'secondary' : 'outline'}
          size="sm"
          fullWidth
          onClick={handleAddToBasket}
          icon={<ShoppingBag size={14} color={isInBasket ? 'var(--verdict-green)' : 'currentColor'} />}
          style={{
            marginBottom: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            borderColor: isInBasket ? 'rgba(52, 211, 153, 0.4)' : undefined,
            color: isInBasket ? 'var(--verdict-green)' : undefined,
          }}
        >
          {isInBasket ? `In Basket (${existingBasketItem.quantity}) • Add +1` : 'Add to Grocery Basket'}
        </Button>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCompare(alternative)}
            icon={<ArrowRightLeft size={14} />}
            style={{ flex: 1, padding: '9px 12px', fontSize: '12.5px' }}
          >
            Compare
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewDetails(alternative)}
            icon={<Info size={14} />}
            style={{ flex: 1, padding: '9px 12px', fontSize: '12.5px' }}
          >
            {alternative.type === 'homemade' ? 'Recipe & Steps' : 'Details'}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
