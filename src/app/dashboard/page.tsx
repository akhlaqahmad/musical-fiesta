"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState } from "@/lib/storage";
import type { AppState } from "@/lib/types";

const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
}

const TONE_COLOURS = {
  warm: "from-amber-400 to-orange-400",
  cool: "from-blue-400 to-indigo-400",
  neutral: "from-stone-400 to-stone-500",
};

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    const s = loadState();
    if (!s.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setState(s);
  }, [router]);

  if (!state) return null;

  const { userProfile, toneProfile, wardrobeItems, outfitPlans, travelPlans, stylistBookings } = state;
  const firstName = userProfile?.name?.split(" ")[0] || "there";
  const todayOutfit = outfitPlans.find((o) => o.date === new Date().toISOString().split("T")[0]);
  const upcomingTrip = travelPlans.find((t) => new Date(t.startDate) >= new Date());
  const pendingBooking = stylistBookings.find((b) => b.status === "confirmed" || b.status === "pending");

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-sm">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-stone-900">{firstName} ✨</h1>
          </div>
          <Link href="/profile" className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="text-rose-600 font-semibold text-sm">
              {(userProfile?.name?.[0] || "S").toUpperCase()}
            </span>
          </Link>
        </div>

        {/* Tone badge */}
        {toneProfile && (
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${TONE_COLOURS[toneProfile.toneCategory]} text-white text-xs font-medium`}>
            <span>{toneProfile.toneCategory === "warm" ? "🌅" : toneProfile.toneCategory === "cool" ? "🌊" : "🌿"}</span>
            {toneProfile.toneCategory.charAt(0).toUpperCase() + toneProfile.toneCategory.slice(1)} tones
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Today's outfit CTA */}
        <div
          className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl p-6 text-white cursor-pointer shadow-lg"
          onClick={() => router.push("/outfits")}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-rose-200 text-xs font-medium uppercase tracking-wide mb-1">Today&apos;s look</p>
              {todayOutfit ? (
                <>
                  <h2 className="text-xl font-bold mb-1">{todayOutfit.context}</h2>
                  <p className="text-rose-200 text-sm">{todayOutfit.mood} mood · {todayOutfit.weatherCategory}</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-1">Generate today&apos;s outfit</h2>
                  <p className="text-rose-200 text-sm">Get a personalised look in seconds</p>
                </>
              )}
            </div>
            <div className="text-4xl">
              {todayOutfit ? "✨" : "👗"}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-rose-200 text-sm font-medium">
            {todayOutfit ? "View outfit" : "Get dressed"} →
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/wardrobe" className="bg-white rounded-2xl p-4 text-center border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="text-2xl font-bold text-stone-900">{wardrobeItems.length}</div>
            <div className="text-xs text-stone-500 mt-1">Wardrobe items</div>
          </Link>
          <Link href="/outfits" className="bg-white rounded-2xl p-4 text-center border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="text-2xl font-bold text-stone-900">{outfitPlans.length}</div>
            <div className="text-xs text-stone-500 mt-1">Outfits created</div>
          </Link>
          <Link href="/travel" className="bg-white rounded-2xl p-4 text-center border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="text-2xl font-bold text-stone-900">{travelPlans.length}</div>
            <div className="text-xs text-stone-500 mt-1">Trips planned</div>
          </Link>
        </div>

        {/* Plan tomorrow */}
        <Link href="/outfits/tomorrow" className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors">
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

        {/* Upcoming trip */}
        {upcomingTrip ? (
          <Link href="/travel" className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">✈️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 text-sm">Trip to {upcomingTrip.destination}</h3>
                <p className="text-stone-500 text-xs mt-0.5">
                  {new Date(upcomingTrip.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {upcomingTrip.tripType}
                </p>
              </div>
              <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ) : (
          <Link href="/travel/new" className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">✈️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 text-sm">Plan a trip</h3>
                <p className="text-stone-500 text-xs mt-0.5">Pack smart with a travel capsule</p>
              </div>
              <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Stylist booking */}
        {pendingBooking ? (
          <Link href="/stylists" className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">👩‍🎨</div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 text-sm">Session with {pendingBooking.stylistName}</h3>
                <p className="text-stone-500 text-xs mt-0.5">
                  {new Date(pendingBooking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {pendingBooking.time}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                pendingBooking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {pendingBooking.status}
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/stylists" className="block bg-white rounded-3xl p-5 border border-stone-100 hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">👩‍🎨</div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 text-sm">Book a stylist</h3>
                <p className="text-stone-500 text-xs mt-0.5">Work with a professional stylist</p>
              </div>
              <svg className="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}

        {/* Wardrobe gaps */}
        {state.styleGaps.length > 0 && (
          <Link href="/wardrobe/gaps" className="block bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🔍</div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{state.styleGaps.length} wardrobe gaps identified</h3>
                <p className="text-stone-400 text-xs mt-0.5">See what could unlock more outfits</p>
              </div>
              <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
