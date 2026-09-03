"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserId } from "@/lib/session";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn/new", label: "Start Learning" },
  { href: "/progress", label: "Progress" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();
  const signedIn = Boolean(useUserId());

  if (pathname === "/" || pathname === "/onboarding") return null;
  if (!signedIn) return null;

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold tracking-tight text-slate-900">
          AUTO<span className="text-indigo-600">PSY</span>
        </Link>
        <nav className="flex gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                pathname.startsWith(l.href) ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
