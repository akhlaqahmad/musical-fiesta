"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addStylistBooking, generateId, loadState } from "@/lib/storage";
import { MOCK_STYLISTS } from "@/lib/mockData";
import type { Stylist, StylistBooking } from "@/lib/types";

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-amber-400" : "text-stone-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function StylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingStep, setBookingStep] = useState<"form" | "confirm" | "success">("form");
  const [booking, setBooking] = useState<StylistBooking | null>(null);

  useEffect(() => {
    const found = MOCK_STYLISTS.find((s) => s.id === id);
    if (found) setStylist(found);
  }, [id]);

  const handleBook = () => {
    if (!stylist || !selectedDate || !selectedTime) return;
    setBookingStep("confirm");
  };

  const handleConfirmPayment = () => {
    if (!stylist) return;
    const state = loadState();
    const userId = state.userProfile?.id || generateId();

    const newBooking: StylistBooking = {
      id: generateId(),
      userId,
      stylistId: stylist.id,
      stylistName: stylist.name,
      date: selectedDate,
      time: selectedTime,
      notes: notes || undefined,
      status: "confirmed",
      totalAmount: stylist.pricePerSession,
      paymentStatus: "simulated_paid",
      createdAt: new Date().toISOString(),
    };

    addStylistBooking(newBooking);
    setBooking(newBooking);
    setBookingStep("success");
  };

  if (!stylist) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Stylist not found</p>
      </div>
    );
  }

  // Get min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-stone-100">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-stone-500 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-200 to-purple-200 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {stylist.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-stone-900">{stylist.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={stylist.rating} />
              <span className="text-sm text-stone-500">{stylist.rating} ({stylist.reviewCount} reviews)</span>
            </div>
            <p className="text-stone-400 text-sm mt-0.5">{stylist.location}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Bio */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <h2 className="font-semibold text-stone-900 mb-2">About</h2>
          <p className="text-stone-600 text-sm leading-relaxed">{stylist.bio}</p>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <h2 className="font-semibold text-stone-900 mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {stylist.specialty.map((spec) => (
              <span key={spec} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm font-medium">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & availability */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-900">Session details</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 text-sm">Price per session</span>
              <span className="font-bold text-stone-900">{stylist.pricing}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 text-sm">Available days</span>
              <div className="flex gap-1">
                {stylist.availability.map((day) => (
                  <span key={day} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {day}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 text-sm">Session length</span>
              <span className="text-stone-900 text-sm">60 minutes</span>
            </div>
          </div>
        </div>

        {/* Booking form */}
        {showBooking && bookingStep === "form" && (
          <div className="bg-white rounded-3xl p-5 border border-stone-100">
            <h2 className="font-semibold text-stone-900 mb-4">Book a session</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Select date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={minDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Select time</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedTime === time
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-white border-stone-200 text-stone-700 hover:border-rose-300"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Notes for {stylist.name.split(" ")[0]} <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell them about your styling goals, any upcoming events, or what you'd like to focus on..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white resize-none text-sm"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime}
              >
                Review booking →
              </Button>
            </div>
          </div>
        )}

        {/* Booking confirmation */}
        {showBooking && bookingStep === "confirm" && (
          <div className="bg-white rounded-3xl p-5 border border-stone-100">
            <h2 className="font-semibold text-stone-900 mb-4">Confirm booking</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Stylist</span>
                <span className="font-medium text-stone-900">{stylist.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Date</span>
                <span className="font-medium text-stone-900">
                  {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Time</span>
                <span className="font-medium text-stone-900">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Duration</span>
                <span className="font-medium text-stone-900">60 minutes</span>
              </div>
              <div className="border-t border-stone-100 pt-3 flex justify-between">
                <span className="font-semibold text-stone-900">Total</span>
                <span className="font-bold text-stone-900">£{stylist.pricePerSession}</span>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 mb-4 border border-amber-100">
              <p className="text-amber-800 text-xs">
                💳 <span className="font-semibold">Simulated payment</span> — No real payment will be processed. This is a demo experience.
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="primary" size="lg" fullWidth onClick={handleConfirmPayment}>
                Confirm & pay £{stylist.pricePerSession}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={() => setBookingStep("form")}>
                Edit booking
              </Button>
            </div>
          </div>
        )}

        {/* Booking success */}
        {bookingStep === "success" && booking && (
          <div className="bg-white rounded-3xl p-6 border border-stone-100 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Booking confirmed!</h2>
            <p className="text-stone-500 text-sm mb-4">
              Your session with {stylist.name} is booked for{" "}
              {new Date(booking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} at {booking.time}.
            </p>
            <div className="bg-green-50 rounded-2xl p-3 mb-4 border border-green-100">
              <p className="text-green-800 text-sm">
                ✓ Payment of £{booking.totalAmount} confirmed (simulated)
              </p>
            </div>
            <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/stylists")}>
              Back to stylists
            </Button>
          </div>
        )}
      </div>

      {/* Book CTA */}
      {!showBooking && bookingStep !== "success" && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-stone-50 to-transparent">
          <Button variant="primary" size="lg" fullWidth onClick={() => setShowBooking(true)}>
            Book a session · {stylist.pricing}
          </Button>
        </div>
      )}
    </div>
  );
}
