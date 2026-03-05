"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { saveBodyProfile, generateId, loadState } from "@/lib/storage";
import type { BodyProfile } from "@/lib/types";

function deriveBodyGuidance(bust?: number, waist?: number, hips?: number) {
  const silhouettes: string[] = [];
  const layering: string[] = [];
  const fabrics: string[] = [];
  const patterns: string[] = [];

  if (bust && waist && hips) {
    const bustHipDiff = Math.abs(bust - hips);
    const waistBustRatio = waist / bust;
    const waistHipRatio = waist / hips;

    // Silhouette guidance based on proportions
    if (waistBustRatio < 0.75 && waistHipRatio < 0.75) {
      silhouettes.push("Fitted styles that highlight your defined waist");
      silhouettes.push("Wrap dresses and tops that cinch at the waist");
      silhouettes.push("A-line and fit-and-flare silhouettes");
    } else if (bustHipDiff < 5) {
      silhouettes.push("Balanced silhouettes that create visual curves");
      silhouettes.push("Peplum tops and structured jackets");
      silhouettes.push("Belted styles to define your waist");
    } else if (bust > hips) {
      silhouettes.push("V-necks and open necklines to balance proportions");
      silhouettes.push("A-line skirts and wide-leg trousers");
      silhouettes.push("Darker tones on top, lighter or patterned on the bottom");
    } else {
      silhouettes.push("Boat necks and wide necklines to balance proportions");
      silhouettes.push("Straight-leg and wide-leg trousers");
      silhouettes.push("Structured tops with volume at the shoulder");
    }
  } else {
    // Default positive guidance
    silhouettes.push("Wrap styles that work beautifully on all proportions");
    silhouettes.push("High-waisted pieces that elongate the leg");
    silhouettes.push("Tailored pieces that create clean, confident lines");
  }

  layering.push("Open-front cardigans and blazers add structure without bulk");
  layering.push("Longline layers create a streamlined, elongating effect");
  layering.push("Tucking in tops creates a polished, intentional look");

  fabrics.push("Fluid fabrics like silk and viscose drape beautifully");
  fabrics.push("Medium-weight fabrics hold their shape and flatter most figures");
  fabrics.push("Avoid very stiff fabrics that add bulk");

  patterns.push("Vertical stripes and prints create a lengthening effect");
  patterns.push("Smaller prints are more versatile and easier to mix");
  patterns.push("Solid colours in your palette are always a safe, elegant choice");

  return { silhouettes, layering, fabrics, patterns };
}

export default function BodyProfilePage() {
  const router = useRouter();
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [height, setHeight] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [skipped, setSkipped] = useState(false);

  const handleSave = () => {
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    const guidance = deriveBodyGuidance(
      bust ? parseFloat(bust) : undefined,
      waist ? parseFloat(waist) : undefined,
      hips ? parseFloat(hips) : undefined,
    );

    const profile: BodyProfile = {
      id: generateId(),
      userId,
      bust: bust ? parseFloat(bust) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      height: height ? parseFloat(height) : undefined,
      shoulderWidth: shoulders ? parseFloat(shoulders) : undefined,
      flatteringSilhouettes: guidance.silhouettes,
      layeringGuidance: guidance.layering,
      fabricSuggestions: guidance.fabrics,
      patternSuggestions: guidance.patterns,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBodyProfile(profile);
    router.push("/onboarding/tone");
  };

  const handleSkip = () => {
    setSkipped(true);
    handleSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 flex flex-col">
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-stone-900">Body proportions</h1>
        <p className="text-stone-500 mt-1 text-sm">
          Optional measurements to personalise your styling guidance
        </p>
      </div>

      <div className="flex-1 px-6 pb-40 overflow-y-auto">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6">
          <p className="text-amber-800 text-sm leading-relaxed">
            🔒 Your measurements are stored only on your device and are never shared. We use them purely to give you better styling guidance — not to label or judge your body.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { label: "Height", value: height, setter: setHeight, placeholder: "e.g. 165", hint: "cm" },
            { label: "Bust / Chest", value: bust, setter: setBust, placeholder: "e.g. 90", hint: "cm — measure at the fullest point" },
            { label: "Waist", value: waist, setter: setWaist, placeholder: "e.g. 72", hint: "cm — measure at the narrowest point" },
            { label: "Hips", value: hips, setter: setHips, placeholder: "e.g. 98", hint: "cm — measure at the fullest point" },
            { label: "Shoulder width", value: shoulders, setter: setShoulders, placeholder: "e.g. 38", hint: "cm — shoulder seam to shoulder seam" },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">cm</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">{field.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl p-5 border border-stone-100">
          <h3 className="text-sm font-semibold text-stone-900 mb-2">What we&apos;ll give you</h3>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">✓</span>
              Flattering silhouette suggestions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">✓</span>
              Layering guidance for your proportions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 mt-0.5">✓</span>
              Fabric and pattern recommendations
            </li>
          </ul>
          <p className="text-xs text-stone-400 mt-3">
            We never use body type labels. Our guidance is always positive and practical.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={skipped}>
          Save & continue →
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={handleSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
