"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addOutfitPlan, generateId, loadState } from "@/lib/storage";
import { MOOD_OPTIONS, WEATHER_OPTIONS, OUTFIT_CONTEXTS } from "@/lib/mockData";
import type { OutfitPlan, OutfitItem, WardrobeItem } from "@/lib/types";

function generateOutfit(
  wardrobeItems: WardrobeItem[],
  mood: string,
  context: string,
  weather: string,
): Partial<OutfitPlan> {
  const available = wardrobeItems.filter((i) => i.tag !== "donate" && !i.hiddenFromSuggestions);

  const tops = available.filter((i) => i.category === "tops");
  const bottoms = available.filter((i) => i.category === "bottoms");
  const dresses = available.filter((i) => i.category === "dresses");
  const shoes = available.filter((i) => i.category === "shoes");
  const accessories = available.filter((i) => i.category === "accessories");
  const outerwear = available.filter((i) => i.category === "outerwear");

  const pick = <T,>(arr: T[]): T | undefined => arr[Math.floor(Math.random() * arr.length)];

  // Decide dress vs top+bottom
  const useDress = dresses.length > 0 && Math.random() > 0.6;

  const toOutfitItem = (item: WardrobeItem): OutfitItem => ({
    wardrobeItemId: item.id,
    name: item.name,
    category: item.category,
    colour: item.colours[0],
  });

  const result: Partial<OutfitPlan> = {};

  if (useDress) {
    const dress = pick(dresses);
    if (dress) result.dress = toOutfitItem(dress);
  } else {
    const top = pick(tops);
    const bottom = pick(bottoms);
    if (top) result.top = toOutfitItem(top);
    if (bottom) result.bottom = toOutfitItem(bottom);
  }

  // Always add shoes
  const shoe = pick(shoes);
  if (shoe) {
    result.shoes = toOutfitItem(shoe);
  } else {
    result.shoes = { name: "Your favourite shoes", category: "shoes" };
  }

  // Add accessories
  const acc = pick(accessories);
  if (acc) result.accessories = [toOutfitItem(acc)];

  // Add outerwear for cold/rainy
  if (["cold", "cool", "rainy"].includes(weather) && outerwear.length > 0) {
    const layer = pick(outerwear);
    if (layer) {
      result.accessories = [...(result.accessories || []), toOutfitItem(layer)];
    }
  }

  // If no top from wardrobe
  if (!result.top && !result.dress) {
    result.top = { name: "White linen shirt", category: "tops", colour: "white" };
  }
  if (!result.bottom && !result.dress) {
    result.bottom = { name: "Dark wash jeans", category: "bottoms", colour: "dark blue" };
  }

  return result;
}

