import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { DisclaimerScreen } from './pages/Disclaimer/DisclaimerScreen';
import { OnboardingFlow } from './pages/Onboarding/OnboardingFlow';
import { SignupScreen } from './pages/Auth/SignupScreen';
import { ConsentScreen } from './pages/Auth/ConsentScreen';
import { HomeScreen } from './pages/Home/HomeScreen';
import { ScanScreen } from './pages/Scan/ScanScreen';
import { LabelReviewScreen } from './pages/LabelReview/LabelReviewScreen';
import { ResultScreen } from './pages/Result/ResultScreen';
import { HistoryScreen } from './pages/History/HistoryScreen';
import { ProfileScreen } from './pages/Profile/ProfileScreen';
import { SettingsScreen } from './pages/Settings/SettingsScreen';
import { NutriSidebar, NutriPage } from './components/layout/NutriSidebar';
import { NutriTopbar } from './components/layout/NutriTopbar';
import { ScanRecord } from './types/scan';
import { Product } from './types/product';
import { runVerdictEngine } from './engine/verdictEngine';
import { explainVerdict } from './services/edgeFunctions';
import { v4 as uuidv4 } from 'uuid';

// NutriLens Branded Splash Screen
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-ivory text-plum px-6 text-center select-none"
    >
      <motion.div
        animate={{ scale: [0.85, 1.05, 1], rotate: [0, -6, 0] }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        className="size-20 rounded-full border-2 border-primary flex items-center justify-center mb-6 shadow-lg bg-[#f8eff5]"
      >
        <div className="size-8 rounded-full border-2 border-primary" />
      </motion.div>

      <motion.h1
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-4xl font-semibold tracking-tight text-plum"
      >
        NutriLens
      </motion.h1>

      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs font-semibold uppercase tracking-[0.2em] text-plum/50 mt-2"
      >
        See beyond the label · Personalized food intelligence
      </motion.p>
    </motion.div>
  );
};

// Main Controller
const MainAppController: React.FC = () => {
  const { user } = useAuth();
  const { profile, disclaimerAccepted, acceptDisclaimer } = useProfile();
  const { addScan } = useHistory();

  // Navigation states
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<NutriPage>('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [onboardingCompletedLocally, setOnboardingCompletedLocally] = useState(false);
  const [isAuthSuccessPendingConsent, setIsAuthSuccessPendingConsent] = useState(false);

  // Active Scan records
  const [currentResultRecord, setCurrentResultRecord] = useState<ScanRecord | null>(null);
  const [extractedOcrData, setExtractedOcrData] = useState<Partial<Product> | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for scan)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentResultRecord(null);
        setCurrentPage('scan');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (page: NutriPage) => {
    setCurrentResultRecord(null);
    setCurrentPage(page);
    setMobileNavOpen(false);
  };

  // 1. Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. First-launch medical disclaimer
  if (!disclaimerAccepted) {
    return <DisclaimerScreen onAccept={acceptDisclaimer} />;
  }

  // 3. User onboarding & auth pipeline
  if (!profile) {
    if (!onboardingCompletedLocally) {
      return (
        <OnboardingFlow
          onComplete={() => setOnboardingCompletedLocally(true)}
        />
      );
    }

    if (!user && !isAuthSuccessPendingConsent) {
      return (
        <SignupScreen
          onSuccess={() => setIsAuthSuccessPendingConsent(true)}
        />
      );
    }

    // Auth succeeded, present mandatory health data consent before saving profile
    return (
      <ConsentScreen
        onConsented={() => {
          setIsAuthSuccessPendingConsent(false);
          setCurrentPage('home');
        }}
      />
    );
  }

  // 4. Label Review Screen (after OCR before verdict)
  if (extractedOcrData) {
    const handleConfirmOcr = async (confirmedProduct: Product) => {
      const verdict = runVerdictEngine(confirmedProduct, profile);

      const conditionSummaries = [
        ...profile.lifeStages.map((s) => s.toUpperCase()),
        profile.diabetesType !== 'none' ? profile.diabetesType.toUpperCase() : null,
        profile.lactoseIntolerant ? 'Lactose Intolerant' : null,
      ].filter(Boolean) as string[];

      const explResult = await explainVerdict(
        confirmedProduct,
        verdict,
        conditionSummaries,
        profile.allergies,
        profile.id
      );

      const record: ScanRecord = {
        id: uuidv4(),
        userId: profile.id,
        source: 'ocr',
        product: confirmedProduct,
        verdict,
        explanation: explResult.explanation,
        rulesVersion: verdict.rulesVersion,
        scannedAt: new Date().toISOString(),
      };

      await addScan(record);
      setExtractedOcrData(null);
      setCurrentResultRecord(record);
    };

    return (
      <LabelReviewScreen
        initialData={extractedOcrData}
        onConfirm={handleConfirmOcr}
        onCancel={() => setExtractedOcrData(null)}
      />
    );
  }

  // 5. Main Shell with Sidebar, Topbar, and Page Views
  return (
    <div className="min-h-screen bg-ivory text-plum selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <NutriSidebar
        currentPage={currentResultRecord ? 'result' : currentPage}
        onNavigate={navigateTo}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Container Shell */}
      <div className="main-shell">
        <NutriTopbar
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenSettings={() => navigateTo('settings')}
          onOpenProfile={() => navigateTo('profile')}
        />

        <main className="page-content">
          <AnimatePresence mode="wait">
            {currentResultRecord ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ResultScreen
                  record={currentResultRecord}
                  onScanAnother={() => {
                    setCurrentResultRecord(null);
                    setCurrentPage('scan');
                  }}
                  onBack={() => setCurrentResultRecord(null)}
                  onHistory={() => {
                    setCurrentResultRecord(null);
                    setCurrentPage('history');
                  }}
                />
              </motion.div>
            ) : currentPage === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HomeScreen
                  onStartScan={() => navigateTo('scan')}
                  onOpenHistory={() => navigateTo('history')}
                  onOpenProfile={() => navigateTo('profile')}
                  onSelectScan={(record) => setCurrentResultRecord(record)}
                />
              </motion.div>
            ) : currentPage === 'scan' ? (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScanScreen
                  onBack={() => navigateTo('home')}
                  onScanComplete={(record) => setCurrentResultRecord(record)}
                  onStartReview={(extracted) => setExtractedOcrData(extracted)}
                />
              </motion.div>
            ) : currentPage === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HistoryScreen
                  onSelectScan={(record) => setCurrentResultRecord(record)}
                  onScanAnother={() => navigateTo('scan')}
                />
              </motion.div>
            ) : currentPage === 'profile' ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileScreen />
              </motion.div>
            ) : currentPage === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SettingsScreen />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Scan button on Mobile */}
      <button
        className="mobile-scan"
        onClick={() => navigateTo('scan')}
        aria-label="Scan product"
        type="button"
      >
        <ScanLine className="size-4" />
        <span>Scan</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <HistoryProvider>
          <MainAppController />
        </HistoryProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
