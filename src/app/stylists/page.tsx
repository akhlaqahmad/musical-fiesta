"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState } from "@/lib/storage";
import { MOCK_STYLISTS } from "@/lib/mockData";
import type { StylistBooking } from "@/lib/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400" : "text-stone-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function StylistsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<StylistBooking[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const state = loadState();
    if (!state.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setBookings(state.stylistBookings);
  }, [router]);

  const specialties = ["all", "Colour analysis", "Workwear", "Capsule wardrobes", "Body-positive styling", "Travel capsules"];

  const filtered = MOCK_STYLISTS.filter((s) =>
    filter === "all" || s.specialty.some((sp) => sp.toLowerCase().includes(filter.toLowerCase()))
  );

  const myBooking = bookings.find((b) => b.status === "confirmed" || b.status === "pending");

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-4 border-b border-stone-100">
        <h1 className="text-2xl font-bold text-stone-900">Stylists</h1>
        <p className="text-stone-500 mt-1 text-sm">Work with a professional stylist</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Active booking banner */}
        {myBooking && (
          <Link
            href={`/stylists/booking/${myBooking.id}`}
            className="block bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-5 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">👩‍🎨</div>
              <div className="flex-1">
                <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">Upcoming session</p>
                <h3 className="font-bold">{myBooking.stylistName}</h3>
                <p className="text-purple-200 text-sm">
                  {new Date(myBooking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {myBooking.time}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                myBooking.status === "confirmed" ? "bg-green-400/30 text-green-100" : "bg-amber-400/30 text-amber-100"
              }`}>
                {myBooking.status}
              </span>
            </div>
          </Link>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setFilter(spec)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === spec
                  ? "bg-stone-900 border-stone-900 text-white"
                  : "bg-white border-stone-200 text-stone-600"
              }`}
            >
              {spec === "all" ? "All stylists" : spec}
            </button>
          ))}
        </div>

        {/* Stylist cards */}
        <div className="space-y-4">
          {filtered.map((stylist) => {
            const hasBooking = bookings.some((b) => b.stylistId === stylist.id);
            return (
              <Link
                key={stylist.id}
                href={`/stylists/${stylist.id}`}
                className="block bg-white rounded-3xl border border-stone-100 overflow-hidden hover:border-rose-200 transition-colors"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-100 to-stone-50 px-5 py-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-200 to-purple-200 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                    {stylist.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900">{stylist.name}</h3>
                      {hasBooking && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Booked</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={stylist.rating} />
                      <span className="text-xs text-stone-500">{stylist.rating} ({stylist.reviewCount})</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{stylist.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-stone-900 text-sm">{stylist.pricing}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">{stylist.bio}</p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {stylist.specialty.map((spec) => (
                      <span key={spec} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-stone-400">Available:</span>
                    <div className="flex gap-1">
                      {stylist.availability.map((day) => (
                        <span key={day} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
