"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { saveUserProfile, generateId, loadState } from "@/lib/storage";
import type { UserProfile, UserSettings } from "@/lib/types";

const TOTAL_STEPS = 10;

const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65+"];
const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"];
const EYE_COLOURS = ["Brown", "Dark brown", "Hazel", "Green", "Blue", "Grey", "Amber"];
const HAIR_COLOURS = ["Black", "Dark brown", "Medium brown", "Light brown", "Blonde", "Red / Auburn", "Grey / Silver", "White", "Dyed / Coloured"];
const TANNING_OPTIONS = [
  { value: "burns_easily", label: "Burns easily, rarely tans" },
  { value: "burns_then_tans", label: "Burns first, then tans" },
  { value: "tans_easily", label: "Tans easily, rarely burns" },
  { value: "always_tans", label: "Always tans, never burns" },
  { value: "naturally_dark", label: "Naturally deep skin tone" },
];
const BODY_FEATURES = [
  "My shoulders", "My waist", "My hips", "My legs", "My arms",
  "My bust", "My back", "My neck", "My height", "My curves",
];
const COLOUR_OPTIONS = [
  "Warm earthy tones", "Cool blues & greens", "Neutrals & beiges",
  "Bold brights", "Pastels", "Monochrome", "Rich jewel tones", "Muted & dusty tones",
];
const STYLE_FAMILIARITY = [
  { value: "beginner", label: "Just starting out", desc: "I'm not sure what suits me yet" },
  { value: "developing", label: "Developing my style", desc: "I have some ideas but want guidance" },
  { value: "confident", label: "Fairly confident", desc: "I know what I like but want to refine it" },
  { value: "expert", label: "Style-savvy", desc: "I love fashion and want to optimise" },
];
const PREFERRED_STYLES = [
  "Classic & timeless", "Minimalist", "Bohemian", "Romantic",
  "Edgy & modern", "Preppy", "Casual & relaxed", "Glamorous",
  "Sporty", "Eclectic & creative",
];
const LIFESTYLE_HABITS = [
  "Office / corporate work", "Creative or casual workplace", "Working from home",
  "Active lifestyle / sport", "Frequent travel", "Social events & dining",
  "Parenting / family life", "Outdoor activities",
];
const BUDGET_RANGES = [
  { value: "budget", label: "Budget-conscious", desc: "Under £30 per item" },
  { value: "mid", label: "Mid-range", desc: "£30–£100 per item" },
  { value: "premium", label: "Premium", desc: "£100–£300 per item" },
  { value: "luxury", label: "Luxury", desc: "£300+ per item" },
];

