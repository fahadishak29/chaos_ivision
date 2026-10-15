import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../../types/product';
import { VerdictResult } from '../../types/verdict';
import { SmartAlternative, AlternativeFilterState, ProductComparisonData } from '../../types/alternatives';
import { useProfile } from '../../context/ProfileContext';
import { useFavourites } from '../../context/FavouritesContext';
import { getSmartAlternatives, filterAlternatives, generateProductComparison, inferProductCategory } from '../../services/alternativesEngine';
import { AlternativeCard } from './AlternativeCard';
import { AlternativeFilters } from './AlternativeFilters';
import { ProductComparisonModal } from './ProductComparisonModal';
import { AlternativeDetailModal } from './AlternativeDetailModal';
import { SkeletonLoader } from '../ui/SkeletonLoader/SkeletonLoader';
import { Button } from '../ui/Button/Button';
import { GlassCard } from '../ui/Card/GlassCard';

export interface AlternativesExplorerProps {
  scannedProduct: Product;
  verdict: VerdictResult;
  onBack: () => void;
}

export const AlternativesExplorer: React.FC<AlternativesExplorerProps> = ({
  scannedProduct,
  verdict,
  onBack,
}) => {
  const { profile } = useProfile();
  const { favourites, favouriteIds, toggleFavourite, isFavourite } = useFavourites();

  const [allAlternatives, setAllAlternatives] = useState<SmartAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialCat = inferProductCategory(scannedProduct);

  const [filters, setFilters] = useState<AlternativeFilterState>({
    category: 'all',
    type: 'all',
    dietary: 'all',
    maxPrepTime: 'any',
    nutritionGoal: 'all',
    budget: 'all',
    onlyFavourites: false,
    searchQuery: '',
  });

  const [comparisonData, setComparisonData] = useState<ProductComparisonData | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [detailAlternative, setDetailAlternative] = useState<SmartAlternative | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadAlternatives = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    try {
      const results = await getSmartAlternatives(scannedProduct, verdict, profile);
      setAllAlternatives(results);
    } catch (err: any) {
      setError(err?.message || 'Unable to generate personalized alternatives at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlternatives();
  }, [scannedProduct, profile]);

  const displayedAlternatives = filterAlternatives(allAlternatives, filters, favouriteIds);

  const handleOpenComparison = (alt: SmartAlternative) => {
    if (!profile) return;
    const data = generateProductComparison(scannedProduct, alt, profile);
    setComparisonData(data);
    setIsComparisonOpen(true);
  };

  const handleOpenDetails = (alt: SmartAlternative) => {
    setDetailAlternative(alt);
    setIsDetailOpen(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 20px 60px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
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

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-rose)', letterSpacing: '0.06em' }}>
            PERSONALIZED CHOICES
          </span>
          <h2 className="title-md" style={{ fontSize: '17px', margin: 0 }}>
            Smart Alternatives
          </h2>
        </div>

        <button
          type="button"
          onClick={loadAlternatives}
          title="Refresh recommendations"
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
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Target Scanned Product Summary Pill */}
      <GlassCard
        padding="sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '18px',
          background: 'rgba(232, 143, 167, 0.05)',
          border: '1px solid rgba(232, 143, 167, 0.2)',
        }}
      >
        {scannedProduct.imageUrl ? (
          <img
            src={scannedProduct.imageUrl}
            alt=""
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'contain',
              background: '#fff',
              padding: '2px',
              flexShrink: 0,
            }}
          />
        ) : (
          <span style={{ fontSize: '20px', flexShrink: 0 }}>📦</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Alternatives for scanned item:
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {scannedProduct.name}
          </div>
        </div>
      </GlassCard>

      {/* Filter Component */}
      <AlternativeFilters
        filters={filters}
        onFilterChange={setFilters}
        favouritesCount={favourites.length}
        totalResults={displayedAlternatives.length}
      />

      {/* Content Area */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <SkeletonLoader width="54px" height="54px" borderRadius="var(--radius-md)" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <SkeletonLoader width="70%" height="18px" />
                  <SkeletonLoader width="40%" height="12px" />
                </div>
              </div>
              <SkeletonLoader width="100%" height="36px" borderRadius="var(--radius-sm)" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <SkeletonLoader width="50%" height="34px" borderRadius="var(--radius-full)" />
                <SkeletonLoader width="50%" height="34px" borderRadius="var(--radius-full)" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : error ? (
        <GlassCard padding="lg" style={{ textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--verdict-red)" style={{ margin: '0 auto 10px' }} />
          <h4 className="title-md" style={{ marginBottom: '6px' }}>Unable to Load Alternatives</h4>
          <p className="caption" style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {error}
          </p>
          <Button variant="secondary" size="sm" onClick={loadAlternatives}>
            Try Again
          </Button>
        </GlassCard>
      ) : displayedAlternatives.length === 0 ? (
        <GlassCard padding="lg" style={{ textAlign: 'center', marginTop: '10px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>
            {filters.onlyFavourites ? '❤️' : '🔍'}
          </div>
          <h4 className="title-md" style={{ marginBottom: '6px' }}>
            {filters.onlyFavourites ? 'No Saved Favourites Yet' : 'No Matching Alternatives'}
          </h4>
          <p className="caption" style={{ color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto 16px' }}>
            {filters.onlyFavourites
              ? 'Tap the heart icon on any alternative card to save it here for quick meal planning.'
              : 'No foods matched all your active filters. Try broadening your dietary tags or prep time filters.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFilters({
                category: 'all',
                type: 'all',
                dietary: 'all',
                maxPrepTime: 'any',
                nutritionGoal: 'all',
                budget: 'all',
                onlyFavourites: false,
                searchQuery: '',
              })
            }
          >
            Reset All Filters
          </Button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayedAlternatives.map((alt) => (
            <AlternativeCard
              key={alt.id}
              alternative={alt}
              onCompare={handleOpenComparison}
              onViewDetails={handleOpenDetails}
              onToggleFavourite={toggleFavourite}
              isFavourite={isFavourite(alt.id)}
            />
          ))}
        </div>
      )}

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
        onCompare={handleOpenComparison}
        onToggleFavourite={toggleFavourite}
        isFavourite={detailAlternative ? isFavourite(detailAlternative.id) : false}
      />
    </div>
  );
};
