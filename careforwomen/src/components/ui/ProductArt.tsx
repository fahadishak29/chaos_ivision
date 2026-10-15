import React from 'react';

export interface ProductArtProps {
  product: {
    id?: string;
    barcode?: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    image?: string;
  };
  large?: boolean;
  className?: string;
}

export const ProductArt: React.FC<ProductArtProps> = ({ product, large = false, className = '' }) => {
  const brand = product.brand || 'Product';
  const name = product.name || 'Food';

  // Emoji fallback based on common product keywords if no image
  const getFallbackEmoji = () => {
    if (product.image) return product.image;
    const lower = `${name} ${brand}`.toLowerCase();
    if (lower.includes('oat') || lower.includes('granola') || lower.includes('cereal')) return '🥣';
    if (lower.includes('yogurt') || lower.includes('milk') || lower.includes('dairy')) return '🍓';
    if (lower.includes('cookie') || lower.includes('biscuit') || lower.includes('snack')) return '🍪';
    if (lower.includes('nutella') || lower.includes('spread') || lower.includes('hazelnut')) return '🍫';
    if (lower.includes('cola') || lower.includes('soda') || lower.includes('drink')) return '🥤';
    if (lower.includes('bread') || lower.includes('toast')) return '🍞';
    if (lower.includes('fruit') || lower.includes('apple')) return '🍎';
    if (lower.includes('salad') || lower.includes('green')) return '🥗';
    return '📦';
  };

  const idClass = product.id ? `art-${product.id}` : '';

  return (
    <div
      className={`product-art ${large ? 'product-art-large' : ''} ${idClass} ${className}`}
      aria-label={`${name} demonstration image`}
      role="img"
    >
      <div className="product-art-glow" />
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={name}
          className="relative z-10 w-full h-full object-contain p-1 rounded-lg"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{getFallbackEmoji()}</span>
      )}
      <small className="truncate max-w-[90%] text-center">{brand}</small>
    </div>
  );
};

export default ProductArt;
