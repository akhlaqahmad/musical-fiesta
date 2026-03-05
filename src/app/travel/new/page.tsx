"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addTravelPlan, generateId, loadState } from "@/lib/storage";
import type { TravelPlan, DayOutfit, PackingItem, OutfitPlan, WardrobeItem, OutfitItem } from "@/lib/types";

const TRIP_TYPES = [
  { value: "city_break", label: "City break", emoji: "🏙" },
  { value: "beach", label: "Beach holiday", emoji: "🏖" },
  { value: "business", label: "Business trip", emoji: "💼" },
  { value: "adventure", label: "Adventure / hiking", emoji: "🏔" },
  { value: "wedding", label: "Wedding / event", emoji: "💒" },
  { value: "family", label: "Family visit", emoji: "🏡" },
];

const LUGGAGE_TYPES = [
  { value: "carry_on", label: "Carry-on only", emoji: "🎒" },
  { value: "cabin", label: "Cabin bag", emoji: "💼" },
  { value: "checked", label: "Checked luggage", emoji: "🧳" },
];

function generateTripOutfit(wardrobeItems: WardrobeItem[], day: number): Partial<OutfitPlan> {
  const available = wardrobeItems.filter((i) => i.tag !== "donate" && !i.hiddenFromSuggestions);
  const tops = available.filter((i) => i.category === "tops");
  const bottoms = available.filter((i) => i.category === "bottoms");
  const dresses = available.filter((i) => i.category === "dresses");
  const shoes = available.filter((i) => i.category === "shoes");
  const accessories = available.filter((i) => i.category === "accessories");

  const pick = <T,>(arr: T[], offset = 0): T | undefined => arr[(day + offset) % Math.max(arr.length, 1)];
  const toItem = (item: WardrobeItem): OutfitItem => ({
    wardrobeItemId: item.id, name: item.name, category: item.category, colour: item.colours[0],
  });

  const useDress = dresses.length > 0 && day % 3 === 0;
  const result: Partial<OutfitPlan> = {};

  if (useDress) {
    const d = pick(dresses); if (d) result.dress = toItem(d);
  } else {
    const t = pick(tops, day); if (t) result.top = toItem(t);
    const b = pick(bottoms, day); if (b) result.bottom = toItem(b);
  }

  const s = pick(shoes, day);
  result.shoes = s ? toItem(s) : { name: "Comfortable shoes", category: "shoes" };

  const acc = pick(accessories, day);
  if (acc) result.accessories = [toItem(acc)];

  if (!result.top && !result.dress) result.top = { name: "Versatile top", category: "tops" };
  if (!result.bottom && !result.dress) result.bottom = { name: "Comfortable trousers", category: "bottoms" };

  return result;
}

function generatePackingList(tripType: string, nights: number, luggage: string): PackingItem[] {
  const items: Omit<PackingItem, "id" | "packed">[] = [
    { name: "Underwear", category: "Essentials" },
    { name: "Socks", category: "Essentials" },
    { name: "Pyjamas / sleepwear", category: "Essentials" },
    { name: "Toiletries bag", category: "Essentials" },
    { name: "Phone charger", category: "Tech" },
    { name: "Travel adapter", category: "Tech" },
    { name: "Passport / ID", category: "Documents" },
    { name: "Travel insurance", category: "Documents" },
  ];

  if (tripType === "beach") {
    items.push(
      { name: "Swimwear", category: "Beach" },
      { name: "Sunscreen", category: "Beach" },
      { name: "Sunglasses", category: "Accessories" },
      { name: "Beach bag", category: "Beach" },
      { name: "Flip flops", category: "Shoes" },
    );
  }

  if (tripType === "business") {
    items.push(
      { name: "Smart shoes", category: "Shoes" },
      { name: "Business cards", category: "Documents" },
      { name: "Laptop + charger", category: "Tech" },
    );
  }

  if (tripType === "adventure") {
    items.push(
      { name: "Walking boots", category: "Shoes" },
      { name: "Rain jacket", category: "Outerwear" },
      { name: "Backpack", category: "Bags" },
      { name: "First aid kit", category: "Essentials" },
    );
  }

  if (nights > 3) {
    items.push({ name: "Laundry bag", category: "Essentials" });
  }

  if (luggage === "carry_on") {
    items.push({ name: "100ml liquids bag", category: "Essentials" });
  }

  return items.map((item) => ({
    ...item,
    id: generateId(),
    packed: false,
  }));
}