function MultiSelect({
  options,
  selected,
  onChange,
  max,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
            selected.includes(opt)
              ? "bg-rose-500 border-rose-500 text-white"
              : "bg-white border-stone-200 text-stone-700 hover:border-rose-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SingleSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
            selected === opt
              ? "bg-rose-500 border-rose-500 text-white"
              : "bg-white border-stone-200 text-stone-700 hover:border-rose-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [genderIdentity, setGenderIdentity] = useState("");
  const [eyeColour, setEyeColour] = useState("");
  const [hairColour, setHairColour] = useState("");
  const [tanningBehaviour, setTanningBehaviour] = useState("");
  const [lovedFeatures, setLovedFeatures] = useState<string[]>([]);
  const [downplayFeatures, setDownplayFeatures] = useState<string[]>([]);
  const [colourPreferences, setColourPreferences] = useState<string[]>([]);
  const [colourDislikes, setColourDislikes] = useState<string[]>([]);
  const [styleFamiliarity, setStyleFamiliarity] = useState("");
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [lifestyleHabits, setLifestyleHabits] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState("");
  const [settings, setSettings] = useState<UserSettings>({
    weatherAware: true,
    nightBeforeReminders: false,
    moodTracking: true,
    outfeedbackPrompts: true,
    locationBased: false,
    generateAvatar: false,
  });

  // Save progress on each step change
  useEffect(() => {
    if (step > 1) {
      const partial: Partial<UserProfile> = {
        name, email, ageRange, genderIdentity, eyeColour, hairColour,
        tanningBehaviour, lovedFeatures, downplayFeatures, colourPreferences,
        colourDislikes, styleFamiliarity, preferredStyles, lifestyleHabits,
        budgetRange, settings, onboardingCompleted: false,
      };
      // Save partial progress
      const state = loadState();
      if (state.userProfile) {
        saveUserProfile({ ...state.userProfile, ...partial });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const canProceed = () => {
    switch (step) {
      case 1: return true; // name/email optional
      case 2: return !!ageRange && !!genderIdentity;
      case 3: return !!eyeColour && !!hairColour && !!tanningBehaviour;
      case 4: return lovedFeatures.length > 0;
      case 5: return colourPreferences.length > 0;
      case 6: return !!styleFamiliarity;
      case 7: return preferredStyles.length > 0;
      case 8: return lifestyleHabits.length > 0;
      case 9: return !!budgetRange;
      case 10: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      id: generateId(),
      name: name || undefined,
      email: email || undefined,
      ageRange,
      genderIdentity,
      eyeColour,
      hairColour,
      tanningBehaviour,
      lovedFeatures,
      downplayFeatures,
      colourPreferences,
      colourDislikes,
      styleFamiliarity,
      preferredStyles,
      lifestyleHabits,
      budgetRange,
      settings,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveUserProfile(profile);
    router.push("/onboarding/body");
  };

  const stepTitles = [
    "Welcome to StylistA",
    "Tell us about you",
    "Your natural tones",
    "Your body",
    "Your colour world",
    "Your style journey",
    "Your style inspiration",
    "Your lifestyle",
    "Your budget",
    "Your preferences",
  ];

  const stepSubtitles = [
    "Your personal styling companion",
    "Help us personalise your experience",
    "We'll use this to find your most flattering palette",
    "Celebrate what you love about yourself",
    "Let's discover your colour story",
    "Where are you on your style journey?",
    "What styles speak to you?",
    "How do you spend your time?",
    "What's your investment comfort zone?",
    "Fine-tune your experience",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <ProgressBar current={step} total={TOTAL_STEPS} />
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-stone-900">{stepTitles[step - 1]}</h1>
          <p className="text-stone-500 mt-1 text-sm">{stepSubtitles[step - 1]}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto">
        {/* Step 1: Welcome + Name/Email */}
        {step === 1 && (
          <div className="space-y-6 mt-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <div className="text-4xl mb-3">✨</div>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">
                Your personal stylist, always with you
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                StylistA helps you understand your unique style, organise your wardrobe, and get dressed with confidence every day. No judgement — just support.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Your name <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Age + Gender */}
        {step === 2 && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Age range</h3>
              <SingleSelect options={AGE_RANGES} selected={ageRange} onChange={setAgeRange} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Gender identity</h3>
              <SingleSelect options={GENDER_OPTIONS} selected={genderIdentity} onChange={setGenderIdentity} />
            </div>
          </div>
        )}

        {/* Step 3: Eye colour, hair colour, tanning */}
        {step === 3 && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Eye colour</h3>
              <SingleSelect options={EYE_COLOURS} selected={eyeColour} onChange={setEyeColour} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Hair colour</h3>
              <SingleSelect options={HAIR_COLOURS} selected={hairColour} onChange={setHairColour} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-3">How does your skin respond to sun?</h3>
              <div className="space-y-2">
                {TANNING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTanningBehaviour(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-150 ${
                      tanningBehaviour === opt.value
                        ? "bg-rose-50 border-rose-400 text-rose-800"
                        : "bg-white border-stone-200 text-stone-700 hover:border-rose-200"
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Body features */}
        {step === 4 && (
          <div className="space-y-6 mt-4">
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <p className="text-rose-800 text-sm">
                💛 This is a celebration, not a critique. We use this to help you dress in ways that make you feel amazing.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-1">What do you love about your body?</h3>
              <p className="text-xs text-stone-500 mb-3">Select all that apply</p>
              <MultiSelect options={BODY_FEATURES} selected={lovedFeatures} onChange={setLovedFeatures} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-1">Anything you prefer to downplay?</h3>
              <p className="text-xs text-stone-500 mb-3">Optional — select any you&apos;d like guidance on</p>
              <MultiSelect options={BODY_FEATURES} selected={downplayFeatures} onChange={setDownplayFeatures} />
            </div>
          </div>
        )}

        {/* Step 5: Colour preferences */}
        {step === 5 && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-1">Colours you love wearing</h3>
              <p className="text-xs text-stone-500 mb-3">Select up to 4</p>
              <MultiSelect options={COLOUR_OPTIONS} selected={colourPreferences} onChange={setColourPreferences} max={4} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-1">Colours you avoid</h3>
              <p className="text-xs text-stone-500 mb-3">Optional</p>
              <MultiSelect options={COLOUR_OPTIONS} selected={colourDislikes} onChange={setColourDislikes} />
            </div>
          </div>
        )}

        {/* Step 6: Style familiarity */}
        {step === 6 && (
          <div className="space-y-3 mt-4">
            {STYLE_FAMILIARITY.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStyleFamiliarity(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150 ${
                  styleFamiliarity === opt.value
                    ? "bg-rose-50 border-rose-400"
                    : "bg-white border-stone-200 hover:border-rose-200"
                }`}
              >
                <div className="font-semibold text-stone-900 text-sm">{opt.label}</div>
                <div className="text-stone-500 text-xs mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 7: Preferred styles */}
        {step === 7 && (
          <div className="mt-4">
            <p className="text-xs text-stone-500 mb-3">Select all that resonate with you</p>
            <MultiSelect options={PREFERRED_STYLES} selected={preferredStyles} onChange={setPreferredStyles} />
          </div>
        )}

        {/* Step 8: Lifestyle */}
        {step === 8 && (
          <div className="mt-4">
            <p className="text-xs text-stone-500 mb-3">Select all that apply to your life</p>
            <MultiSelect options={LIFESTYLE_HABITS} selected={lifestyleHabits} onChange={setLifestyleHabits} />
          </div>
        )}

        {/* Step 9: Budget */}
        {step === 9 && (
          <div className="space-y-3 mt-4">
            {BUDGET_RANGES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBudgetRange(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150 ${
                  budgetRange === opt.value
                    ? "bg-rose-50 border-rose-400"
                    : "bg-white border-stone-200 hover:border-rose-200"
                }`}
              >
                <div className="font-semibold text-stone-900 text-sm">{opt.label}</div>
                <div className="text-stone-500 text-xs mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 10: Settings */}
        {step === 10 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-stone-600">Customise your StylistA experience. You can change these anytime.</p>
            {[
              { key: "weatherAware" as keyof UserSettings, label: "Weather-aware outfit planning", desc: "Suggestions based on today's weather" },
              { key: "nightBeforeReminders" as keyof UserSettings, label: "Night-before outfit reminders", desc: "Plan tomorrow's look the evening before" },
              { key: "moodTracking" as keyof UserSettings, label: "Mood tracking", desc: "Factor your mood into outfit suggestions" },
              { key: "outfeedbackPrompts" as keyof UserSettings, label: "Outfit feedback prompts", desc: "Help us learn your preferences over time" },
            ].map((setting) => (
              <div
                key={setting.key}
                className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 border border-stone-100"
              >
                <div>
                  <div className="text-sm font-medium text-stone-900">{setting.label}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{setting.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, [setting.key]: !s[setting.key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[setting.key] ? "bg-rose-500" : "bg-stone-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      settings[setting.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === TOTAL_STEPS ? "Continue to body profile →" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
