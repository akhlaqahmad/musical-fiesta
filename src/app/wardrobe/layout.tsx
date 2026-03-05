import { BottomNav } from "@/components/layout/BottomNav";

export default function WardrobeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
