"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addWardrobeItem, generateId, loadState, saveStyleGaps, saveSuggestedPieces } from "@/lib/storage";
import { MOCK_WARDROBE_ITEMS, MOCK_STYLE_GAPS, MOCK_SUGGESTED_PIECES } from "@/lib/mockData";
import type { WardrobeItem, StyleGap, SuggestedPiece } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕",
  bottoms: "👖",
  dresses: "👗",
  outerwear: "🧥",
  shoes: "👟",
  accessories: "👜",
  activewear: "🏃",
  formalwear: "🎩",
  swimwear: "👙",
  underwear: "🩲",
};

export default function WardrobeOnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "scanning" | "review" | "gaps">("intro");
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState<typeof MOCK_WARDROBE_ITEMS>([]);
  const [scanningItem, setScanningItem] = useState("");

  const simulateScan = () => {
    setPhase("scanning");
    setScanProgress(0);
    setScannedItems([]);

    const items = MOCK_WARDROBE_ITEMS;
    let idx = 0;

    const interval = setInterval(() => {
      if (idx < items.length) {
        const item = items[idx];
        setScanningItem(`${CATEGORY_ICONS[item.category]} ${item.name}`);
        setScannedItems((prev) => [...prev, item]);
        setScanProgress(Math.round(((idx + 1) / items.length) * 100));
        idx++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("review"), 800);
      }
    }, 300);
  };

  const handleSaveWardrobe = () => {
    const state = loadState();
    const userId = state.userProfile?.id || generateId();
    const now = new Date().toISOString();

    // Save all scanned items
    scannedItems.forEach((item) => {
      const wardrobeItem: WardrobeItem = {
        ...item,
        id: generateId(),
        userId,
        createdAt: now,
        updatedAt: now,
      };
      addWardrobeItem(wardrobeItem);
    });

    // Save style gaps
    const gaps: StyleGap[] = MOCK_STYLE_GAPS.map((g) => ({
      ...g,
      id: generateId(),
      userId,
      createdAt: now,
    }));
    saveStyleGaps(gaps);

    // Save suggested pieces
    const pieces: SuggestedPiece[] = MOCK_SUGGESTED_PIECES.map((p) => ({
      ...p,
      id: generateId(),
      userId,
      createdAt: now,
    }));
    saveSuggestedPieces(pieces);

    setPhase("gaps");
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 flex flex-col">
      <div className="px-6 pt-12 pb-4">
        {phase !== "intro" && (
          <button
            onClick={() => setPhase("intro")}
            className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <h1 className="text-2xl font-bold text-stone-900">
          {phase === "intro" && "Your digital wardrobe"}
          {phase === "scanning" && "Scanning your wardrobe..."}
          {phase === "review" && "Your wardrobe overview"}
          {phase === "gaps" && "Style insights"}
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          {phase === "intro" && "Digitise your clothing for personalised outfit suggestions"}
          {phase === "scanning" && "Identifying and categorising your items"}
          {phase === "review" && "Review what we found"}
          {phase === "gaps" && "We've analysed your wardrobe"}
        </p>
      </div>

      <div className="flex-1 px-6 pb-40 overflow-y-auto">
        {/* Intro phase */}
        {phase === "intro" && (
          <div className="space-y-4 mt-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <div className="text-4xl mb-3">👗</div>
              <h2 className="text-lg font-semibold text-stone-900 mb-2">
                Build your digital wardrobe
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                We&apos;ll help you catalogue your clothing so we can generate personalised outfits, identify gaps, and help you shop more intentionally.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: "📸", title: "Scan your wardrobe", desc: "We simulate scanning your existing items" },
                { icon: "🏷️", title: "Auto-categorise", desc: "Items are tagged and organised automatically" },
                { icon: "✨", title: "Get outfit suggestions", desc: "Personalised looks from your own clothes" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl p-4 border border-stone-100">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-medium text-stone-900 text-sm">{item.title}</div>
                    <div className="text-stone-500 text-xs mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scanning phase */}
        {phase === "scanning" && (
          <div className="mt-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
              <div
                className="absolute inset-0 rounded-full border-4 border-rose-400 transition-all duration-300"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((scanProgress / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos((scanProgress / 100) * 2 * Math.PI)}%, 50% 50%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-rose-500">{scanProgress}%</span>
              </div>
            </div>

            <p className="text-stone-600 text-sm mb-2">Currently scanning:</p>
            <p className="text-stone-900 font-medium text-base mb-6">{scanningItem}</p>

            <div className="text-left space-y-2 max-h-64 overflow-y-auto">
              {scannedItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-stone-100">
                  <span className="text-lg">{CATEGORY_ICONS[item.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-900 truncate">{item.name}</div>
                    <div className="text-xs text-stone-400 capitalize">{item.category}</div>
                  </div>
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review phase */}
        {phase === "review" && (
          <div className="mt-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-stone-100">
                <div className="text-2xl font-bold text-rose-500">{scannedItems.length}</div>
                <div className="text-xs text-stone-500 mt-1">Items found</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-stone-100">
                <div className="text-2xl font-bold text-rose-500">
                  {new Set(scannedItems.map((i) => i.category)).size}
                </div>
                <div className="text-xs text-stone-500 mt-1">Categories</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center border border-stone-100">
                <div className="text-2xl font-bold text-rose-500">
                  {scannedItems.filter((i) => i.isFavourite).length}
                </div>
                <div className="text-xs text-stone-500 mt-1">Favourites</div>
              </div>
            </div>

            {/* Items by category */}
            {Object.entries(
              scannedItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, typeof scannedItems>)
            ).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-50 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category]}</span>
                  <span className="text-sm font-semibold text-stone-900 capitalize">{category}</span>
                  <span className="ml-auto text-xs text-stone-400">{items.length} items</span>
                </div>
                <div className="divide-y divide-stone-50">
                  {items.map((item, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm text-stone-900">{item.name}</div>
                        {item.brand && <div className="text-xs text-stone-400">{item.brand}</div>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.tag === "keep" ? "bg-green-100 text-green-700" :
                        item.tag === "review" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {item.tag}
                      </span>
                      {item.isFavourite && <span className="text-rose-400">♥</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gaps phase */}
        {phase === "gaps" && (
          <div className="mt-4 space-y-4">
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <p className="text-rose-800 text-sm leading-relaxed">
                ✨ Great wardrobe! We&apos;ve identified a few pieces that could unlock many more outfit combinations.
              </p>
            </div>

            <h3 className="text-sm font-semibold text-stone-700">Wardrobe gaps</h3>
            {MOCK_STYLE_GAPS.map((gap, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{CATEGORY_ICONS[gap.category]}</span>
                  <div>
                    <div className="text-sm font-semibold text-stone-900">{gap.description}</div>
                    <div className="text-xs text-stone-500 mt-1">{gap.reason}</div>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      gap.priority === "high" ? "bg-rose-100 text-rose-700" :
                      gap.priority === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-stone-100 text-stone-600"
                    }`}>
                      {gap.priority} priority
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-4 border border-stone-100">
              <p className="text-sm text-stone-600">
                We&apos;ve prepared personalised shopping suggestions to fill these gaps. You can explore them in the Wardrobe section.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent space-y-3">
        {phase === "intro" && (
          <>
            <Button variant="primary" size="lg" fullWidth onClick={simulateScan}>
              Scan my wardrobe
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => router.push("/dashboard")}>
              Skip for now
            </Button>
          </>
        )}
        {phase === "review" && (
          <Button variant="primary" size="lg" fullWidth onClick={handleSaveWardrobe}>
            Save wardrobe & see insights →
          </Button>
        )}
        {phase === "gaps" && (
          <Button variant="primary" size="lg" fullWidth onClick={handleComplete}>
            Go to my dashboard →
          </Button>
        )}
      </div>
    </div>
  );
}
