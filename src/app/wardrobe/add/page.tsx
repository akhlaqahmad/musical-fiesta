"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addWardrobeItem, generateId, loadState } from "@/lib/storage";
import type { WardrobeCategory, WardrobeTag } from "@/lib/types";

const CATEGORIES: { value: WardrobeCategory; label: string; icon: string }[] = [
  { value: "tops", label: "Tops", icon: "👕" },
  { value: "bottoms", label: "Bottoms", icon: "👖" },
  { value: "dresses", label: "Dresses", icon: "👗" },
  { value: "outerwear", label: "Outerwear", icon: "🧥" },
  { value: "shoes", label: "Shoes", icon: "👟" },
  { value: "accessories", label: "Accessories", icon: "👜" },
  { value: "activewear", label: "Activewear", icon: "🏃" },
  { value: "formalwear", label: "Formalwear", icon: "🎩" },
  { value: "swimwear", label: "Swimwear", icon: "👙" },
];

const COLOUR_OPTIONS = [
  "Black", "White", "Cream", "Beige", "Grey", "Navy", "Blue",
  "Red", "Pink", "Rose", "Orange", "Yellow", "Green", "Olive",
  "Brown", "Camel", "Tan", "Purple", "Multicolour", "Print",
];

export default function AddWardrobeItemPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WardrobeCategory | "">("");
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState<WardrobeTag>("keep");
  const [colours, setColours] = useState<string[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanMode(false);
      // Simulate detected item
      setName("Scanned item");
      setCategory("tops");
      setColours(["White"]);
    }, 2000);
  };

  const handleSave = () => {
    if (!name || !category) return;
    const state = loadState();
    const userId = state.userProfile?.id || generateId();
    const now = new Date().toISOString();

    addWardrobeItem({
      id: generateId(),
      userId,
      name,
      category: category as WardrobeCategory,
      brand: brand || undefined,
      notes: notes || undefined,
      tag,
      colours,
      isFavourite,
      hiddenFromSuggestions: false,
      createdAt: now,
      updatedAt: now,
    });

    router.push("/wardrobe");
  };

  if (scanMode) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white px-6">
        <div className="text-center">
          {scanning ? (
            <>
              <div className="w-24 h-24 rounded-full border-4 border-rose-400 border-t-transparent animate-spin mx-auto mb-6" />
              <p className="text-lg font-semibold">Scanning item...</p>
              <p className="text-stone-400 text-sm mt-2">Identifying category and colours</p>
            </>
          ) : (
            <>
              <div className="w-64 h-64 border-2 border-rose-400 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-stone-800">
                <div className="text-6xl">📸</div>
              </div>
              <p className="text-lg font-semibold mb-2">Point at your clothing item</p>
              <p className="text-stone-400 text-sm mb-8">We&apos;ll identify the category and colours automatically</p>
              <Button variant="primary" size="lg" onClick={simulateScan}>
                Capture item
              </Button>
              <button
                onClick={() => setScanMode(false)}
                className="block mt-4 text-stone-400 text-sm mx-auto"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
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
        <h1 className="text-2xl font-bold text-stone-900">Add item</h1>
        <p className="text-stone-500 mt-1 text-sm">Add a new piece to your wardrobe</p>
      </div>

      <div className="px-6 pt-6 space-y-5">
        {/* Scan option */}
        <button
          onClick={() => setScanMode(true)}
          className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-100 hover:border-rose-200 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-2xl">📸</div>
          <div className="text-left">
            <div className="font-medium text-stone-900 text-sm">Scan with camera</div>
            <div className="text-stone-500 text-xs mt-0.5">Auto-detect category and colours</div>
          </div>
          <svg className="w-5 h-5 text-stone-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">or enter manually</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Item name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. White linen shirt"
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Category *</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${
                  category === cat.value
                    ? "bg-rose-50 border-rose-400 text-rose-700"
                    : "bg-white border-stone-200 text-stone-600 hover:border-rose-200"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Colours */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Colours</label>
          <div className="flex flex-wrap gap-2">
            {COLOUR_OPTIONS.map((colour) => (
              <button
                key={colour}
                type="button"
                onClick={() => {
                  setColours((prev) =>
                    prev.includes(colour) ? prev.filter((c) => c !== colour) : [...prev, colour]
                  );
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  colours.includes(colour)
                    ? "bg-stone-900 border-stone-900 text-white"
                    : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {colour}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Brand <span className="text-stone-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Arket, Zara, H&M"
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          />
        </div>

        {/* Tag */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Tag</label>
          <div className="flex gap-2">
            {(["keep", "review", "donate"] as WardrobeTag[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  tag === t
                    ? t === "keep" ? "bg-green-500 border-green-500 text-white" :
                      t === "review" ? "bg-amber-500 border-amber-500 text-white" :
                      "bg-red-500 border-red-500 text-white"
                    : "bg-white border-stone-200 text-stone-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Favourite */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-stone-100">
          <span className="text-sm font-medium text-stone-700">Mark as favourite</span>
          <button
            type="button"
            onClick={() => setIsFavourite(!isFavourite)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isFavourite ? "bg-rose-500" : "bg-stone-200"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isFavourite ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes <span className="text-stone-400 font-normal">(optional)</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this item..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          disabled={!name || !category}
        >
          Add to wardrobe
        </Button>
      </div>
    </div>
  );
}