export default function NewTripPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [luggage, setLuggage] = useState("");
  const [generating, setGenerating] = useState(false);

  const canCreate = destination && startDate && endDate && tripType && luggage;

  const handleCreate = () => {
    if (!canCreate) return;
    setGenerating(true);

    setTimeout(() => {
      const state = loadState();
      const userId = state.userProfile?.id || generateId();
      const now = new Date().toISOString();

      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Generate day-by-day outfits
      const dayOutfits: DayOutfit[] = [];
      for (let i = 0; i <= nights; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const outfitData = generateTripOutfit(state.wardrobeItems, i);

        const outfit: OutfitPlan = {
          id: generateId(),
          userId,
          date: date.toISOString().split("T")[0],
          mood: "relaxed",
          context: tripType.replace("_", " "),
          weatherCategory: "mild",
          top: outfitData.top || { name: "Versatile top", category: "tops" },
          bottom: outfitData.bottom,
          dress: outfitData.dress,
          shoes: outfitData.shoes || { name: "Comfortable shoes", category: "shoes" },
          accessories: outfitData.accessories,
          createdAt: now,
        };

        dayOutfits.push({ day: i, date: date.toISOString().split("T")[0], outfit });
      }

      // Generate packing list
      const packingChecklist = generatePackingList(tripType, nights, luggage);

      const plan: TravelPlan = {
        id: generateId(),
        userId,
        destination,
        startDate,
        endDate,
        tripType,
        luggageType: luggage,
        dayOutfits,
        packingChecklist,
        createdAt: now,
        updatedAt: now,
      };

      addTravelPlan(plan);
      router.push(`/travel/${plan.id}`);
    }, 2000);
  };

  const today = new Date().toISOString().split("T")[0];

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
        <h1 className="text-2xl font-bold text-stone-900">Plan a trip</h1>
        <p className="text-stone-500 mt-1 text-sm">Create your travel capsule wardrobe</p>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-75" />
            <div className="relative w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-4xl">
              ✈️
            </div>
          </div>
          <p className="text-stone-900 font-semibold text-lg">Planning your trip...</p>
          <p className="text-stone-500 text-sm mt-2">Creating day-by-day outfits and packing list</p>
        </div>
      ) : (
        <div className="px-6 pt-6 space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, Barcelona, New York"
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Departure</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Return</label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white text-sm"
              />
            </div>
          </div>

          {/* Trip type */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-3">Trip type</label>
            <div className="grid grid-cols-3 gap-2">
              {TRIP_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTripType(type.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${
                    tripType === type.value
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "bg-white border-stone-200 text-stone-600 hover:border-blue-200"
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Luggage */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-3">Luggage type</label>
            <div className="grid grid-cols-3 gap-2">
              {LUGGAGE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setLuggage(type.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all ${
                    luggage === type.value
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "bg-white border-stone-200 text-stone-600 hover:border-blue-200"
                  }`}
                >
                  <span className="text-xl">{type.emoji}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {canCreate && startDate && endDate && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-blue-800 text-sm">
                ✈️ We&apos;ll create{" "}
                <strong>
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day outfits
                </strong>{" "}
                and a personalised packing list for your trip to <strong>{destination}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {!generating && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create travel capsule ✈️
          </Button>
        </div>
      )}
    </div>
  );
}
