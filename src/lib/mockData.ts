import type { Stylist, WardrobeItem, SuggestedPiece, StyleGap } from "./types";

// ─── Mock Stylists ────────────────────────────────────────────────────────────

export const MOCK_STYLISTS: Stylist[] = [
  {
    id: "stylist-1",
    name: "Amara Osei",
    specialty: ["Body-positive styling", "Workwear", "Capsule wardrobes"],
    bio: "Amara specialises in helping clients build intentional wardrobes that celebrate their unique shape. With 8 years of experience, she focuses on sustainable fashion and versatile pieces.",
    imageUrl: "/stylists/amara.jpg",
    rating: 4.9,
    reviewCount: 127,
    pricing: "£120 / session",
    pricePerSession: 120,
    availability: ["Mon", "Tue", "Thu", "Fri"],
    location: "London, UK",
  },
  {
    id: "stylist-2",
    name: "Priya Sharma",
    specialty: ["Colour analysis", "Occasion wear", "Personal shopping"],
    bio: "Priya is a certified colour analyst and personal stylist who helps clients discover their most flattering palette. She offers virtual and in-person sessions.",
    imageUrl: "/stylists/priya.jpg",
    rating: 4.8,
    reviewCount: 89,
    pricing: "£95 / session",
    pricePerSession: 95,
    availability: ["Wed", "Thu", "Fri", "Sat"],
    location: "Manchester, UK",
  },
  {
    id: "stylist-3",
    name: "Lena Müller",
    specialty: ["Minimalist style", "Travel capsules", "Sustainable fashion"],
    bio: "Lena helps busy professionals create effortless, minimal wardrobes. Her approach focuses on quality over quantity and building outfits that work across multiple contexts.",
    imageUrl: "/stylists/lena.jpg",
    rating: 4.7,
    reviewCount: 64,
    pricing: "£85 / session",
    pricePerSession: 85,
    availability: ["Mon", "Wed", "Fri"],
    location: "Virtual only",
  },
  {
    id: "stylist-4",
    name: "Jade Williams",
    specialty: ["Maternity & postpartum", "Body transitions", "Confidence styling"],
    bio: "Jade specialises in supporting clients through body changes with compassion and expertise. She creates practical, beautiful wardrobes for every stage of life.",
    imageUrl: "/stylists/jade.jpg",
    rating: 5.0,
    reviewCount: 43,
    pricing: "£110 / session",
    pricePerSession: 110,
    availability: ["Tue", "Wed", "Sat", "Sun"],
    location: "Birmingham, UK",
  },
];

// ─── Mock Wardrobe Items ──────────────────────────────────────────────────────

