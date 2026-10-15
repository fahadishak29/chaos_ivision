import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { useAuth } from '../../context/AuthContext';

export interface SignupScreenProps {
  onSuccess: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSuccess }) => {
  const { signUp, signIn, signInGuest } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLoginMode) {
        const { user, error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Failed to log in.');
        } else if (user) {
          onSuccess();
        }
      } else {
        const { user, error } = await signUp(email, password, name || 'Health Explorer');
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.');
        } else if (user) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const { user, error } = await signInGuest();
      if (error) {
        setErrorMsg(error.message || 'Failed to start guest session.');
      } else if (user) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
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
        maxWidth: '440px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#fbf8f3',
        color: '#342134',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '28px',
              fontWeight: 700,
              color: '#342134',
              letterSpacing: '-0.03em',
              marginBottom: '6px',
            }}
          >
            {isLoginMode ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '14px', color: '#786b78', margin: 0, lineHeight: 1.5 }}>
            {isLoginMode
              ? 'Sign in to access your saved health profile and history'
              : 'Save your profile safely to start instant scanning'}
          </p>
        </div>

        <GlassCard
          padding="lg"
          style={{
            marginBottom: '20px',
            backgroundColor: '#fffdfa',
            border: '1px solid #e8ddd6',
            borderRadius: '14px',
            boxShadow: '0 4px 18px rgba(52, 33, 52, 0.05)',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLoginMode && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#342134', display: 'block', marginBottom: '6px' }}>
                  Your Name (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alisha"
                    className="glass-input"
                    style={{ paddingLeft: '40px' }}
                  />
                  <User
                    size={18}
                    color="#968694"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#342134', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Mail
                  size={18}
                  color="#968694"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#342134', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Lock
                  size={18}
                  color="#968694"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fbe5e5',
                  border: '1px solid #e5b7b9',
                  color: '#b04451',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button variant="primary" size="md" fullWidth type="submit" isLoading={isSubmitting} style={{ marginTop: '8px' }}>
              {isLoginMode ? 'Log In' : 'Sign Up & Continue'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setIsLoginMode(!isLoginMode);
              }}
              style={{
                color: '#743d69',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'underline',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>
        </GlassCard>

        {/* Guest Alternative */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '16px 0',
              color: '#786b78',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#e8ddd6' }} />
            <span>OR TRY WITHOUT ACCOUNT</span>
            <div style={{ flex: 1, height: '1px', background: '#e8ddd6' }} />
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleGuest}
            isLoading={isSubmitting}
            icon={<UserCheck size={18} color="#743d69" />}
          >
            Continue as Guest (Anonymous)
          </Button>

          <p style={{ fontSize: '12px', color: '#786b78', marginTop: '10px', lineHeight: 1.4 }}>
            You can link an email anytime later without losing your health settings.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupScreen;
