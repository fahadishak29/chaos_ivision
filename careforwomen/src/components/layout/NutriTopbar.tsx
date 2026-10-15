import React from 'react';
import { Menu, CircleHelp, ShoppingBag } from 'lucide-react';
import { NutriLogo } from '../ui/NutriLogo';
import { useProfile } from '../../context/ProfileContext';
import { useBasket } from '../../context/BasketContext';

export interface NutriTopbarProps {
  onOpenMobileNav: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenBasket?: () => void;
}

export const NutriTopbar: React.FC<NutriTopbarProps> = ({
  onOpenMobileNav,
  onOpenSettings,
  onOpenProfile,
  onOpenBasket,
}) => {
  const { profile } = useProfile();
  const { totalItemsCount } = useBasket();
  const displayName = profile?.displayName || 'Friend';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AM';

  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        type="button"
      >
        <Menu className="size-5" />
      </button>

      <div className="md:hidden">
        <NutriLogo compact />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {onOpenBasket && (
          <button
            className="p-1 hover:text-plum transition-colors relative cursor-pointer"
            onClick={onOpenBasket}
            aria-label="Grocery Basket"
            type="button"
            title="Grocery Basket"
          >
            <ShoppingBag className="size-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>
        )}

        <button
          className="help-button p-1 hover:text-plum transition-colors"
          onClick={onOpenSettings}
          aria-label="Help & Settings"
          type="button"
          title="Settings & Info"
        >
          <CircleHelp className="size-5" />
        </button>

        <button
          className="top-avatar cursor-pointer hover:ring-2 hover:ring-plum/30 transition-all border-none"
          onClick={onOpenProfile}
          type="button"
          title={`Profile: ${displayName}`}
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

export default NutriTopbar;
