import { ReactNode } from "react";
import PublicNav from "@/components/public-nav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080809] text-white font-inter">
      <PublicNav />
      <main className="pt-14">{children}</main>
    </div>
  );
}
