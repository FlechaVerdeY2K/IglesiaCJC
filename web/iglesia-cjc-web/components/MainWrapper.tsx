"use client";
import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/admin") || pathname.startsWith("/lider") || pathname.startsWith("/cocina");
  return (
    <main className={`flex-1${hideNavbar ? "" : " pt-16"}`}>
      {children}
    </main>
  );
}
