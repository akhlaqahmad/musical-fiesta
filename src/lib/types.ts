// ─── Core Data Models ───────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  ageRange: string;
  genderIdentity: string;
  eyeColour: string;
  hairColour: string;
  tanningBehaviour: string;
  lovedFeatures: string[];
  downplayFeatures: string[];
  colourPreferences: string[];
  colourDislikes: string[];
  styleFamiliarity: string;
  preferredStyles: string[];
  lifestyleHabits: string[];
  budgetRange: string;
  settings: UserSettings;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  weatherAware: boolean;
  nightBeforeReminders: boolean;
  moodTracking: boolean;
  outfeedbackPrompts: boolean;
  locationBased: boolean;
  generateAvatar: boolean;
}

export interface BodyProfile {
  id: string;
  userId: string;
  // Raw measurements (cm)
  bust?: number;
  waist?: number;
  hips?: number;
  height?: number;
  shoulderWidth?: number;
  // Derived guidance (never labels)
  flatteringSilhouettes: string[];
  layeringGuidance: string[];
  fabricSuggestions: string[];
  patternSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ToneProfile {
  id: string;
  userId: string;
  toneCategory: "warm" | "cool" | "neutral";
  colourPalette: string[];
  guidance: string;
  createdAt: string;
  updatedAt: string;
}

export type WardrobeTag = "keep" | "review" | "donate";
export type WardrobeCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "accessories"
  | "activewear"
  | "formalwear"
  | "swimwear"
  | "underwear";

export interface WardrobeItem {
  id: string;
  userId: string;
  category: WardrobeCategory;
  name: string;
  imageUrl?: string;
  brand?: string;
  notes?: string;
  tag: WardrobeTag;
  isFavourite: boolean;
  hiddenFromSuggestions: boolean;
  colours: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StyleGap {
  id: string;
  userId: string;
  category: WardrobeCategory;
  description: string;
  reason: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export interface SuggestedPiece {
  id: string;
  userId: string;
  name: string;
  category: WardrobeCategory;
  description: string;
  imageUrl?: string;
  priceRange: string;
  reason: string;
  createdAt: string;
}

export interface OutfitItem {
  wardrobeItemId?: string;
  name: string;
  category: WardrobeCategory;
  imageUrl?: string;
  colour?: string;
}

export interface OutfitPlan {
  id: string;
  userId: string;
  date: string;
  mood: string;
  context: string;
  weatherCategory: string;
  top: OutfitItem;
  bottom?: OutfitItem;
  dress?: OutfitItem;
  shoes: OutfitItem;
  accessories?: OutfitItem[];
  feedbackScore?: number;
  feedbackNotes?: string;
  createdAt: string;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  outfitPlanId: string;
  score: number;
  sentiment: "dislike" | "neutral" | "like" | "love";
  whatWorked?: string[];
  whatDidntWork?: string[];
  notes?: string;
  createdAt: string;
}

export interface TravelPlan {
  id: string;
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  luggageType: string;
  dayOutfits: DayOutfit[];
  packingChecklist: PackingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DayOutfit {
  day: number;
  date: string;
  outfit: OutfitPlan;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

export interface Stylist {
  id: string;
  name: string;
  specialty: string[];
  bio: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  pricing: string;
  pricePerSession: number;
  availability: string[];
  location: string;
}

export interface StylistBooking {
  id: string;
  userId: string;
  stylistId: string;
  stylistName: string;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
  paymentStatus: "pending" | "simulated_paid";
  createdAt: string;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  userProfile: UserProfile | null;
  bodyProfile: BodyProfile | null;
  toneProfile: ToneProfile | null;
  wardrobeItems: WardrobeItem[];
  styleGaps: StyleGap[];
  suggestedPieces: SuggestedPiece[];
  outfitPlans: OutfitPlan[];
  feedbackEntries: FeedbackEntry[];
  travelPlans: TravelPlan[];
  stylistBookings: StylistBooking[];
}
