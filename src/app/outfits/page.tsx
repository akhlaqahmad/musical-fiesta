"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState } from "@/lib/storage";
import type { OutfitPlan } from "@/lib/types";

const SENTIMENT_EMOJI: Record<string, string> = {
  dislike: "😕",
  neutral: "😐",
  like: "🙂",
  love: "😍",
};

export default function OutfitsPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<OutfitPlan[]>([]);

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setOutfits([...state.outfitPlans].reverse());
  }, [router]);

  const today = new Date().toISOString().split("T")[0];
  const todayOutfit = outfits.find((o) => o.date === today);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <h1 className="text-2xl font-bold text-stone-900">Outfits</h1>
        <p className="text-stone-500 mt-1 text-sm">Your personalised looks</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Generate CTA */}
        <Link
          href="/outfits/generate"
          className="block bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-200 text-xs font-medium uppercase tracking-wide mb-1">
                {todayOutfit ? "Today's look" : "Get dressed"}
              </p>
              <h2 className="text-xl font-bold">
                {todayOutfit ? todayOutfit.context : "Generate today's outfit"}
              </h2>
              <p className="text-rose-200 text-sm mt-1">
                {todayOutfit
                  ? `${todayOutfit.mood} · ${todayOutfit.weatherCategory}`
                  : "Personalised for your mood & weather"}
              </p>
            </div>
            <div className="text-4xl">✨</div>
          </div>
          <div className="mt-4 text-rose-200 text-sm font-medium">
            {todayOutfit ? "View or regenerate →" : "Generate now →"}
          </div>
        </Link>

        {/* Plan tomorrow */}
        <Link
          href="/outfits/tomorrow"
          className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">🌙</div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900 text-sm">Plan tomorrow&apos;s look</h3>
              <p className="text-stone-500 text-xs mt-0.5">Set your outfit the night before</p>
            </div>
            <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* History */}
        {outfits.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-stone-700 mb-3">Recent outfits</h2>
            <div className="space-y-3">
              {outfits.slice(0, 10).map((outfit) => (
                <Link
                  key={outfit.id}
                  href={`/outfits/${outfit.id}`}
                  className="block bg-white rounded-2xl p-4 border border-stone-100 hover:border-rose-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl flex-shrink-0">
                      👗
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-stone-900 text-sm truncate">{outfit.context}</p>
                        {outfit.feedbackScore !== undefined && (
                          <span className="text-sm flex-shrink-0">
                            {outfit.feedbackScore >= 80 ? SENTIMENT_EMOJI.love :
                             outfit.feedbackScore >= 60 ? SENTIMENT_EMOJI.like :
                             outfit.feedbackScore >= 40 ? SENTIMENT_EMOJI.neutral :
                             SENTIMENT_EMOJI.dislike}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-400 text-xs mt-0.5">
                        {new Date(outfit.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}{outfit.mood}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-stone-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {outfits.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👗</div>
            <p className="text-stone-600 font-medium">No outfits yet</p>
            <p className="text-stone-400 text-sm mt-1">Generate your first look above</p>
          </div>
        )}
      </div>
    </div>
  );
}
