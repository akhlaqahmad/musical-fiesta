"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadState } from "@/lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const state = loadState();
    if (state.userProfile?.onboardingCompleted) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold text-stone-900">StylistA</h1>
        <p className="text-stone-500 text-sm mt-2">Loading your style...</p>
      </div>
    </div>
  );
}
