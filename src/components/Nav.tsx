"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserId } from "@/lib/session";

export default function Nav() {
  const pathname = usePathname();
  const signedIn = Boolean(useUserId());

  // Hide Nav on landing page, onboarding, and dashboard (since dashboard has integrated nav header)
  if (pathname === "/" || pathname === "/onboarding" || pathname === "/dashboard") return null;
  if (!signedIn) return null;

  const LINKS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/learn/new", label: "Start Learning" },
    { href: "/progress", label: "Progress" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-6 lg:px-12">
      <div className="w-full bg-[#ffffff]/90 backdrop-blur-xl text-slate-900 rounded-full px-8 h-16 flex items-center justify-between shadow-xl border border-purple-100">
        <Link href="/dashboard" className="flex items-center gap-3 font-black tracking-tight text-xl group">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-md">
            A.
          </div>
          <span className="text-slate-900 font-black tracking-wide">AUTO<span className="text-purple-600">PSY</span></span>
        </Link>

        <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          {LINKS.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                  active ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-950 hover:bg-white/80"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
