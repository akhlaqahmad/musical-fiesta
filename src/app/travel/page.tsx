"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState } from "@/lib/storage";
import type { TravelPlan } from "@/lib/types";

export default function TravelPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setPlans([...state.travelPlans].reverse());
  }, [router]);

  const upcoming = plans.filter((p) => new Date(p.startDate) >= new Date());
  const past = plans.filter((p) => new Date(p.startDate) < new Date());

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Travel</h1>
            <p className="text-stone-500 mt-1 text-sm">Pack smart, travel light</p>
          </div>
          <Link
            href="/travel/new"
            className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* New trip CTA */}
        <Link
          href="/travel/new"
          className="block bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Plan a trip</p>
              <h2 className="text-xl font-bold">Create travel capsule</h2>
              <p className="text-blue-200 text-sm mt-1">Day-by-day outfits + packing list</p>
            </div>
            <div className="text-4xl">✈️</div>
          </div>
          <div className="mt-4 text-blue-200 text-sm font-medium">Start planning →</div>
        </Link>

        {/* Upcoming trips */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-stone-700 mb-3">Upcoming trips</h2>
            <div className="space-y-3">
              {upcoming.map((plan) => (
                <TripCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}

        {/* Past trips */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-stone-700 mb-3">Past trips</h2>
            <div className="space-y-3">
              {past.map((plan) => (
                <TripCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>
        )}

        {plans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✈️</div>
            <p className="text-stone-600 font-medium">No trips planned yet</p>
            <p className="text-stone-400 text-sm mt-1">Create your first travel capsule above</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ plan }: { plan: TravelPlan }) {
  const router = useRouter();
  const nights = Math.ceil(
    (new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const packed = plan.packingChecklist.filter((i) => i.packed).length;
  const total = plan.packingChecklist.length;

  return (
    <button
      onClick={() => router.push(`/travel/${plan.id}`)}
      className="w-full bg-white rounded-2xl p-4 border border-stone-100 hover:border-rose-200 transition-colors text-left"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
          ✈️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900">{plan.destination}</h3>
          <p className="text-stone-500 text-xs mt-0.5">
            {new Date(plan.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {" – "}
            {new Date(plan.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {" · "}{nights} night{nights !== 1 ? "s" : ""}
          </p>
          <p className="text-stone-400 text-xs mt-0.5 capitalize">{plan.tripType}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {total > 0 && (
            <div className="text-xs text-stone-500">{packed}/{total} packed</div>
          )}
          <svg className="w-4 h-4 text-stone-300 mt-1 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}
