"use client";

import type {
  AppState,
  UserProfile,
  BodyProfile,
  ToneProfile,
  WardrobeItem,
  StyleGap,
  SuggestedPiece,
  OutfitPlan,
  FeedbackEntry,
  TravelPlan,
  StylistBooking,
} from "./types";

const STORAGE_KEY = "stylista_app_state";

const defaultState: AppState = {
  userProfile: null,
  bodyProfile: null,
  toneProfile: null,
  wardrobeItems: [],
  styleGaps: [],
  suggestedPieces: [],
  outfitPlans: [],
  feedbackEntries: [],
  travelPlans: [],
  stylistBookings: [],
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function saveState(state: Partial<AppState>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadState();
    const next = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // silently fail
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Typed helpers ────────────────────────────────────────────────────────────

export function saveUserProfile(profile: UserProfile): void {
  saveState({ userProfile: profile });
}

export function saveBodyProfile(profile: BodyProfile): void {
  saveState({ bodyProfile: profile });
}

export function saveToneProfile(profile: ToneProfile): void {
  saveState({ toneProfile: profile });
}

export function addWardrobeItem(item: WardrobeItem): void {
  const state = loadState();
  saveState({ wardrobeItems: [...state.wardrobeItems, item] });
}

export function updateWardrobeItem(item: WardrobeItem): void {
  const state = loadState();
  saveState({
    wardrobeItems: state.wardrobeItems.map((w) => (w.id === item.id ? item : w)),
  });
}

export function deleteWardrobeItem(id: string): void {
  const state = loadState();
  saveState({ wardrobeItems: state.wardrobeItems.filter((w) => w.id !== id) });
}

export function saveStyleGaps(gaps: StyleGap[]): void {
  saveState({ styleGaps: gaps });
}

export function saveSuggestedPieces(pieces: SuggestedPiece[]): void {
  saveState({ suggestedPieces: pieces });
}

export function addOutfitPlan(plan: OutfitPlan): void {
  const state = loadState();
  saveState({ outfitPlans: [...state.outfitPlans, plan] });
}

export function updateOutfitPlan(plan: OutfitPlan): void {
  const state = loadState();
  saveState({
    outfitPlans: state.outfitPlans.map((o) => (o.id === plan.id ? plan : o)),
  });
}

export function addFeedbackEntry(entry: FeedbackEntry): void {
  const state = loadState();
  saveState({ feedbackEntries: [...state.feedbackEntries, entry] });
}

export function addTravelPlan(plan: TravelPlan): void {
  const state = loadState();
  saveState({ travelPlans: [...state.travelPlans, plan] });
}

export function updateTravelPlan(plan: TravelPlan): void {
  const state = loadState();
  saveState({
    travelPlans: state.travelPlans.map((t) => (t.id === plan.id ? plan : t)),
  });
}

export function addStylistBooking(booking: StylistBooking): void {
  const state = loadState();
  saveState({ stylistBookings: [...state.stylistBookings, booking] });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
