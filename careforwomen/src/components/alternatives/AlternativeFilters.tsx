import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Heart, Sparkles, RotateCcw } from 'lucide-react';
import { AlternativeFilterState, MealCategory, AlternativeType, BudgetTier } from '../../types/alternatives';

export interface AlternativeFiltersProps {
  filters: AlternativeFilterState;
  onFilterChange: (filters: AlternativeFilterState) => void;
  favouritesCount: number;
  totalResults: number;
}

export const AlternativeFilters: React.FC<AlternativeFiltersProps> = ({
  filters,
  onFilterChange,
  favouritesCount,
  totalResults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isDefaultFilters =
    filters.category === 'all' &&
    filters.type === 'all' &&
    filters.dietary === 'all' &&
    filters.maxPrepTime === 'any' &&
    filters.nutritionGoal === 'all' &&
    filters.budget === 'all' &&
    !filters.onlyFavourites &&
    !filters.searchQuery.trim();

  const resetFilters = () => {
    onFilterChange({
      category: 'all',
      type: 'all',
      dietary: 'all',
      maxPrepTime: 'any',
      nutritionGoal: 'all',
      budget: 'all',
      onlyFavourites: false,
      searchQuery: '',
    });
  };

  const primaryOptions = [
    { id: 'all', label: 'All Items', active: filters.category === 'all' && filters.type === 'all' && !filters.onlyFavourites },
    { id: 'fav', label: `★ Favourites (${favouritesCount})`, active: filters.onlyFavourites },
    { id: 'snack', label: '🍿 Snacks', active: filters.category === 'snack' },
    { id: 'breakfast', label: '🥣 Breakfast', active: filters.category === 'breakfast' },
    { id: 'lunch', label: '🥗 Lunch', active: filters.category === 'lunch' },
    { id: 'dinner', label: '🍲 Dinner', active: filters.category === 'dinner' },
    { id: 'drink', label: '🥤 Drinks', active: filters.category === 'drink' },
    { id: 'homemade', label: '🍳 Homemade', active: filters.type === 'homemade' },
    { id: 'packaged', label: '📦 Packaged', active: filters.type === 'packaged' },
  ];

  const handleSelectPrimary = (id: string) => {
    if (id === 'fav') {
      onFilterChange({ ...filters, onlyFavourites: !filters.onlyFavourites });
    } else if (id === 'all') {
      onFilterChange({ ...filters, category: 'all', type: 'all', onlyFavourites: false });
    } else if (id === 'homemade' || id === 'packaged') {
      onFilterChange({
        ...filters,
        type: filters.type === id ? 'all' : (id as AlternativeType),
        onlyFavourites: false,
      });
    } else {
      onFilterChange({
        ...filters,
        category: filters.category === id ? 'all' : (id as MealCategory),
        onlyFavourites: false,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
      {/* Search Input Bar with Filter Button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search ingredients or alternatives..."
            className="glass-input"
            style={{ paddingLeft: '38px', paddingRight: filters.searchQuery ? '34px' : '14px', fontSize: '13.5px' }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="More Filters"
          style={{
            height: '42px',
            padding: '0 14px',
            borderRadius: 'var(--radius-md)',
            background: showAdvanced || (!isDefaultFilters && !filters.onlyFavourites) ? 'var(--accent-rose-soft)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${showAdvanced || (!isDefaultFilters && !filters.onlyFavourites) ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: showAdvanced || (!isDefaultFilters && !filters.onlyFavourites) ? 'var(--accent-rose)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {!isDefaultFilters && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-rose)',
              }}
            />
          )}
        </button>
      </div>

      {/* Primary Category Horizontal Scroll Pills */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {primaryOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSelectPrimary(opt.id)}
            style={{
              padding: '6px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: opt.active ? 700 : 500,
              background: opt.active ? 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)' : 'rgba(255, 255, 255, 0.04)',
              color: opt.active ? '#120815' : 'var(--text-secondary)',
              border: `1px solid ${opt.active ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`,
              boxShadow: opt.active ? '0 2px 10px var(--accent-rose-glow)' : 'none',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Dietary Filter */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Dietary Preference
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {[
                { id: 'all', label: 'All Diets' },
                { id: 'vegetarian', label: '🌱 Vegetarian' },
                { id: 'vegan', label: '🌿 Vegan' },
                { id: 'gluten_free', label: '🌾 Gluten-Free' },
                { id: 'dairy_free', label: '🥛 Dairy-Free' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, dietary: d.id as any })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11.5px',
                    fontWeight: filters.dietary === d.id ? 700 : 500,
                    background: filters.dietary === d.id ? 'var(--accent-lavender)' : 'rgba(255, 255, 255, 0.04)',
                    color: filters.dietary === d.id ? '#120815' : 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nutritional Goal Filter */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Nutritional Focus
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {[
                { id: 'all', label: 'Any Nutrition' },
                { id: 'low_sugar', label: '🍬 Low Sugar (≤5g)' },
                { id: 'low_carb', label: '📉 Low Carb (≤15g)' },
                { id: 'high_protein', label: '💪 High Protein (≥8g)' },
                { id: 'low_sodium', label: '🧂 Low Sodium (≤200mg)' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, nutritionGoal: g.id as any })}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11.5px',
                    fontWeight: filters.nutritionGoal === g.id ? 700 : 500,
                    background: filters.nutritionGoal === g.id ? 'var(--verdict-green)' : 'rgba(255, 255, 255, 0.04)',
                    color: filters.nutritionGoal === g.id ? '#120815' : 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prep Time & Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Max Prep Time
              </span>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[
                  { id: 'any', label: 'Any' },
                  { id: 10, label: '≤ 10m' },
                  { id: 20, label: '≤ 20m' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, maxPrepTime: p.id as any })}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: filters.maxPrepTime === p.id ? 700 : 500,
                      background: filters.maxPrepTime === p.id ? 'rgba(232, 143, 167, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: filters.maxPrepTime === p.id ? 'var(--accent-rose)' : 'var(--text-secondary)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Budget Level
              </span>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: '$', label: '$ Budget' },
                  { id: '$$', label: '$$' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, budget: b.id as any })}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: filters.budget === b.id ? 700 : 500,
                      background: filters.budget === b.id ? 'rgba(232, 143, 167, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: filters.budget === b.id ? 'var(--accent-rose)' : 'var(--text-secondary)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters CTA */}
          {!isDefaultFilters && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  color: 'var(--accent-rose)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset all filters</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Showing Result Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <span className="caption" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          Showing <strong>{totalResults}</strong> tailored {totalResults === 1 ? 'alternative' : 'alternatives'}
        </span>
        {!isDefaultFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="caption"
            style={{ color: 'var(--accent-rose)', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear active filters
          </button>
        )}
      </div>
    </div>
  );
};
