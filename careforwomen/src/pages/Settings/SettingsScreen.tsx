import React from 'react';
import { Moon, ShieldCheck, CircleHelp, Sparkles, ChevronRight, Info } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  return (
    <div className="animate-in">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Settings</h1>
          <p>Controls and information for your NutriLens experience.</p>
        </div>
      </div>

      <div className="settings-list">
        <div className="settings-row">
          <div className="settings-icon">
            <Moon />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-plum">Appearance</div>
            <div className="mt-0.5 text-xs text-plum/50">NutriLens is optimized for editorial warm light mode.</div>
          </div>
          <span className="settings-value">Light</span>
        </div>

        <div className="settings-row">
          <div className="settings-icon">
            <ShieldCheck />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-plum">Privacy & Security</div>
            <div className="mt-0.5 text-xs text-plum/50">Profile and scan history are protected by Supabase Row-Level Security.</div>
          </div>
          <span className="status-dot">Protected</span>
        </div>

        <div className="settings-row">
          <div className="settings-icon">
            <CircleHelp />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-plum">Decision Engine Architecture</div>
            <div className="mt-0.5 text-xs text-plum/50">Rules decide deterministically · AI explains in plain language</div>
          </div>
          <ChevronRight className="size-4 text-plum/30 shrink-0" />
        </div>

        <div className="settings-row">
          <div className="settings-icon">
            <Info />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-plum">Data Providers</div>
            <div className="mt-0.5 text-xs text-plum/50">Open Food Facts API database & OCR label extraction</div>
          </div>
          <span className="settings-value">v1.0.0</span>
        </div>
      </div>

      <div className="settings-note">
        <Sparkles className="size-4 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold">Built for clearer, personal choices</div>
          <p className="mt-1 text-xs leading-relaxed opacity-85">
            NutriLens is an educational food intelligence tool. Always consult with a licensed dietitian or physician for individual medical, dietary, or clinical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
