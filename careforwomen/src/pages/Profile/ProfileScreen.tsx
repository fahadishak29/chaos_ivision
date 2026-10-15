import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Plus,
  X,
  LogOut,
  Trash2,
  KeyRound,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { NutriButton } from '../../components/ui/NutriButton';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { LifeStage, DiabetesType, Allergen, COMMON_ALLERGENS } from '../../types/profile';

export const ProfileScreen: React.FC = () => {
  const { profile, updateProfile, deleteAccount } = useProfile();
  const { user, isAnonymous, upgradeAccount, signOut } = useAuth();

  // Local state for health attributes
  const [displayName, setDisplayName] = useState<string>(profile?.displayName || '');
  const [lifeStages, setLifeStages] = useState<LifeStage[]>(profile?.lifeStages || []);
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(profile?.diabetesType || 'none');
  const [lactoseIntolerant, setLactoseIntolerant] = useState<boolean>(profile?.lactoseIntolerant || false);
  const [allergies, setAllergies] = useState<Allergen[]>(profile?.allergies || []);
  const [customAllergies, setCustomAllergies] = useState<string[]>(profile?.customAllergies || []);
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'vegetarian' | 'vegan' | 'pescatarian'>(profile?.dietaryPreference || 'all');
  const [budgetPreference, setBudgetPreference] = useState<'all' | 'budget' | 'moderate'>(profile?.budgetPreference || 'all');
  const [customInput, setCustomInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Upgrade modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleLifeStage = (stage: LifeStage) => {
    if (lifeStages.includes(stage)) {
      setLifeStages(lifeStages.filter((s) => s !== stage));
    } else {
      setLifeStages([...lifeStages, stage]);
    }
  };

  const toggleAllergen = (id: Allergen) => {
    if (allergies.includes(id)) {
      setAllergies(allergies.filter((a) => a !== id));
    } else {
      setAllergies([...allergies, id]);
    }
  };

  const addCustomAllergy = () => {
    const val = customInput.trim();
    if (!val) return;
    if (!customAllergies.includes(val)) {
      setCustomAllergies([...customAllergies, val]);
    }
    setCustomInput('');
  };

  const removeCustomAllergy = (name: string) => {
    setCustomAllergies(customAllergies.filter((c) => c !== name));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    const success = await updateProfile({
      displayName: displayName.trim() || null,
      lifeStages,
      diabetesType,
      lactoseIntolerant,
      allergies,
      customAllergies,
      dietaryPreference,
      budgetPreference,
    });

    setIsSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleUpgradeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);
    const { error } = await upgradeAccount(upgradeEmail, upgradePassword);
    if (error) {
      setUpgradeError(error.message || 'Failed to link account.');
    } else {
      setUpgradeModalOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setDeleteModalOpen(false);
  };

  return (
    <div className="animate-in">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">Personal context</div>
          <h1>My profile</h1>
          <p>Choose what NutriLens should look for. These are preferences and safety signals, not medical diagnoses.</p>
        </div>
        <NutriButton onClick={handleSave} disabled={isSaving} className="save-button shrink-0">
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" />
              <span>Saving…</span>
            </span>
          ) : saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-white" />
              <span>Saved</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>Save changes</span>
            </span>
          )}
        </NutriButton>
      </div>

      {/* Privacy Notice Card */}
      <div className="privacy-callout">
        <ShieldCheck className="size-5 shrink-0" />
        <div>
          <div className="text-sm font-semibold">Your profile is private by design</div>
          <p className="mt-1 text-xs text-plum/60 leading-relaxed">
            Selections persist securely under your personal account and in local storage. They are never sold or shared.
          </p>
        </div>
      </div>

      {/* Profile Name Row */}
      <div className="profile-section">
        <div className="section-kicker">Display Name</div>
        <p className="section-subtitle mb-3">How NutriLens greets you across the app.</p>
        <div className="max-w-md">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or nickname"
            className="w-full px-3 py-2 border border-[#eadfd9] rounded-lg bg-white text-plum text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Health Context Section */}
      <div className="profile-section">
        <div className="section-kicker">Health context & life stages</div>
        <p className="section-subtitle mb-4">
          Nutritional limits adjust automatically for specific conditions (such as added sugars, glycemic index, or delicate micronutrients).
        </p>

        <div className="choice-grid">
          {/* PCOS / PCOD */}
          <button
            type="button"
            onClick={() => toggleLifeStage('pcos')}
            className={`choice-card ${lifeStages.includes('pcos') ? 'choice-selected' : ''}`}
          >
            <div className="choice-check">
              {lifeStages.includes('pcos') && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">PCOS / PCOD</div>
              <div className="mt-1 text-[11px] leading-relaxed text-plum/50">
                Helps prioritize lower added sugars and blood sugar stabilization.
              </div>
            </div>
          </button>

          {/* Pregnancy */}
          <button
            type="button"
            onClick={() => toggleLifeStage('pregnancy')}
            className={`choice-card ${lifeStages.includes('pregnancy') ? 'choice-selected' : ''}`}
          >
            <div className="choice-check">
              {lifeStages.includes('pregnancy') && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">Pregnancy</div>
              <div className="mt-1 text-[11px] leading-relaxed text-plum/50">
                Highlights raw, unpasteurized, high-caffeine, or elevated mercury ingredients.
              </div>
            </div>
          </button>

          {/* Breastfeeding */}
          <button
            type="button"
            onClick={() => toggleLifeStage('breastfeeding')}
            className={`choice-card ${lifeStages.includes('breastfeeding') ? 'choice-selected' : ''}`}
          >
            <div className="choice-check">
              {lifeStages.includes('breastfeeding') && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">Breastfeeding</div>
              <div className="mt-1 text-[11px] leading-relaxed text-plum/50">
                Keeps stimulants and lactation alerts easy to review.
              </div>
            </div>
          </button>

          {/* Diabetes: Type 1 */}
          <button
            type="button"
            onClick={() => setDiabetesType(diabetesType === 'type1' ? 'none' : 'type1')}
            className={`choice-card ${diabetesType === 'type1' ? 'choice-selected' : ''}`}
          >
            <div className="choice-check">
              {diabetesType === 'type1' && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">Type 1 Diabetes</div>
              <div className="mt-1 text-[11px] leading-relaxed text-plum/50">
                Displays total carbohydrate metrics clearly for insulin management.
              </div>
            </div>
          </button>

          {/* Diabetes: Type 2 */}
          <button
            type="button"
            onClick={() => setDiabetesType(diabetesType === 'type2' ? 'none' : 'type2')}
            className={`choice-card ${diabetesType === 'type2' ? 'choice-selected' : ''}`}
          >
            <div className="choice-check">
              {diabetesType === 'type2' && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">Type 2 Diabetes</div>
              <div className="mt-1 text-[11px] leading-relaxed text-plum/50">
                Flags high glycemic carbs and added sugar spikes.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Allergies & Sensitivities Section */}
      <div className="profile-section">
        <div className="section-kicker">Allergies & sensitivities</div>
        <p className="section-subtitle mb-4">
          Allergens trigger immediate <span className="font-semibold text-danger">AVOID</span> safety verdicts that take precedence over standard nutritional scoring.
        </p>

        <div className="choice-grid choice-grid-small">
          {/* Lactose intolerance */}
          <button
            type="button"
            onClick={() => setLactoseIntolerant(!lactoseIntolerant)}
            className={`choice-card ${lactoseIntolerant ? 'choice-selected choice-danger' : ''}`}
          >
            <div className="choice-check">
              {lactoseIntolerant && <Check />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-plum">🥛 Lactose Sensitivity</div>
              <div className="mt-1 text-[11px] text-plum/50">
                {lactoseIntolerant ? 'Graduated dairy safety active' : 'Not selected'}
              </div>
            </div>
          </button>

          {COMMON_ALLERGENS.map(({ id, label, icon }) => {
            const isChecked = allergies.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAllergen(id)}
                className={`choice-card ${isChecked ? 'choice-selected choice-danger' : ''}`}
              >
                <div className="choice-check">
                  {isChecked && <Check />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-plum">{icon} {label}</div>
                  <div className="mt-1 text-[11px] text-plum/50">
                    {isChecked ? 'Triggers avoid result' : 'Not selected'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Allergens Section */}
        <div className="mt-6 pt-4 border-t border-[#eadfd9]">
          <div className="text-xs font-bold text-plum/70 mb-2">Custom ingredient triggers</div>
          <p className="text-[11px] text-plum/50 mb-3">Add any additional ingredients you must avoid (e.g. "red dye 40", "gelatin", "monosodium glutamate").</p>

          <div className="flex gap-2 max-w-md mb-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomAllergy();
                }
              }}
              placeholder="e.g. artificial sweeteners"
              className="flex-1 px-3 py-1.5 border border-[#eadfd9] rounded-lg bg-white text-plum text-xs focus:outline-none focus:border-primary"
            />
            <NutriButton variant="outline" size="sm" onClick={addCustomAllergy} type="button">
              <Plus className="size-3.5" />
              <span>Add</span>
            </NutriButton>
          </div>

          <div className="flex flex-wrap gap-2">
            {customAllergies.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger/10 text-danger border border-danger/20"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeCustomAllergy(item)}
                  className="hover:opacity-75"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dietary & Budget Preferences for Smart Alternatives */}
      <div className="profile-section">
        <div className="section-kicker">Dietary & Budget Preferences</div>
        <p className="section-subtitle mb-4">
          Personalize Smart Food Alternatives recommendations to match your dietary lifestyle and target grocery budget.
        </p>

        <div className="text-xs font-bold text-plum/70 mb-2">Dietary Lifestyle</div>
        <div className="choice-grid choice-grid-small mb-6">
          {[
            { id: 'all', label: 'Omnivore / All Foods', desc: 'No dietary restrictions on alternatives' },
            { id: 'vegetarian', label: '🌱 Vegetarian', desc: 'Plant-based with dairy & eggs' },
            { id: 'vegan', label: '🌿 100% Vegan', desc: 'Strictly plant-based ingredients only' },
            { id: 'pescatarian', label: '🐟 Pescatarian', desc: 'Plant-based plus seafood' },
          ].map((d) => {
            const isSelected = dietaryPreference === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDietaryPreference(d.id as any)}
                className={`choice-card ${isSelected ? 'choice-selected' : ''}`}
              >
                <div className="choice-check">
                  {isSelected && <Check />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-plum">{d.label}</div>
                  <div className="mt-1 text-[11px] text-plum/50">{d.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-bold text-plum/70 mb-2">Target Grocery Budget</div>
        <div className="choice-grid choice-grid-small">
          {[
            { id: 'all', label: 'Any Budget', desc: 'Show all matching alternatives' },
            { id: 'budget', label: '💵 Budget Friendly ($)', desc: 'Prioritize low-cost alternatives' },
            { id: 'moderate', label: '💳 Moderate ($$)', desc: 'Balanced price to quality ratio' },
          ].map((b) => {
            const isSelected = budgetPreference === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBudgetPreference(b.id as any)}
                className={`choice-card ${isSelected ? 'choice-selected' : ''}`}
              >
                <div className="choice-check">
                  {isSelected && <Check />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-plum">{b.label}</div>
                  <div className="mt-1 text-[11px] text-plum/50">{b.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button (Bottom Action) */}
      <div className="mb-8">
        <NutriButton
          onClick={handleSave}
          disabled={isSaving}
          className="scan-button w-full justify-center"
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-4 animate-spin" />
              <span>Saving changes…</span>
            </span>
          ) : saved ? (
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-white" />
              <span>Changes Saved!</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>Save Profile Changes</span>
            </span>
          )}
        </NutriButton>
      </div>

      {/* Account & Session Section */}
      <div className="profile-section">
        <div className="section-kicker">Account & Data Management</div>
        <p className="section-subtitle mb-4">Manage your cloud authentication and saved profile records.</p>

        <div className="flex flex-wrap items-center gap-4">
          {isAnonymous ? (
            <NutriButton
              variant="outline"
              size="sm"
              onClick={() => setUpgradeModalOpen(true)}
              className="border-primary/40 text-primary"
            >
              <KeyRound className="size-3.5" />
              <span>Link Email to Guest Account</span>
            </NutriButton>
          ) : (
            <div className="text-xs text-plum/60">
              Signed in as <strong className="text-plum">{user?.email}</strong>
            </div>
          )}

          <NutriButton
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-plum/70 hover:text-plum"
          >
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </NutriButton>

          <NutriButton
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            className="ml-auto"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Account & Data</span>
          </NutriButton>
        </div>
      </div>

      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-[#eadfd9]">
            <h3 className="font-serif text-xl font-semibold text-plum">Link your account</h3>
            <p className="text-xs text-plum/60 mt-1 mb-4">
              Add your email to access your health profile and scan history on other devices.
            </p>

            {upgradeError && (
              <div className="mb-3 p-2 text-xs bg-danger/10 text-danger rounded-md">
                {upgradeError}
              </div>
            )}

            <form onSubmit={handleUpgradeAccount} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-plum/60 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={upgradeEmail}
                  onChange={(e) => setUpgradeEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#eadfd9] rounded-lg text-sm text-plum focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-plum/60 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={upgradePassword}
                  onChange={(e) => setUpgradePassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#eadfd9] rounded-lg text-sm text-plum focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <NutriButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setUpgradeModalOpen(false)}
                >
                  Cancel
                </NutriButton>
                <NutriButton variant="default" size="sm" type="submit" className="scan-button">
                  Link Account
                </NutriButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-danger/30">
            <div className="flex items-center gap-2 text-danger mb-2">
              <AlertTriangle className="size-5 shrink-0" />
              <h3 className="font-serif text-lg font-semibold">Delete Account & Data?</h3>
            </div>
            <p className="text-xs text-plum/60 mb-5 leading-relaxed">
              This will permanently delete your personalized health profile, custom sensitivities, and all saved scan history from both this device and Supabase.
            </p>

            <div className="flex justify-end gap-2">
              <NutriButton
                variant="ghost"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Keep my data
              </NutriButton>
              <NutriButton
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete Everything'}
              </NutriButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