export const MOCK_WARDROBE_ITEMS: Omit<WardrobeItem, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  {
    category: "tops",
    name: "White linen shirt",
    brand: "Arket",
    colours: ["white"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
    notes: "Great for summer",
  },
  {
    category: "tops",
    name: "Navy striped Breton",
    brand: "Saint James",
    colours: ["navy", "white"],
    tag: "keep",
    isFavourite: false,
    hiddenFromSuggestions: false,
  },
  {
    category: "tops",
    name: "Cream silk blouse",
    colours: ["cream"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "bottoms",
    name: "Dark wash straight jeans",
    brand: "Levi's",
    colours: ["dark blue"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "bottoms",
    name: "Camel wide-leg trousers",
    colours: ["camel"],
    tag: "keep",
    isFavourite: false,
    hiddenFromSuggestions: false,
  },
  {
    category: "bottoms",
    name: "Black midi skirt",
    colours: ["black"],
    tag: "review",
    isFavourite: false,
    hiddenFromSuggestions: false,
    notes: "Needs hemming",
  },
  {
    category: "dresses",
    name: "Floral wrap dress",
    colours: ["multicolour"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "outerwear",
    name: "Camel wool coat",
    brand: "Cos",
    colours: ["camel"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "shoes",
    name: "White leather trainers",
    brand: "Veja",
    colours: ["white"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "shoes",
    name: "Tan leather loafers",
    colours: ["tan"],
    tag: "keep",
    isFavourite: false,
    hiddenFromSuggestions: false,
  },
  {
    category: "accessories",
    name: "Gold hoop earrings",
    colours: ["gold"],
    tag: "keep",
    isFavourite: true,
    hiddenFromSuggestions: false,
  },
  {
    category: "accessories",
    name: "Tan leather belt",
    colours: ["tan"],
    tag: "keep",
    isFavourite: false,
    hiddenFromSuggestions: false,
  },
];

// ─── Mock Style Gaps ──────────────────────────────────────────────────────────

export const MOCK_STYLE_GAPS: Omit<StyleGap, "id" | "userId" | "createdAt">[] = [
  {
    category: "outerwear",
    description: "Lightweight transitional jacket",
    reason: "Your wardrobe has a heavy coat but lacks a versatile layer for mild weather.",
    priority: "high",
  },
  {
    category: "shoes",
    description: "Heeled or dressy shoe option",
    reason: "You have casual footwear covered but nothing for elevated occasions.",
    priority: "high",
  },
  {
    category: "tops",
    description: "Fitted knit or jumper",
    reason: "Adding a quality knit would extend your outfit combinations significantly.",
    priority: "medium",
  },
  {
    category: "accessories",
    description: "Structured handbag",
    reason: "A quality bag in a neutral tone would elevate many of your existing outfits.",
    priority: "medium",
  },
];

// ─── Mock Suggested Pieces ────────────────────────────────────────────────────

export const MOCK_SUGGESTED_PIECES: Omit<SuggestedPiece, "id" | "userId" | "createdAt">[] = [
  {
    name: "Tailored blazer in camel or navy",
    category: "outerwear",
    description: "A well-cut blazer is one of the most versatile pieces you can own. It works over jeans, dresses, and trousers alike.",
    priceRange: "£80–£200",
    reason: "Fills your transitional layering gap and complements your existing camel and navy pieces.",
  },
  {
    name: "Block-heel ankle boots",
    category: "shoes",
    description: "A comfortable heel that works from desk to dinner. Look for a neutral tone like tan, black, or cognac.",
    priceRange: "£60–£150",
    reason: "Adds a dressier option to your footwear collection without sacrificing comfort.",
  },
  {
    name: "Merino wool crew-neck jumper",
    category: "tops",
    description: "A fine-knit merino in a neutral or warm tone. Lightweight enough to layer, warm enough to wear alone.",
    priceRange: "£40–£120",
    reason: "Extends your outfit combinations and adds warmth without bulk.",
  },
  {
    name: "Structured tote bag",
    category: "accessories",
    description: "A medium-sized tote in tan, black, or cognac leather (or quality vegan alternative).",
    priceRange: "£50–£200",
    reason: "Elevates casual outfits and works for both work and weekend.",
  },
];

// ─── Outfit Generation Data ───────────────────────────────────────────────────

export const OUTFIT_CONTEXTS = [
  "Work / Office",
  "Casual weekend",
  "Evening out",
  "Smart casual",
  "Active / Gym",
  "Travel",
  "Special event",
];

export const MOOD_OPTIONS = [
  { value: "confident", label: "Confident", emoji: "✨" },
  { value: "relaxed", label: "Relaxed", emoji: "😌" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "playful", label: "Playful", emoji: "🌈" },
  { value: "cosy", label: "Cosy", emoji: "🍂" },
];

export const WEATHER_OPTIONS = [
  { value: "hot", label: "Hot & sunny", emoji: "☀️" },
  { value: "warm", label: "Warm", emoji: "🌤" },
  { value: "mild", label: "Mild", emoji: "⛅" },
  { value: "cool", label: "Cool", emoji: "🌥" },
  { value: "cold", label: "Cold", emoji: "❄️" },
  { value: "rainy", label: "Rainy", emoji: "🌧" },
];

// ─── Colour Palettes ──────────────────────────────────────────────────────────

export const WARM_PALETTE = [
  "#C8956C", "#D4A574", "#E8C49A", "#F2D5B0",
  "#8B4513", "#A0522D", "#CD853F", "#DEB887",
  "#556B2F", "#6B8E23", "#8FBC8F", "#90EE90",
];

export const COOL_PALETTE = [
  "#4A6FA5", "#6B8CBE", "#8FAFD4", "#B0C8E8",
  "#2F4F4F", "#3D6B6B", "#5F9EA0", "#87CEEB",
  "#6A0DAD", "#8B008B", "#9370DB", "#DDA0DD",
];

export const NEUTRAL_PALETTE = [
  "#8B7355", "#A0896B", "#B8A48A", "#D4C4A8",
  "#696969", "#808080", "#A9A9A9", "#D3D3D3",
  "#2F4F4F", "#4A5568", "#718096", "#A0AEC0",
];
