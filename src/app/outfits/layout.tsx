import { BottomNav } from "@/components/layout/BottomNav";

export default function OutfitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
