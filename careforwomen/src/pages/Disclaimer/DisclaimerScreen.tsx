import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';

export interface DisclaimerScreenProps {
  onAccept: () => void;
}

export const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onAccept }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '32px 20px',
        backgroundColor: '#fbf8f3',
        color: '#342134',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        {/* Header with Shield Icon */}
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
            <ShieldCheck size={30} color="#743d69" />
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
            Welcome to <span style={{ color: '#743d69', fontStyle: 'italic' }}>NutriLens</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#786b78', lineHeight: 1.5, margin: 0 }}>
            Personalized packaged food safety and ingredient clarity.
          </p>
        </div>

        {/* Medical Notice Card */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#743d69' }}>
            <HeartHandshake size={20} />
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: '16px', fontWeight: 700, color: '#342134', margin: 0 }}>
              Medical Notice
            </h3>
          </div>

          <p style={{ color: '#342134', marginBottom: '14px', lineHeight: 1.6, fontSize: '14px' }}>
            <strong>NutriLens provides educational nutritional guidance, not professional medical advice.</strong>
          </p>

          <p style={{ color: '#786b78', marginBottom: '14px', lineHeight: 1.6, fontSize: '13.5px' }}>
            Our deterministic rule engine compares packaging label data with established nutrition benchmarks for conditions like PCOS, pregnancy, breastfeeding, diabetes, and food allergies.
          </p>

          <p style={{ color: '#786b78', lineHeight: 1.5, fontSize: '12px', margin: 0 }}>
            Always consult your physician, OB/GYN, or registered dietitian before making significant dietary modifications or consuming foods with severe allergic sensitivities.
          </p>
        </GlassCard>

        {/* Accept Button */}
        <Button variant="primary" size="lg" fullWidth onClick={onAccept}>
          I Understand & Agree
        </Button>
      </motion.div>
    </div>
  );
};

export default DisclaimerScreen;
