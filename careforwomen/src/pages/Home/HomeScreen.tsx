import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Sparkles, ArrowRight, ShieldCheck, History, Edit3, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { VerdictBadge } from '../../components/ui/VerdictBadge/VerdictBadge';
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

  const recentScans = scans.slice(0, 3);
  const name = profile?.displayName || 'Friend';

  // Format active profile condition tags
  const conditionTags: string[] = [];
  if (profile?.lifeStages?.includes('pcos')) conditionTags.push('🌸 PCOS');
  if (profile?.lifeStages?.includes('pregnancy')) conditionTags.push('🤰 Pregnancy');
  if (profile?.lifeStages?.includes('breastfeeding')) conditionTags.push('🤱 Breastfeeding');
  if (profile?.diabetesType === 'type1') conditionTags.push('💉 Type 1 Diabetes');
  if (profile?.diabetesType === 'type2') conditionTags.push('🩺 Type 2 Diabetes');
  if (profile?.lactoseIntolerant) conditionTags.push('🥛 Lactose Sensitive');
  if (profile?.allergies && profile.allergies.length > 0) {
    conditionTags.push(`🛡️ ${profile.allergies.length} Allergies`);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Greeting Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span className="caption" style={{ color: 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.04em' }}>
            SHE SCAN ACTIVE GUARD
          </span>
          <h1 className="title-xl" style={{ marginTop: '2px' }}>
            Hi, <span className="gradient-text-rose">{name}</span> 👋
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenBasket && (
            <button
              type="button"
              onClick={onOpenBasket}
              title="Open Smart Basket"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: totalItemsCount > 0 ? 'var(--accent-rose)' : 'var(--accent-lavender)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <ShoppingBag size={18} />
              {totalItemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
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
                  {totalItemsCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenProfile}
            title="Edit Profile"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-lavender)',
              cursor: 'pointer',
            }}
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Active Health Profile Pill Chips */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {conditionTags.length > 0 ? (
            conditionTags.map((tag, idx) => (
              <span key={idx} className="glass-pill" style={{ borderColor: 'rgba(232, 143, 167, 0.25)', color: 'var(--text-primary)' }}>
                {tag}
              </span>
            ))
          ) : (
            <span className="glass-pill" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
              ✨ General Wellness Profile • Tap to customize
            </span>
          )}
        </div>
      </div>

      {/* Main Scan Hero CTA Card */}
      <GlassCard
        variant="rose"
        padding="lg"
        style={{
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(232, 143, 167, 0.15)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 0' }}>
          {/* Big Glowing Scan Button Aura */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            onClick={onStartScan}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e88fa7 0%, #c4b5fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#120815',
              boxShadow: '0 0 35px var(--accent-rose-glow), 0 0 70px rgba(196, 181, 253, 0.3)',
              cursor: 'pointer',
              marginBottom: '18px',
            }}
          >
            <Scan size={44} strokeWidth={2.4} />
          </motion.div>

          <h2 className="title-lg" style={{ marginBottom: '6px' }}>
            Scan Packaged Food
          </h2>
          <p className="body-md" style={{ color: 'var(--text-secondary)', maxWidth: '280px', marginBottom: '18px' }}>
            Point your camera at any food barcode or snap the nutrition label for an instant safety verdict.
          </p>

          <Button variant="primary" size="md" onClick={onStartScan} icon={<Sparkles size={16} />}>
            Open Live Scanner
          </Button>
        </div>
      </GlassCard>

      {/* Smart Basket Quick Card (Shown when basket has items) */}
      {totalItemsCount > 0 && onOpenBasket && (
        <GlassCard
          variant="interactive"
          padding="md"
          onClick={onOpenBasket}
          style={{
            marginBottom: '24px',
            border: '1px solid rgba(232, 143, 167, 0.3)',
            background: 'linear-gradient(135deg, rgba(232, 143, 167, 0.08) 0%, rgba(196, 181, 253, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                }}
              >
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  Smart Grocery Basket ({totalItemsCount} units)
                </h4>
                <div className="caption" style={{ color: 'var(--accent-rose)' }}>
                  {uniqueProductsCount} unique items analyzed against your profile
                </div>
              </div>
            </div>

            <ArrowRight size={18} color="var(--accent-rose)" />
          </div>
        </GlassCard>
      )}

      {/* Recent Scans Section */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--accent-lavender)" />
            <h3 className="title-md">Recent Scans</h3>
          </div>
          {scans.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              style={{
                fontSize: '13px',
                color: 'var(--accent-rose)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View all ({scans.length})</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {recentScans.length === 0 ? (
          <GlassCard padding="md" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p className="body-md" style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
              No items scanned yet. Try scanning a grocery item to see your first personalized verdict!
            </p>
            <Button variant="secondary" size="sm" onClick={onStartScan}>
              Scan First Product
            </Button>
          </GlassCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentScans.map((record) => (
              <GlassCard
                key={record.id}
                variant="interactive"
                padding="sm"
                onClick={() => onSelectScan(record)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {record.product.imageUrl ? (
                      <img
                        src={record.product.imageUrl}
                        alt=""
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'contain',
                          background: '#ffffff',
                          padding: '2px',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        📦
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          maxWidth: '190px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {record.product.name}
                      </div>
                      <div className="caption" style={{ color: 'var(--text-muted)' }}>
                        {record.product.brand || 'Packaged item'}
                      </div>
                    </div>
                  </div>

                  <VerdictBadge verdict={record.verdict.overall} size="sm" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice Footer Card */}
      <GlassCard padding="md" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
        <ShieldCheck size={24} color="var(--accent-lavender)" style={{ flexShrink: 0 }} />
        <p className="caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Every verdict is calculated deterministically with your custom health thresholds.
        </p>
      </GlassCard>
    </div>
  );
};
