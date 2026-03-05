"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { loadState, updateOutfitPlan, addFeedbackEntry, generateId } from "@/lib/storage";
import type { OutfitPlan, FeedbackEntry } from "@/lib/types";

const CATEGORY_ICONS: Record<string, string> = {
  tops: "👕", bottoms: "👖", dresses: "👗", outerwear: "🧥",
  shoes: "👟", accessories: "👜", activewear: "🏃", formalwear: "🎩",
};

const WHAT_WORKED = [
  "Colour combination", "Fit and silhouette", "Comfort level",
  "Appropriate for occasion", "Felt confident", "Easy to put together",
];

const WHAT_DIDNT = [
  "Colours clashed", "Didn't feel comfortable", "Too casual",
  "Too formal", "Didn't feel like me", "Hard to style",
];

function scoreToSentiment(score: number): FeedbackEntry["sentiment"] {
  if (score < 25) return "dislike";
  if (score < 50) return "neutral";
  if (score < 75) return "like";
  return "love";
}

const SENTIMENT_INFO = {
  dislike: { emoji: "😕", label: "Not for me", colour: "text-red-500" },
  neutral: { emoji: "😐", label: "It was okay", colour: "text-stone-500" },
  like: { emoji: "🙂", label: "Liked it", colour: "text-blue-500" },
  love: { emoji: "😍", label: "Loved it!", colour: "text-rose-500" },
};

export default function OutfitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [outfit, setOutfit] = useState<OutfitPlan | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState(70);
  const [whatWorked, setWhatWorked] = useState<string[]>([]);
  const [whatDidnt, setWhatDidnt] = useState<string[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    const state = loadState();
    const found = state.outfitPlans.find((o) => o.id === id);
    if (found) {
      setOutfit(found);
      if (found.feedbackScore !== undefined) {
        setFeedbackScore(found.feedbackScore);
        setFeedbackSaved(true);
      }
    }
  }, [id]);

  const sentiment = scoreToSentiment(feedbackScore);
  const sentimentInfo = SENTIMENT_INFO[sentiment];

  const handleSaveFeedback = () => {
    if (!outfit) return;
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    const entry: FeedbackEntry = {
      id: generateId(),
      userId,
      outfitPlanId: outfit.id,
      score: feedbackScore,
      sentiment,
      whatWorked: whatWorked.length > 0 ? whatWorked : undefined,
      whatDidntWork: whatDidnt.length > 0 ? whatDidnt : undefined,
      notes: feedbackNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    addFeedbackEntry(entry);

    const updated = { ...outfit, feedbackScore, feedbackNotes: feedbackNotes || undefined };
    updateOutfitPlan(updated);
    setOutfit(updated);
    setFeedbackSaved(true);
    setShowFeedback(false);
  };

  if (!outfit) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Outfit not found</p>
      </div>
    );
  }

  const outfitItems = [
    outfit.dress ? { label: "Dress", item: outfit.dress } : null,
    !outfit.dress && outfit.top ? { label: "Top", item: outfit.top } : null,
    !outfit.dress && outfit.bottom ? { label: "Bottom", item: outfit.bottom } : null,
    { label: "Shoes", item: outfit.shoes },
    ...(outfit.accessories?.map((acc) => ({ label: "Layer / Accessory", item: acc })) || []),
  ].filter(Boolean) as { label: string; item: NonNullable<OutfitPlan["top"]> }[];

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{outfit.context}</h1>
            <p className="text-stone-500 mt-1 text-sm">
              {new Date(outfit.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          {feedbackSaved && outfit.feedbackScore !== undefined && (
            <div className="text-2xl">
              {outfit.feedbackScore >= 75 ? "😍" : outfit.feedbackScore >= 50 ? "🙂" : outfit.feedbackScore >= 25 ? "😐" : "😕"}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">{outfit.mood}</span>
          <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">{outfit.weatherCategory}</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Outfit items */}
        <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
          {outfitItems.map(({ label, item }, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-stone-50" : ""}`}>
              <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-2xl flex-shrink-0">
                {CATEGORY_ICONS[item.category] || "👗"}
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-stone-900 font-semibold text-sm mt-0.5">{item.name}</p>
                {item.colour && <p className="text-stone-400 text-xs mt-0.5 capitalize">{item.colour}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback section */}
        {!feedbackSaved ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-5">
            <h3 className="font-semibold text-stone-900 mb-1">How did this outfit feel?</h3>
            <p className="text-stone-500 text-xs mb-4">Your feedback helps us improve future suggestions</p>

            {!showFeedback ? (
              <Button variant="secondary" size="md" fullWidth onClick={() => setShowFeedback(true)}>
                Rate this outfit
              </Button>
            ) : (
              <div className="space-y-5">
                {/* Score slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{sentimentInfo.emoji}</span>
                    <span className={`font-semibold text-sm ${sentimentInfo.colour}`}>{sentimentInfo.label}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={feedbackScore}
                    onChange={(e) => setFeedbackScore(parseInt(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex justify-between text-xs text-stone-400 mt-1">
                    <span>Not for me</span>
                    <span>Loved it!</span>
                  </div>
                </div>

                {/* What worked */}
                {feedbackScore >= 50 && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">What worked well?</p>
                    <div className="flex flex-wrap gap-2">
                      {WHAT_WORKED.map((w) => (
                        <button
                          key={w}
                          onClick={() => setWhatWorked((prev) =>
                            prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
                          )}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            whatWorked.includes(w)
                              ? "bg-green-500 border-green-500 text-white"
                              : "bg-white border-stone-200 text-stone-600"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* What didn't work */}
                {feedbackScore < 50 && (
                  <div>
                    <p className="text-sm font-medium text-stone-700 mb-2">What didn&apos;t work?</p>
                    <div className="flex flex-wrap gap-2">
                      {WHAT_DIDNT.map((w) => (
                        <button
                          key={w}
                          onClick={() => setWhatDidnt((prev) =>
                            prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
                          )}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            whatDidnt.includes(w)
                              ? "bg-red-500 border-red-500 text-white"
                              : "bg-white border-stone-200 text-stone-600"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <textarea
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Any other thoughts? (optional)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white resize-none text-sm"
                  />
                </div>

                <Button variant="primary" size="md" fullWidth onClick={handleSaveFeedback}>
                  Save feedback
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <p className="text-green-800 text-sm">
              ✓ Feedback saved! We&apos;ll use this to improve your future outfit suggestions.
            </p>
            <button
              onClick={() => { setFeedbackSaved(false); setShowFeedback(true); }}
              className="text-green-700 text-xs font-medium mt-1 underline"
            >
              Edit feedback
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push("/outfits/generate")}
        >
          Generate a new outfit
        </Button>
      </div>
    </div>
  );
}
