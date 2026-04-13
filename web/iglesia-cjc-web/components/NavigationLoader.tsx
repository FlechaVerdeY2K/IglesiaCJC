"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPathname = useRef(pathname);

  // Cuando el pathname cambia, la navegación terminó → ocultar loader
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Interceptar clics en links para mostrar loader antes de navegar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // Solo rutas internas, no anclas ni externas ni mailto
      if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href !== pathname) setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#080E1E" }}
    >
      <LoadingScreen />
    </div>
  );
}