export default function GenerateOutfitPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "generating" | "result">("select");
  const [mood, setMood] = useState("");
  const [context, setContext] = useState("");
  const [weather, setWeather] = useState("");
  const [outfit, setOutfit] = useState<Partial<OutfitPlan> | null>(null);
  const [forDate, setForDate] = useState(new Date().toISOString().split("T")[0]);

  const canGenerate = mood && context && weather;

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => {
      const state = loadState();
      const generated = generateOutfit(state.wardrobeItems, mood, context, weather);
      setOutfit(generated);
      setStep("result");
    }, 1800);
  };

  const handleRegenerate = () => {
    setStep("generating");
    setTimeout(() => {
      const state = loadState();
      const generated = generateOutfit(state.wardrobeItems, mood, context, weather);
      setOutfit(generated);
      setStep("result");
    }, 1200);
  };

  const handleSave = () => {
    if (!outfit) return;
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    const plan: OutfitPlan = {
      id: generateId(),
      userId,
      date: forDate,
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
    router.push(`/outfits/${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <button
          onClick={() => step === "result" ? setStep("select") : router.back()}
          className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {step === "result" ? "Change options" : "Back"}
        </button>
        <h1 className="text-2xl font-bold text-stone-900">
          {step === "select" && "Generate outfit"}
          {step === "generating" && "Creating your look..."}
          {step === "result" && "Your outfit"}
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          {step === "select" && "Tell us about today"}
          {step === "generating" && "Matching your wardrobe to your day"}
          {step === "result" && "Personalised from your wardrobe"}
        </p>
      </div>

      <div className="px-6 pt-6">
        {/* Selection step */}
        {step === "select" && (
          <div className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Date</label>
              <input
                type="date"
                value={forDate}
                onChange={(e) => setForDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">How are you feeling?</label>
              <div className="grid grid-cols-3 gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${
                      mood === m.value
                        ? "bg-rose-50 border-rose-400 text-rose-700"
                        : "bg-white border-stone-200 text-stone-600 hover:border-rose-200"
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">What&apos;s the occasion?</label>
              <div className="flex flex-wrap gap-2">
                {OUTFIT_CONTEXTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setContext(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      context === c
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-white border-stone-200 text-stone-700 hover:border-rose-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">What&apos;s the weather like?</label>
              <div className="grid grid-cols-3 gap-2">
                {WEATHER_OPTIONS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setWeather(w.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${
                      weather === w.value
                        ? "bg-rose-50 border-rose-400 text-rose-700"
                        : "bg-white border-stone-200 text-stone-600 hover:border-rose-200"
                    }`}
                  >
                    <span className="text-xl">{w.emoji}</span>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generating step */}
        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full bg-rose-100 animate-ping opacity-75" />
              <div className="relative w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center text-4xl">
                ✨
              </div>
            </div>
            <p className="text-stone-900 font-semibold text-lg">Styling your look...</p>
            <p className="text-stone-500 text-sm mt-2">Matching your wardrobe to your day</p>
            <div className="mt-6 space-y-2 text-sm text-stone-400 text-center">
              <p>Checking your wardrobe...</p>
              <p>Considering your colour palette...</p>
              <p>Putting it all together...</p>
            </div>
          </div>
        )}

        {/* Result step */}
        {step === "result" && outfit && (
          <div className="space-y-4">
            {/* Context summary */}
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                {MOOD_OPTIONS.find((m) => m.value === mood)?.emoji} {mood}
              </span>
              <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                {context}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {WEATHER_OPTIONS.find((w) => w.value === weather)?.emoji} {weather}
              </span>
            </div>

            {/* Outfit items */}
            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
              {outfit.dress ? (
                <OutfitItemCard label="Dress" item={outfit.dress} />
              ) : (
                <>
                  {outfit.top && <OutfitItemCard label="Top" item={outfit.top} />}
                  {outfit.bottom && <OutfitItemCard label="Bottom" item={outfit.bottom} divider />}
                </>
              )}
              {outfit.shoes && <OutfitItemCard label="Shoes" item={outfit.shoes} divider />}
              {outfit.accessories?.map((acc, i) => (
                <OutfitItemCard key={i} label="Layer / Accessory" item={acc} divider />
              ))}
            </div>

            {/* Styling tip */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-amber-800 text-sm">
                💡 <span className="font-semibold">Styling tip:</span> Tuck in your top to define your waist and create a polished, intentional look.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-700 text-sm font-medium hover:border-rose-300 transition-colors"
              >
                🔄 Try another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
        {step === "select" && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            Generate my outfit ✨
          </Button>
        )}
        {step === "result" && (
          <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
            Save this outfit →
          </Button>
        )}
      </div>
    </div>
  );
}

function OutfitItemCard({ label, item, divider = false }: { label: string; item: OutfitItem; divider?: boolean }) {
  const CATEGORY_ICONS: Record<string, string> = {
    tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
    shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
  };

  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${divider ? "border-t border-stone-50" : ""}`}>
      <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl flex-shrink-0">
        {CATEGORY_ICONS[item.category] || "👗"}
      </div>
      <div className="flex-1">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-stone-900 font-semibold text-sm mt-0.5">{item.name}</p>
        {item.colour && <p className="text-stone-400 text-xs mt-0.5 capitalize">{item.colour}</p>}
      </div>
    </div>
  );
}
