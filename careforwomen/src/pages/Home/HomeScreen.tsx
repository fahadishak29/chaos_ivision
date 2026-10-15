import React from 'react';
import {
  ScanLine,
  Sparkles,
  ArrowRight,
  Pencil,
  Check,
  Plus,
  History,
  BookOpen,
  Info,
  Leaf,
  ShoppingBag,
} from 'lucide-react';
import { NutriButton } from '../../components/ui/NutriButton';
import { NutriVerdictBadge } from '../../components/ui/NutriVerdictBadge';
import { ProductArt } from '../../components/ui/ProductArt';
import { useProfile } from '../../context/ProfileContext';
import { useHistory } from '../../context/HistoryContext';
import { useBasket } from '../../context/BasketContext';
import { ScanRecord } from '../../types/scan';

export interface HomeScreenProps {
  onStartScan: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenBasket?: () => void;
  onSelectScan: (scan: ScanRecord) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartScan,
  onOpenHistory,
  onOpenProfile,
  onOpenBasket,
  onSelectScan,
}) => {
  const { profile } = useProfile();
  const { scans } = useHistory();
  const { totalItemsCount, uniqueProductsCount } = useBasket();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = profile?.displayName ? profile.displayName.split(' ')[0] : 'Friend';

  // Date formatting
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // Derive active preference tags from HealthProfile
  const preferences: { id: string; label: string; type: string }[] = [];
  if (profile?.lifeStages?.includes('pcos')) {
    preferences.push({ id: 'pcos', label: 'PCOS / PCOD', type: 'pcos' });
  }
  if (profile?.lifeStages?.includes('pregnancy')) {
    preferences.push({ id: 'pregnancy', label: 'Pregnancy', type: 'pregnancy' });
  }
  if (profile?.lifeStages?.includes('breastfeeding')) {
    preferences.push({ id: 'breastfeeding', label: 'Breastfeeding', type: 'breastfeeding' });
  }
  if (profile?.diabetesType && profile.diabetesType !== 'none') {
    preferences.push({
      id: 'diabetes',
      label: profile.diabetesType === 'type1' ? 'Type 1 Diabetes' : 'Type 2 Diabetes',
      type: 'diabetes',
    });
  }
  if (profile?.lactoseIntolerant) {
    preferences.push({ id: 'lactose', label: 'Lactose aware', type: 'lactose' });
  }
  if (profile?.allergies && profile.allergies.length > 0) {
    profile.allergies.slice(0, 3).forEach((a) => {
      const formatted = a.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      preferences.push({ id: a, label: `${formatted} alert`, type: 'allergy' });
    });
  }

  const recentScans = scans.slice(0, 3);

  return (
    <div className="animate-in">
      {/* Top Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">{todayStr}</div>
          <h1>{timeGreeting}, {name}.</h1>
          <p>Make your next food choice feel a little more informed.</p>
        </div>
        <NutriButton onClick={onStartScan} className="scan-button">
          <ScanLine className="size-4 shrink-0" />
          <span>Scan a product</span>
        </NutriButton>
      </div>

      {/* Hero Editorial Card */}
      <div className="hero-card">
        <div>
          <div className="hero-label">
            <Sparkles className="size-3.5 shrink-0" />
            <span>PERSONALIZED FOOD INTELLIGENCE</span>
          </div>
          <h2>
            See beyond<br />
            <em>the label.</em>
          </h2>
          <p>
            NutriLens translates ingredient lists into clear, personal guidance — shaped around what matters to you.
          </p>
          <NutriButton variant="outline" onClick={onOpenProfile} className="outline border-primary/30 text-primary hover:bg-primary/10">
            Review my profile <ArrowRight className="size-4 shrink-0" />
          </NutriButton>
        </div>


        {/* Orbit Art */}
        <div className="hero-illustration" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-lens">
            <Leaf />
          </div>
          <div className="hero-dot dot-one" />
          <div className="hero-dot dot-two" />
        </div>
      </div>

      {/* Section: Your Preferences */}
      <div className="section-row mt-10">
        <div>
          <h2 className="section-title">Your preferences</h2>
          <p className="section-subtitle">Used to personalize every assessment.</p>
        </div>
        <button className="text-action" onClick={onOpenProfile} type="button">
          <Pencil className="size-3.5 shrink-0" />
          <span>Edit profile</span>
        </button>
      </div>

      <div className="preference-grid">
        {preferences.map((pref) => {
          const iconClass =
            pref.type === 'lactose'
              ? 'pref-lactose'
              : pref.type === 'allergy'
              ? 'pref-danger'
              : '';
          return (
            <div className="preference-card" key={pref.id}>
              <div className={`pref-icon ${iconClass}`}>
                <Check />
              </div>
              <span>{pref.label}</span>
            </div>
          );
        })}

        <button className="preference-card preference-add" onClick={onOpenProfile} type="button">
          <Plus />
          <span>{preferences.length === 0 ? 'Set up preferences' : 'Add preference'}</span>
        </button>
      </div>

      {/* Smart Basket Quick Card (Shown when basket has items) */}
      {totalItemsCount > 0 && onOpenBasket && (
        <div
          onClick={onOpenBasket}
          className="cursor-pointer mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between hover:bg-primary/10 transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenBasket();
          }}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-plum">
                Smart Grocery Basket ({totalItemsCount} units)
              </div>
              <div className="text-xs text-primary/70">
                {uniqueProductsCount} unique items analyzed against your profile
              </div>
            </div>
          </div>
          <ArrowRight className="size-4 text-primary" />
        </div>
      )}

      {/* Section: Recently Scanned */}
      <div className="section-row recent-row">
        <div>
          <h2 className="section-title">Recently scanned</h2>
          <p className="section-subtitle">Your latest product assessments.</p>
        </div>
        <button className="text-action" onClick={onOpenHistory} type="button">
          <span>View all</span>
          <ArrowRight className="size-3.5 shrink-0" />
        </button>
      </div>

      {recentScans.length > 0 ? (
        <div className="recent-grid">
          {recentScans.map((scan) => {
            const timeLabel = new Date(scan.scannedAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });
            return (
              <button
                className="recent-card"
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                type="button"
              >
                <ProductArt product={scan.product} />
                <div className="recent-info min-w-0">
                  <div className="text-[11px] text-plum/45 truncate">
                    {scan.product.brand || 'Packaged Product'}
                  </div>
                  <div className="mt-1 text-sm font-semibold truncate text-plum">
                    {scan.product.name}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <NutriVerdictBadge verdict={scan.verdict.overall} />
                    <span className="text-[10px] text-plum/35 shrink-0">{timeLabel}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <History className="size-8 text-plum/30" />
          <h2>No scans yet</h2>
          <p>Your completed assessments will appear here.</p>
          <NutriButton onClick={onStartScan} className="scan-button">
            Scan your first product
          </NutriButton>
        </div>
      )}

      {/* Informational: How your assessment works */}
      <div className="how-card">
        <div className="how-icon">
          <BookOpen />
        </div>
        <div>
          <div className="text-sm font-semibold text-plum">How your assessment works</div>
          <p className="mt-1 text-xs leading-relaxed text-plum/60">
            We use transparent, deterministic rules to compare product data with your active health profile. Missing nutrition information is always called out honestly — never quietly assumed safe.
          </p>
        </div>
        <Info className="ml-auto hidden size-4 text-plum/25 sm:block shrink-0" />
      </div>
    </div>
  );
};

export default HomeScreen;
