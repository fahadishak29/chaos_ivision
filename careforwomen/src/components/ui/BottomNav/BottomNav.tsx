import React from 'react';
import { motion } from 'framer-motion';
import { Home, Scan, History, User, ShoppingBag } from 'lucide-react';
import { useBasket } from '../../../context/BasketContext';

export type TabType = 'home' | 'scan' | 'history' | 'profile' | 'basket';

export interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { totalItemsCount } = useBasket();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--max-app-width)',
          padding: '12px 14px 20px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(18, 18, 31, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 10px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              color: activeTab === 'home' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <Home size={20} />
            <span style={{ fontSize: '10.5px', fontWeight: activeTab === 'home' ? 700 : 500 }}>
              Home
            </span>
          </button>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => onTabChange('history')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              color: activeTab === 'history' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <History size={20} />
            <span style={{ fontSize: '10.5px', fontWeight: activeTab === 'history' ? 700 : 500 }}>
              History
            </span>
          </button>

          {/* Center Scan Button (Big & Prominent) */}
          <div style={{ position: 'relative', top: '-18px', padding: '0 4px' }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
              onClick={() => onTabChange('scan')}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
                color: '#120815',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 24px var(--accent-rose-glow), 0 0 0 4px rgba(18, 18, 31, 0.9)',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <Scan size={26} strokeWidth={2.4} />
            </motion.button>
          </div>

          {/* Basket Tab (with item count badge) */}
          <button
            type="button"
            onClick={() => onTabChange('basket')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              color: activeTab === 'basket' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={20} />
              {totalItemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-9px',
                    background: 'var(--accent-rose)',
                    color: '#120815',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-full)',
                    minWidth: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 8px var(--accent-rose-glow)',
                  }}
                >
                  {totalItemsCount > 99 ? '99+' : totalItemsCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: activeTab === 'basket' ? 700 : 500 }}>
              Basket
            </span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 8px',
              color: activeTab === 'profile' ? 'var(--accent-rose)' : 'var(--text-muted)',
              transition: 'color 0.2s',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <User size={20} />
            <span style={{ fontSize: '10.5px', fontWeight: activeTab === 'profile' ? 700 : 500 }}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
