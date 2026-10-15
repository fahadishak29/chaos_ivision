import React from 'react';
import { Home, ScanLine, UserRound, History, Settings, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { NutriLogo } from '../ui/NutriLogo';
import { useProfile } from '../../context/ProfileContext';

export type NutriPage = 'home' | 'scan' | 'profile' | 'history' | 'settings' | 'result';

export interface NutriSidebarProps {
  currentPage: NutriPage;
  onNavigate: (page: NutriPage) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const NutriSidebar: React.FC<NutriSidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { profile } = useProfile();

  const navItems = [
    { id: 'home' as NutriPage, label: 'Overview', icon: Home },
    { id: 'scan' as NutriPage, label: 'Scan product', icon: ScanLine },
    { id: 'profile' as NutriPage, label: 'My profile', icon: UserRound },
    { id: 'history' as NutriPage, label: 'Scan history', icon: History },
    { id: 'settings' as NutriPage, label: 'Settings', icon: Settings },
  ];

  const displayName = profile?.displayName || 'Health Explorer';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'HE';

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Sidebar navigation">
      <div className="flex items-center justify-between">
        <NutriLogo />
        <button
          className="mobile-close"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="sidebar-rule" />

      <nav className="flex flex-col gap-1" aria-label="Primary navigation">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id || (id === 'scan' && currentPage === 'result');
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              type="button"
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
              {id === 'scan' && <span className="nav-kbd">⌘ K</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="profile-mini text-left w-full hover:bg-black/5 rounded-lg transition-colors border-none"
        >
          <div className="profile-avatar">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate text-plum">{displayName}</div>
            <div className="text-[11px] text-plum/45">Profile active</div>
          </div>
          <ChevronRight className="ml-auto size-4 text-plum/30 shrink-0" />
        </button>

        <div className="flex items-center gap-2 px-3 pt-5 text-[11px] text-plum/45">
          <ShieldCheck className="size-3.5 text-sage-strong shrink-0" />
          <span>Your data is protected & private</span>
        </div>
      </div>
    </aside>
  );
};

export default NutriSidebar;
