"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState, updateWardrobeItem, deleteWardrobeItem } from "@/lib/storage";
import type { WardrobeItem, WardrobeCategory, WardrobeTag } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
  swimwear: "👙", underwear: "🩲",
};

const CATEGORIES: WardrobeCategory[] = [
  "tops", "bottoms", "dresses", "outerwear", "shoes",
  "accessories", "activewear", "formalwear",
];

const TAG_COLOURS: Record<WardrobeTag, string> = {
  keep: "bg-green-100 text-green-700",
  review: "bg-amber-100 text-amber-700",
  donate: "bg-red-100 text-red-700",
};

export default function WardrobePage() {
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<WardrobeCategory | "all">("all");
  const [activeTag, setActiveTag] = useState<WardrobeTag | "all">("all");
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setItems(state.wardrobeItems);
  }, [router]);

  const filtered = items.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (activeTag !== "all" && item.tag !== activeTag) return false;
    return true;
  });

  const handleTagChange = (item: WardrobeItem, tag: WardrobeTag) => {
    const updated = { ...item, tag, updatedAt: new Date().toISOString() };
    updateWardrobeItem(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setSelectedItem(updated);
  };

  const handleFavouriteToggle = (item: WardrobeItem) => {
    const updated = { ...item, isFavourite: !item.isFavourite, updatedAt: new Date().toISOString() };
    updateWardrobeItem(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setSelectedItem(updated);
  };

  const handleHideToggle = (item: WardrobeItem) => {
    const updated = { ...item, hiddenFromSuggestions: !item.hiddenFromSuggestions, updatedAt: new Date().toISOString() };
    updateWardrobeItem(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setSelectedItem(updated);
  };

  const handleDelete = (item: WardrobeItem) => {
    deleteWardrobeItem(item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItem(null);
  };

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-stone-900">My Wardrobe</h1>
          <Link
            href="/wardrobe/add"
            className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 text-sm">
          <span className="text-stone-900 font-semibold">{items.length} items</span>
          <span className="text-stone-400">·</span>
          <span className="text-green-600">{items.filter((i) => i.tag === "keep").length} keep</span>
          <span className="text-stone-400">·</span>
          <span className="text-amber-600">{items.filter((i) => i.tag === "review").length} review</span>
          <span className="text-stone-400">·</span>
          <span className="text-red-500">{items.filter((i) => i.tag === "donate").length} donate</span>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeCategory === "all"
                ? "bg-stone-900 border-stone-900 text-white"
                : "bg-white border-stone-200 text-stone-600"
            }`}
          >
            All ({items.length})
          </button>
          {CATEGORIES.filter((c) => categoryCounts[c] > 0).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-stone-900 border-stone-900 text-white"
                  : "bg-white border-stone-200 text-stone-600"
              }`}
            >
              {CATEGORY_ICONS[cat]} {cat} ({categoryCounts[cat]})
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 mt-2">
          {(["all", "keep", "review", "donate"] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeTag === tag
                  ? "bg-rose-500 border-rose-500 text-white"
                  : "bg-white border-stone-200 text-stone-600"
              }`}
            >
              {tag === "all" ? "All tags" : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 pt-4 flex gap-3">
        <Link href="/wardrobe/gaps" className="flex-1 bg-white rounded-2xl p-3 border border-stone-100 text-center hover:border-rose-200 transition-colors">
          <div className="text-lg">🔍</div>
          <div className="text-xs font-medium text-stone-700 mt-1">Style gaps</div>
        </Link>
        <Link href="/wardrobe/suggestions" className="flex-1 bg-white rounded-2xl p-3 border border-stone-100 text-center hover:border-rose-200 transition-colors">
          <div className="text-lg">✨</div>
          <div className="text-xs font-medium text-stone-700 mt-1">Suggestions</div>
        </Link>
        <Link href="/wardrobe/add" className="flex-1 bg-white rounded-2xl p-3 border border-stone-100 text-center hover:border-rose-200 transition-colors">
          <div className="text-lg">📸</div>
          <div className="text-xs font-medium text-stone-700 mt-1">Add item</div>
        </Link>
      </div>

      {/* Items grid */}
      <div className="px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">👗</div>
            <p className="text-stone-500 text-sm">No items in this category yet</p>
            <Link href="/wardrobe/add" className="inline-block mt-3 text-rose-500 text-sm font-medium">
              Add your first item →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl border border-stone-100 overflow-hidden text-left hover:border-rose-200 transition-colors"
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                  <span className="text-4xl">{CATEGORY_ICONS[item.category]}</span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                      {item.brand && <p className="text-xs text-stone-400 truncate">{item.brand}</p>}
                    </div>
                    {item.isFavourite && <span className="text-rose-400 text-sm flex-shrink-0">♥</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLOURS[item.tag]}`}>
                      {item.tag}
                    </span>
                    {item.hiddenFromSuggestions && (
                      <span className="text-xs text-stone-400">hidden</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Item detail sheet */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-6" />

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl flex-shrink-0">
                {CATEGORY_ICONS[selectedItem.category]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-900 text-lg">{selectedItem.name}</h3>
                {selectedItem.brand && <p className="text-stone-500 text-sm">{selectedItem.brand}</p>}
                <p className="text-stone-400 text-xs capitalize mt-0.5">{selectedItem.category}</p>
              </div>
            </div>

            {/* Tag selector */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Tag</p>
              <div className="flex gap-2">
                {(["keep", "review", "donate"] as WardrobeTag[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagChange(selectedItem, tag)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedItem.tag === tag
                        ? tag === "keep" ? "bg-green-500 border-green-500 text-white" :
                          tag === "review" ? "bg-amber-500 border-amber-500 text-white" :
                          "bg-red-500 border-red-500 text-white"
                        : "bg-white border-stone-200 text-stone-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleFavouriteToggle(selectedItem)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-stone-50 text-stone-700 text-sm font-medium"
              >
                <span>{selectedItem.isFavourite ? "♥" : "♡"}</span>
                {selectedItem.isFavourite ? "Remove from favourites" : "Add to favourites"}
              </button>
              <button
                onClick={() => handleHideToggle(selectedItem)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-stone-50 text-stone-700 text-sm font-medium"
              >
                <span>{selectedItem.hiddenFromSuggestions ? "👁" : "🙈"}</span>
                {selectedItem.hiddenFromSuggestions ? "Show in outfit suggestions" : "Hide from outfit suggestions"}
              </button>
              <button
                onClick={() => handleDelete(selectedItem)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium"
              >
                <span>🗑</span>
                Remove from wardrobe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
