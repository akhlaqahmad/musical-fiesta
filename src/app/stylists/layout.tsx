import { BottomNav } from "@/components/layout/BottomNav";

export default function StylistsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
