"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { loadState, updateTravelPlan } from "@/lib/storage";
import type { TravelPlan, PackingItem } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
};

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"outfits" | "packing">("outfits");

  useEffect(() => {
    const state = loadState();
    const found = state.travelPlans.find((t) => t.id === id);
    if (found) setPlan(found);
  }, [id]);

  const togglePacked = (itemId: string) => {
    if (!plan) return;
    const updated: TravelPlan = {
      ...plan,
      packingChecklist: plan.packingChecklist.map((item) =>
        item.id === itemId ? { ...item, packed: !item.packed } : item
      ),
      updatedAt: new Date().toISOString(),
    };
    updateTravelPlan(updated);
    setPlan(updated);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Trip not found</p>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const packed = plan.packingChecklist.filter((i) => i.packed).length;
  const total = plan.packingChecklist.length;

  // Group packing items by category
  const packingByCategory = plan.packingChecklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 pt-12 pb-6 text-white">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-blue-200 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{plan.destination}</h1>
            <p className="text-blue-200 mt-1 text-sm">
              {new Date(plan.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              {" – "}
              {new Date(plan.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              {" · "}{nights} night{nights !== 1 ? "s" : ""}
            </p>
            <p className="text-blue-200 text-xs mt-0.5 capitalize">{plan.tripType.replace("_", " ")} · {plan.luggageType.replace("_", " ")}</p>
          </div>
          <div className="text-4xl">✈️</div>
        </div>

        {/* Packing progress */}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span>Packing progress</span>
              <span>{packed}/{total} items</span>
            </div>
            <div className="h-2 bg-blue-400/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (packed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 px-6">
        <div className="flex gap-6">
          {(["outfits", "packing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-stone-500"
              }`}
            >
              {tab === "outfits" ? `Outfits (${plan.dayOutfits.length})` : `Packing (${packed}/${total})`}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Outfits tab */}
        {activeTab === "outfits" && (
          <>
            {plan.dayOutfits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👗</div>
                <p className="text-stone-500">No outfits planned yet</p>
              </div>
            ) : (
              plan.dayOutfits.map((dayOutfit) => {
                const { outfit } = dayOutfit;
                const outfitItems = [
                  outfit.dress ? { label: "Dress", item: outfit.dress } : null,
                  !outfit.dress && outfit.top ? { label: "Top", item: outfit.top } : null,
                  !outfit.dress && outfit.bottom ? { label: "Bottom", item: outfit.bottom } : null,
                  { label: "Shoes", item: outfit.shoes },
                  ...(outfit.accessories?.map((a) => ({ label: "Layer", item: a })) || []),
                ].filter(Boolean) as { label: string; item: NonNullable<typeof outfit.top> }[];

                return (
                  <div key={dayOutfit.day} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-stone-900 text-sm">
                          Day {dayOutfit.day + 1}
                        </span>
                        <span className="text-stone-400 text-xs ml-2">
                          {new Date(dayOutfit.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-stone-50">
                      {outfitItems.map(({ label, item }, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">
                            {CATEGORY_ICONS[item.category] || "👗"}
                          </div>
                          <div>
                            <p className="text-xs text-stone-400">{label}</p>
                            <p className="text-sm font-medium text-stone-900">{item.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Packing tab */}
        {activeTab === "packing" && (
          <>
            {packed === total && total > 0 && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <p className="text-green-800 text-sm font-medium">🎉 All packed! Have a wonderful trip.</p>
              </div>
            )}

            {Object.entries(packingByCategory).map(([category, items]) => (
              <div key={category} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-50 bg-stone-50">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{category}</span>
                </div>
                <div className="divide-y divide-stone-50">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => togglePacked(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        item.packed ? "bg-green-500 border-green-500" : "border-stone-300"
                      }`}>
                        {item.packed && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${item.packed ? "line-through text-stone-400" : "text-stone-900"}`}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
