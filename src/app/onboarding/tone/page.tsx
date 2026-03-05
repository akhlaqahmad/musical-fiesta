"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { saveToneProfile, generateId, loadState } from "@/lib/storage";
import { WARM_PALETTE, COOL_PALETTE, NEUTRAL_PALETTE } from "@/lib/mockData";
import type { ToneProfile } from "@/lib/types";

function deriveTone(
  eyeColour: string,
  hairColour: string,
  tanningBehaviour: string,
  colourPreferences: string[],
): "warm" | "cool" | "neutral" {
  let warmScore = 0;
  let coolScore = 0;

  // Eye colour scoring
  if (["Brown", "Dark brown", "Hazel", "Amber"].includes(eyeColour)) warmScore += 2;
  if (["Blue", "Grey"].includes(eyeColour)) coolScore += 2;
  if (eyeColour === "Green") warmScore += 1;

  // Hair colour scoring
  if (["Black", "Dark brown", "Red / Auburn"].includes(hairColour)) warmScore += 2;
  if (["Blonde", "Grey / Silver", "White"].includes(hairColour)) coolScore += 2;
  if (["Medium brown", "Light brown"].includes(hairColour)) warmScore += 1;

  // Tanning behaviour
  if (["tans_easily", "always_tans", "naturally_dark"].includes(tanningBehaviour)) warmScore += 2;
  if (["burns_easily"].includes(tanningBehaviour)) coolScore += 2;
  if (["burns_then_tans"].includes(tanningBehaviour)) coolScore += 1;

  // Colour preferences
  if (colourPreferences.some((c) => c.includes("earthy") || c.includes("warm"))) warmScore += 1;
  if (colourPreferences.some((c) => c.includes("cool") || c.includes("blue"))) coolScore += 1;

  if (Math.abs(warmScore - coolScore) <= 1) return "neutral";
  return warmScore > coolScore ? "warm" : "cool";
}

function getToneGuidance(tone: "warm" | "cool" | "neutral"): string {
  switch (tone) {
    case "warm":
      return "Your natural colouring has warm undertones — think golden, peachy, and earthy hues. Colours like camel, terracotta, olive, warm white, and rich browns will make your complexion glow. Gold jewellery tends to complement you beautifully.";
    case "cool":
      return "Your natural colouring has cool undertones — think rosy, blue-based, and crisp hues. Colours like navy, cool grey, icy pink, burgundy, and pure white will make your complexion radiate. Silver jewellery tends to complement you beautifully.";
    case "neutral":
      return "Your natural colouring is beautifully balanced with neutral undertones — you have the wonderful flexibility to wear both warm and cool tones. Soft whites, dusty rose, sage green, and warm grey all work harmoniously with your complexion.";
  }
}

const TONE_LABELS = {
  warm: { title: "Warm tones", emoji: "🌅", bg: "from-amber-50 to-orange-50", accent: "text-amber-700", border: "border-amber-200" },
  cool: { title: "Cool tones", emoji: "🌊", bg: "from-blue-50 to-indigo-50", accent: "text-blue-700", border: "border-blue-200" },
  neutral: { title: "Neutral tones", emoji: "🌿", bg: "from-stone-50 to-sage-50", accent: "text-stone-700", border: "border-stone-200" },
};

export default function ToneAnalysisPage() {
  const router = useRouter();
  const [tone, setTone] = useState<"warm" | "cool" | "neutral" | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const state = loadState();
    const profile = state.userProfile;
    if (profile) {
      const derived = deriveTone(
        profile.eyeColour,
        profile.hairColour,
        profile.tanningBehaviour,
        profile.colourPreferences,
      );
      setTone(derived);
      setPalette(
        derived === "warm" ? WARM_PALETTE :
        derived === "cool" ? COOL_PALETTE :
        NEUTRAL_PALETTE
      );
    } else {
      setTone("neutral");
      setPalette(NEUTRAL_PALETTE);
    }
    // Reveal after a short delay for effect
    setTimeout(() => setRevealed(true), 600);
  }, []);

  const handleSave = () => {
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    if (!tone) return;

    const profile: ToneProfile = {
      id: generateId(),
      userId,
      toneCategory: tone,
      colourPalette: palette,
      guidance: getToneGuidance(tone),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveToneProfile(profile);
    router.push("/onboarding/wardrobe");
  };

  const toneInfo = tone ? TONE_LABELS[tone] : null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${toneInfo?.bg || "from-stone-50 to-stone-100"} flex flex-col`}>
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
        <h1 className="text-2xl font-bold text-stone-900">Your colour analysis</h1>
        <p className="text-stone-500 mt-1 text-sm">Based on your natural colouring</p>
      </div>

      <div className="flex-1 px-6 pb-40 overflow-y-auto">
        {/* Tone reveal card */}
        <div
          className={`transition-all duration-700 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className={`bg-white rounded-3xl p-6 shadow-sm border ${toneInfo?.border || "border-stone-100"} mb-6`}>
            <div className="text-4xl mb-3">{toneInfo?.emoji}</div>
            <h2 className={`text-xl font-bold mb-2 ${toneInfo?.accent}`}>
              {toneInfo?.title}
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              {tone ? getToneGuidance(tone) : ""}
            </p>
          </div>

          {/* Colour palette */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 mb-6">
            <h3 className="text-sm font-semibold text-stone-900 mb-4">Your colour palette</h3>
            <div className="grid grid-cols-6 gap-2">
              {palette.map((colour, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl shadow-sm border border-white/50"
                  style={{ backgroundColor: colour }}
                  title={colour}
                />
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-3">
              These colours are most harmonious with your natural colouring. They&apos;re a guide, not a rule — wear what makes you feel great.
            </p>
          </div>

          {/* Tone selector — allow override */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">
              Does this feel right?
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Our analysis is a starting point. You know yourself best — adjust if needed.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["warm", "cool", "neutral"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTone(t);
                    setPalette(t === "warm" ? WARM_PALETTE : t === "cool" ? COOL_PALETTE : NEUTRAL_PALETTE);
                  }}
                  className={`py-3 rounded-2xl text-sm font-medium border transition-all ${
                    tone === t
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:border-rose-300"
                  }`}
                >
                  {TONE_LABELS[t].emoji} {TONE_LABELS[t].title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save my palette & continue →
        </Button>
      </div>
    </div>
  );
}
