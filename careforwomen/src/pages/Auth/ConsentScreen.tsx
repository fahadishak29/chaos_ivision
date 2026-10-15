import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { useProfile } from '../../context/ProfileContext';

export interface ConsentScreenProps {
  onConsented: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsented }) => {
  const { completeOnboarding } = useProfile();
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!agreed) return;
    setIsSubmitting(true);
    try {
      await completeOnboarding(true);
      onConsented();
    } catch (err) {
      console.warn('Error completing onboarding consent:', err);
      onConsented();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '32px 20px',
        maxWidth: '460px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#fbf8f3',
        color: '#342134',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        {/* Header with Lock Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f8eff5',
              border: '1.5px solid #743d69',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(116, 61, 105, 0.12)',
            }}
          >
            <Lock size={28} color="#743d69" />
          </div>

          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '28px',
              fontWeight: 700,
              color: '#342134',
              letterSpacing: '-0.03em',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            Health Data Consent
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#786b78',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            We take your health data privacy seriously.
          </p>
        </div>

        {/* Consent Details Card */}
        <GlassCard
          padding="lg"
          style={{
            marginBottom: '24px',
            backgroundColor: '#fffdfa',
            border: '1px solid #e8ddd6',
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(52, 33, 52, 0.05)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Statement 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2
                size={20}
                color="#743d69"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <p
                style={{
                  color: '#342134',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Your health condition answers (PCOS, pregnancy status, diabetes type, and allergies) will be saved securely to your personal account with Row Level Security (RLS).
              </p>
            </div>

            {/* Statement 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2
                size={20}
                color="#743d69"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <p
                style={{
                  color: '#342134',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Only you have read or write access to your data. No third-party ad networks or data brokers ever receive your health profile.
              </p>
            </div>

            {/* Statement 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <CheckCircle2
                size={20}
                color="#743d69"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <p
                style={{
                  color: '#342134',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                You can permanently delete your account and all associated scan history at any time with a single tap in Profile settings.
              </p>
            </div>
          </div>

          {/* Interactive Checkbox */}
          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '22px',
              paddingTop: '18px',
              borderTop: '1px solid #e8ddd6',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                accentColor: '#743d69',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <label
              htmlFor="consent-checkbox"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#342134',
                lineHeight: 1.4,
                cursor: 'pointer',
              }}
            >
              I consent to storing my health profile for food safety scanning.
            </label>
          </div>
        </GlassCard>

        {/* Submit Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!agreed}
          isLoading={isSubmitting}
          onClick={handleConfirm}
          icon={<ShieldCheck size={20} />}
        >
          Confirm & Enter App
        </Button>
      </motion.div>
    </div>
  );
};

export default ConsentScreen;
