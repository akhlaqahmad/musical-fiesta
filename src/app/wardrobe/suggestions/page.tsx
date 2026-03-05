"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadState } from "@/lib/storage";
import type { SuggestedPiece } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
};

const CATEGORY_COLOURS: Record<string, string> = {
  tops: "bg-blue-100",
  bottoms: "bg-indigo-100",
  dresses: "bg-pink-100",
  outerwear: "bg-stone-100",
  shoes: "bg-amber-100",
  accessories: "bg-purple-100",
  activewear: "bg-green-100",
  formalwear: "bg-slate-100",
};

export default function SuggestionsPage() {
  const router = useRouter();
  const [pieces, setPieces] = useState<SuggestedPiece[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setPieces(state.suggestedPieces);
  }, [router]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        <h1 className="text-2xl font-bold text-stone-900">Suggested pieces</h1>
        <p className="text-stone-500 mt-1 text-sm">Curated picks to fill your wardrobe gaps</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {pieces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-stone-600 font-medium">No suggestions yet</p>
            <p className="text-stone-400 text-sm mt-1">Complete your wardrobe scan to get personalised picks</p>
          </div>
        ) : (
          <>
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <p className="text-rose-800 text-sm leading-relaxed">
                ✨ These suggestions are based on your wardrobe gaps, lifestyle, and colour palette. They&apos;re curated to work with what you already own.
              </p>
            </div>

            {pieces.map((piece) => (
              <div key={piece.id} className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                {/* Image placeholder */}
                <div className={`h-48 ${CATEGORY_COLOURS[piece.category] || "bg-stone-100"} flex items-center justify-center`}>
                  <span className="text-6xl">{CATEGORY_ICONS[piece.category] || "👗"}</span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-900">{piece.name}</h3>
                      <p className="text-rose-500 text-sm font-medium mt-0.5">{piece.priceRange}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(piece.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                        saved.has(piece.id)
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-white border-stone-200 text-stone-400"
                      }`}
                    >
                      {saved.has(piece.id) ? "♥" : "♡"}
                    </button>
                  </div>

                  <p className="text-stone-600 text-sm mt-3 leading-relaxed">{piece.description}</p>

                  <div className="mt-3 bg-amber-50 rounded-xl px-3 py-2">
                    <p className="text-amber-800 text-xs">
                      <span className="font-semibold">Why this works for you: </span>
                      {piece.reason}
                    </p>
                  </div>

                  <button className="mt-4 w-full py-2.5 rounded-2xl border border-stone-200 text-stone-700 text-sm font-medium hover:border-rose-300 hover:text-rose-600 transition-colors">
                    Shop this style →
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
