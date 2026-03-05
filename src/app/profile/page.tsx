"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadState, clearState } from "@/lib/storage";
import type { AppState } from "@/lib/types";

const TONE_INFO = {
  warm: { label: "Warm tones", emoji: "🌅", bg: "from-amber-400 to-orange-400" },
  cool: { label: "Cool tones", emoji: "🌊", bg: "from-blue-400 to-indigo-400" },
  neutral: { label: "Neutral tones", emoji: "🌿", bg: "from-stone-400 to-stone-500" },
};

export default function ProfilePage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (!s.userProfile?.onboardingCompleted) {
      router.replace("/onboarding");
      return;
    }
    setState(s);
  }, [router]);

  const handleReset = () => {
    clearState();
    router.replace("/onboarding");
  };

  if (!state) return null;

  const { userProfile, bodyProfile, toneProfile, wardrobeItems, outfitPlans, feedbackEntries, travelPlans, stylistBookings } = state;

  const avgFeedback = feedbackEntries.length > 0
    ? Math.round(feedbackEntries.reduce((sum, e) => sum + e.score, 0) / feedbackEntries.length)
    : null;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-2xl font-bold text-rose-600">
            {(userProfile?.name?.[0] || "S").toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">{userProfile?.name || "My Profile"}</h1>
            {userProfile?.email && <p className="text-stone-500 text-sm">{userProfile.email}</p>}
            <p className="text-stone-400 text-xs mt-0.5">{userProfile?.ageRange} · {userProfile?.genderIdentity}</p>
          </div>
        </div>

        {/* Tone badge */}
        {toneProfile && (
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${TONE_INFO[toneProfile.toneCategory].bg} text-white text-xs font-medium`}>
            <span>{TONE_INFO[toneProfile.toneCategory].emoji}</span>
            {TONE_INFO[toneProfile.toneCategory].label}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <div className="text-2xl font-bold text-stone-900">{wardrobeItems.length}</div>
            <div className="text-xs text-stone-500 mt-1">Wardrobe items</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <div className="text-2xl font-bold text-stone-900">{outfitPlans.length}</div>
            <div className="text-xs text-stone-500 mt-1">Outfits generated</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <div className="text-2xl font-bold text-stone-900">{travelPlans.length}</div>
            <div className="text-xs text-stone-500 mt-1">Trips planned</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100">
            <div className="text-2xl font-bold text-stone-900">
              {avgFeedback !== null ? `${avgFeedback}%` : "—"}
            </div>
            <div className="text-xs text-stone-500 mt-1">Avg outfit score</div>
          </div>
        </div>

        {/* Colour palette */}
        {toneProfile && (
          <div className="bg-white rounded-3xl p-5 border border-stone-100">
            <h2 className="font-semibold text-stone-900 mb-3">Your colour palette</h2>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {toneProfile.colourPalette.slice(0, 12).map((colour, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl shadow-sm"
                  style={{ backgroundColor: colour }}
                />
              ))}
            </div>
            <p className="text-stone-500 text-xs leading-relaxed">{toneProfile.guidance}</p>
          </div>
        )}

        {/* Body guidance */}
        {bodyProfile && bodyProfile.flatteringSilhouettes.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-stone-100">
            <h2 className="font-semibold text-stone-900 mb-3">Your styling guidance</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Flattering silhouettes</h3>
                <ul className="space-y-1.5">
                  {bodyProfile.flatteringSilhouettes.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="text-rose-400 mt-0.5 flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Layering tips</h3>
                <ul className="space-y-1.5">
                  {bodyProfile.layeringGuidance.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="text-rose-400 mt-0.5 flex-shrink-0">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Style profile */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <h2 className="font-semibold text-stone-900 mb-3">Style profile</h2>
          <div className="space-y-3">
            {userProfile?.preferredStyles && userProfile.preferredStyles.length > 0 && (
              <div>
                <p className="text-xs text-stone-500 mb-2">Preferred styles</p>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.preferredStyles.map((s) => (
                    <span key={s} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {userProfile?.lifestyleHabits && userProfile.lifestyleHabits.length > 0 && (
              <div>
                <p className="text-xs text-stone-500 mb-2">Lifestyle</p>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.lifestyleHabits.map((s) => (
                    <span key={s} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {userProfile?.budgetRange && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Budget range</span>
                <span className="text-sm font-medium text-stone-900 capitalize">{userProfile.budgetRange}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bookings */}
        {stylistBookings.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-stone-100">
            <h2 className="font-semibold text-stone-900 mb-3">Stylist bookings</h2>
            <div className="space-y-3">
              {stylistBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{booking.stylistName}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {booking.time}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                    booking.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-stone-100 text-stone-600"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <h2 className="font-semibold text-stone-900 mb-3">Settings</h2>
          <div className="space-y-2">
            {[
              { key: "weatherAware", label: "Weather-aware planning" },
              { key: "nightBeforeReminders", label: "Night-before reminders" },
              { key: "moodTracking", label: "Mood tracking" },
              { key: "outfeedbackPrompts", label: "Outfit feedback prompts" },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-1">
                <span className="text-sm text-stone-700">{setting.label}</span>
                <div className={`w-8 h-4 rounded-full ${
                  userProfile?.settings[setting.key as keyof typeof userProfile.settings]
                    ? "bg-rose-500" : "bg-stone-200"
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <h2 className="font-semibold text-stone-900 mb-3">Account</h2>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="text-sm text-red-500 font-medium"
            >
              Reset all data & start over
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-stone-600">This will delete all your data including your wardrobe, outfits, and profile. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
