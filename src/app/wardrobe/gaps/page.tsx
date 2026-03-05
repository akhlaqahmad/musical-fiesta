"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState } from "@/lib/storage";
import type { StyleGap } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
};

export default function StyleGapsPage() {
  const router = useRouter();
  const [gaps, setGaps] = useState<StyleGap[]>([]);

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setGaps(state.styleGaps);
  }, [router]);

  const highPriority = gaps.filter((g) => g.priority === "high");
  const mediumPriority = gaps.filter((g) => g.priority === "medium");
  const lowPriority = gaps.filter((g) => g.priority === "low");

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-stone-900">Style gaps</h1>
        <p className="text-stone-500 mt-1 text-sm">Pieces that could unlock more outfit combinations</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {gaps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-stone-600 font-medium">Your wardrobe looks complete!</p>
            <p className="text-stone-400 text-sm mt-1">Add more items to get gap analysis</p>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-amber-800 text-sm leading-relaxed">
                🔍 We&apos;ve analysed your wardrobe and lifestyle to identify pieces that would give you the most outfit flexibility.
              </p>
            </div>

            {highPriority.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  High priority
                </h2>
                <div className="space-y-3">
                  {highPriority.map((gap) => (
                    <GapCard key={gap.id} gap={gap} />
                  ))}
                </div>
              </div>
            )}

            {mediumPriority.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Medium priority
                </h2>
                <div className="space-y-3">
                  {mediumPriority.map((gap) => (
                    <GapCard key={gap.id} gap={gap} />
                  ))}
                </div>
              </div>
            )}

            {lowPriority.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" />
                  Nice to have
                </h2>
                <div className="space-y-3">
                  {lowPriority.map((gap) => (
                    <GapCard key={gap.id} gap={gap} />
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/wardrobe/suggestions"
              className="block bg-rose-500 rounded-3xl p-5 text-white text-center"
            >
              <div className="font-semibold">See suggested pieces →</div>
              <div className="text-rose-200 text-sm mt-1">Curated picks to fill these gaps</div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function GapCard({ gap }: { gap: StyleGap }) {
  const CATEGORY_ICONS: Record<string, string> = {
    tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
    shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[gap.category] || "👗"}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-stone-900 text-sm">{gap.description}</h3>
          <p className="text-stone-500 text-xs mt-1 leading-relaxed">{gap.reason}</p>
        </div>
      </div>
    </div>
  );
}
