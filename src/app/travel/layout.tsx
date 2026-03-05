import { BottomNav } from "@/components/layout/BottomNav";

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
