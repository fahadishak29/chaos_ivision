import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Heart, ArrowRightLeft, Leaf, ShieldAlert } from 'lucide-react';
import { Product } from '../../types/product';
import { VerdictResult } from '../../types/verdict';
import { SmartAlternative } from '../../types/alternatives';
import { useProfile } from '../../context/ProfileContext';
import { useFavourites } from '../../context/FavouritesContext';
import { getSmartAlternatives } from '../../services/alternativesEngine';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';
import { AlternativeCard } from '../alternatives/AlternativeCard';

export interface AlternativesProps {
  scannedProduct: Product;
  verdict: VerdictResult;
  onExploreAll: () => void;
  onOpenCompare: (alt: SmartAlternative) => void;
  onOpenDetails: (alt: SmartAlternative) => void;
}

export const Alternatives: React.FC<AlternativesProps> = ({
  scannedProduct,
  verdict,
  onExploreAll,
  onOpenCompare,
  onOpenDetails,
}) => {
  const { profile } = useProfile();
  const { toggleFavourite, isFavourite } = useFavourites();
  const [topAlternatives, setTopAlternatives] = useState<SmartAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!profile) return;
      setIsLoading(true);
      try {
        const alts = await getSmartAlternatives(scannedProduct, verdict, profile);
        if (isMounted) {
          setTopAlternatives(alts.slice(0, 2));
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [scannedProduct, profile, verdict]);

  const isRed = verdict.overall === 'red';
  const isYellow = verdict.overall === 'yellow';

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Header Banner */}
      <GlassCard
        variant="rose"
        padding="md"
        style={{
          marginBottom: '16px',
          border: '1px solid rgba(232, 143, 167, 0.3)',
          boxShadow: '0 8px 30px rgba(232, 143, 167, 0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
              color: '#120815',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 className="title-md" style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '3px' }}>
              {isRed
                ? 'Flagged for Your Profile'
                : isYellow
                ? 'Caution Items Detected'
                : 'Healthier Whole-Food Swaps'}
            </h3>
            <p className="caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {isRed
                ? 'Explore safe, verified whole foods and recipes that eliminate your flagged ingredients and nutrient limits.'
                : 'Discover wholesome alternatives with lower sugar, balanced carbs, and zero declared allergens.'}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={onExploreAll}
          icon={<Sparkles size={16} />}
        >
          {isRed ? 'Find Better Alternatives' : 'Explore Alternatives'}
        </Button>
      </GlassCard>

      {/* Preview Cards */}
      {topAlternatives.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--verdict-green)' }}>
              <Leaf size={16} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Top Matched Alternatives
              </span>
            </div>
            <button
              type="button"
              onClick={onExploreAll}
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span>See all ({topAlternatives.length}+)</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {topAlternatives.map((alt) => (
            <AlternativeCard
              key={alt.id}
              alternative={alt}
              onCompare={onOpenCompare}
              onViewDetails={onOpenDetails}
              onToggleFavourite={toggleFavourite}
              isFavourite={isFavourite(alt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
