"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addOutfitPlan, generateId, loadState } from "@/lib/storage";
import { MOOD_OPTIONS, WEATHER_OPTIONS, OUTFIT_CONTEXTS } from "@/lib/mockData";
import type { OutfitPlan, WardrobeItem, OutfitItem } from "@/lib/types";

function generateOutfit(wardrobeItems: WardrobeItem[], mood: string, context: string, weather: string): Partial<OutfitPlan> {
  const available = wardrobeItems.filter((i) => i.tag !== "donate" && !i.hiddenFromSuggestions);
  const tops = available.filter((i) => i.category === "tops");
  const bottoms = available.filter((i) => i.category === "bottoms");
  const dresses = available.filter((i) => i.category === "dresses");
  const shoes = available.filter((i) => i.category === "shoes");
  const accessories = available.filter((i) => i.category === "accessories");
  const outerwear = available.filter((i) => i.category === "outerwear");

  const pick = <T,>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];
  const toItem = (item: WardrobeItem): OutfitItem => ({
    wardrobeItemId: item.id, name: item.name, category: item.category, colour: item.colours[0],
  });

  const useDress = dresses.length > 0 && Math.random() > 0.6;
  const result: Partial<OutfitPlan> = {};

  if (useDress) {
    const d = pick(dresses); if (d) result.dress = toItem(d);
  } else {
    const t = pick(tops); if (t) result.top = toItem(t);
    const b = pick(bottoms); if (b) result.bottom = toItem(b);
  }

  const s = pick(shoes);
  result.shoes = s ? toItem(s) : { name: "Your favourite shoes", category: "shoes" };

  const acc = pick(accessories);
  if (acc) result.accessories = [toItem(acc)];

  if (["cold", "cool", "rainy"].includes(weather) && outerwear.length > 0) {
    const layer = pick(outerwear);
    if (layer) result.accessories = [...(result.accessories || []), toItem(layer)];
  }

  if (!result.top && !result.dress) result.top = { name: "White linen shirt", category: "tops", colour: "white" };
  if (!result.bottom && !result.dress) result.bottom = { name: "Dark wash jeans", category: "bottoms", colour: "dark blue" };

  return result;
}

export default function TomorrowPage() {
  const router = useRouter();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [mood, setMood] = useState("");
  const [context, setContext] = useState("");
  const [weather, setWeather] = useState("");
  const [outfit, setOutfit] = useState<Partial<OutfitPlan> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const canGenerate = mood && context && weather;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const state = loadState();
      setOutfit(generateOutfit(state.wardrobeItems, mood, context, weather));
      setGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!outfit) return;
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    const plan: OutfitPlan = {
      id: generateId(),
      userId,
      date: tomorrowStr,
      mood,
      context,
      weatherCategory: weather,
      top: outfit.top || { name: "Top", category: "tops" },
      bottom: outfit.bottom,
      dress: outfit.dress,
      shoes: outfit.shoes || { name: "Shoes", category: "shoes" },
      accessories: outfit.accessories,
      createdAt: new Date().toISOString(),
    };

    addOutfitPlan(plan);
    setSaved(true);
  };

  const CATEGORY_ICONS: Record<string, string> = {
    tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
    shoes: "👟", accessories: "👜",
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-stone-500 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-stone-900">Plan tomorrow&apos;s look</h1>
        <p className="text-stone-500 mt-1 text-sm">
          {tomorrow.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {saved ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🌙</div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Tomorrow&apos;s look is ready!</h2>
            <p className="text-stone-500 text-sm mb-6">Your outfit is saved and waiting for you in the morning.</p>
            {outfit && (
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden text-left mb-6">
                {outfit.dress && (
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👗</div>
                    <div><p className="text-xs text-stone-400">Dress</p><p className="font-semibold text-sm text-stone-900">{outfit.dress.name}</p></div>
                  </div>
                )}
                {!outfit.dress && outfit.top && (
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👕</div>
                    <div><p className="text-xs text-stone-400">Top</p><p className="font-semibold text-sm text-stone-900">{outfit.top.name}</p></div>
                  </div>
                )}
                {!outfit.dress && outfit.bottom && (
                  <div className="flex items-center gap-4 px-5 py-4 border-t border-stone-50">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👖</div>
                    <div><p className="text-xs text-stone-400">Bottom</p><p className="font-semibold text-sm text-stone-900">{outfit.bottom.name}</p></div>
                  </div>
                )}
                {outfit.shoes && (
                  <div className="flex items-center gap-4 px-5 py-4 border-t border-stone-50">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl">👟</div>
                    <div><p className="text-xs text-stone-400">Shoes</p><p className="font-semibold text-sm text-stone-900">{outfit.shoes.name}</p></div>
                  </div>
                )}
              </div>
            )}
            <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/dashboard")}>
              Back to home
            </Button>
          </div>
        ) : (
          <>
            {/* Mood */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">How do you expect to feel?</label>
              <div className="grid grid-cols-3 gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${mood === m.value ? "bg-rose-50 border-rose-400 text-rose-700" : "bg-white border-stone-200 text-stone-600"}`}>
                    <span className="text-xl">{m.emoji}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">What&apos;s the occasion?</label>
              <div className="flex flex-wrap gap-2">
                {OUTFIT_CONTEXTS.map((c) => (
                  <button key={c} onClick={() => setContext(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${context === c ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-stone-200 text-stone-700"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">Expected weather?</label>
              <div className="grid grid-cols-3 gap-2">
                {WEATHER_OPTIONS.map((w) => (
                  <button key={w.value} onClick={() => setWeather(w.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${weather === w.value ? "bg-rose-50 border-rose-400 text-rose-700" : "bg-white border-stone-200 text-stone-600"}`}>
                    <span className="text-xl">{w.emoji}</span>{w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated outfit */}
            {generating && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">✨</div>
                <p className="text-stone-600">Creating your look...</p>
              </div>
            )}

            {outfit && !generating && (
              <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-stone-50 bg-stone-50">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Your look for tomorrow</p>
                </div>
                {([
                  outfit.dress ? { label: "Dress", item: outfit.dress } : null,
                  !outfit.dress && outfit.top ? { label: "Top", item: outfit.top } : null,
                  !outfit.dress && outfit.bottom ? { label: "Bottom", item: outfit.bottom } : null,
                  { label: "Shoes", item: outfit.shoes },
                  ...(outfit.accessories?.map((a) => ({ label: "Layer", item: a })) || []),
                ].filter((x): x is { label: string; item: OutfitItem } => x !== null)).map(({ label, item }, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-stone-50" : ""}`}>
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl flex-shrink-0">
                      {CATEGORY_ICONS[item.category] || "👗"}
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">{label}</p>
                      <p className="font-semibold text-sm text-stone-900">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!saved && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent space-y-3">
          {!outfit ? (
            <Button variant="primary" size="lg" fullWidth onClick={handleGenerate} disabled={!canGenerate || generating}>
              {generating ? "Generating..." : "Generate tomorrow's look ✨"}
            </Button>
          ) : (
            <>
              <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
                Save this look 🌙
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={handleGenerate}>
                Try another option
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
