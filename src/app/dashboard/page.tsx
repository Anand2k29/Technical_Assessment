"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, Dashboard } from "@/lib/api";
import { getUserId } from "@/lib/session";
import MedicalMindmapDemo from "@/components/MedicalMindmapDemo";
import MasteryBar from "@/components/MasteryBar";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("AI & Math");

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      router.push("/onboarding");
      return;
    }
    api.dashboard(userId).then(setData).catch((e) => setError(e.message));
  }, [router]);

  if (error) return <div className="p-12 text-center text-rose-600 font-extrabold">{error}</div>;
  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 font-extrabold min-h-screen">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-purple-600 rounded-full animate-spin mb-4" />
        <span>Loading full-screen workspace…</span>
      </div>
    );
  }

  const name = data.profile.name.split(" ")[0];
  const todayDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" });

  return (
    <div className="w-full min-h-screen flex bg-[#f8fafc] text-slate-900 overflow-x-hidden">
      
      {/* Integrated Full-Height Dark Left Sidebar (Edge-to-Edge) */}
      <aside className="hidden lg:flex flex-col items-center justify-between bg-[#0f172a] text-white py-8 px-3.5 w-20 shrink-0 border-r border-slate-800 shadow-2xl min-h-screen">
        <Link href="/dashboard" className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-base shadow-lg hover:scale-105 transition">
          A.
        </Link>

        <nav className="flex flex-col items-center gap-7">
          <SidebarLink href="/dashboard" active title="Dashboard">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </SidebarLink>
          <SidebarLink href="/learn/new" title="Start Learning">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </SidebarLink>
          <SidebarLink href="/progress" title="Progress">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </SidebarLink>
          <SidebarLink href="/settings" title="Settings">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </SidebarLink>
        </nav>

        <Link href="/settings" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold hover:bg-slate-700 transition">
          👤
        </Link>
      </aside>

      {/* Main Full-Screen Body */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
        
        {/* Edge-to-Edge Integrated Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Hello, {name} 👋</h1>
            <p className="text-xs font-extrabold text-slate-500 mt-1">
              {todayDate} • <span className="text-purple-700 font-black">{data.streak_days} day streak</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input className="input pl-10 text-xs py-2.5 bg-white shadow-sm" placeholder="Search lessons, nodes, files..." />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <Link href="/learn/new" className="btn-black-pill text-xs shrink-0 flex items-center gap-2 py-3 px-6 shadow-md">
              <span>+ New Lesson</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Section Title & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interactive Learning Workspace</h2>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {["AI & Math", "Computer Science", "Physics", "List View"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-black shrink-0 border transition-all ${
                  activeFilter === filter
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* PROMINENT CENTERPIECE: Medical / Mindmap Workspace Demo (Reference Image Match) */}
        <MedicalMindmapDemo />

        {/* Workspace Cards Grid Below Centerpiece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Learning Progress Wave Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase font-black tracking-wider text-slate-500">LEARNING PROGRESS</h3>
                <Link href="/progress" className="text-xs font-black text-purple-700 hover:underline">View All →</Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Peach Card */}
                <div className="card-sparkline-peach p-6 space-y-3 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">Active Lesson</span>
                    <span className="bg-orange-200/90 text-orange-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {data.continue_learning ? "In Progress" : "Mastered"}
                    </span>
                  </div>

                  <div className="text-4xl font-black text-slate-900 tracking-tight">
                    {Math.round(data.progress.overall_mastery * 100)}%
                  </div>

                  <p className="text-xs text-slate-700 font-black line-clamp-1">
                    {data.continue_learning?.title || "Fundamentals of Deep Learning"}
                  </p>

                  <svg className="w-full h-8 text-orange-400" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M0 30 Q 40 10, 80 25 T 160 15 T 200 20" />
                  </svg>

                  {data.continue_learning && (
                    <Link
                      href={`/learn/teach?lessonId=${data.continue_learning.lesson_id}`}
                      className="inline-block mt-2 text-xs font-black text-slate-900 underline"
                    >
                      Resume Lesson →
                    </Link>
                  )}
                </div>

                {/* Purple Card */}
                <div className="card-sparkline-purple p-6 space-y-3 relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700">Concept Mastery</span>
                    <span className="bg-purple-200/90 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {data.progress.concepts_mastered} Mastered
                    </span>
                  </div>

                  <div className="text-4xl font-black text-slate-900 tracking-tight">
                    {data.progress.concepts_mastered * 25}%
                  </div>

                  <p className="text-xs text-slate-700 font-black">
                    Neural Networks & RAG Mechanics
                  </p>

                  <svg className="w-full h-8 text-purple-500" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M0 25 Q 50 35, 100 10 T 170 30 T 200 5" />
                  </svg>
                </div>

              </div>
            </div>

            {/* Popular Courses Row */}
            <div>
              <h3 className="text-xs uppercase font-black tracking-wider text-slate-500 mb-3">POPULAR COURSES</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-course-pink p-5 flex flex-col justify-between h-44 shadow-sm hover:scale-[1.02] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-pink-200/80 flex items-center justify-center text-2xl shadow-sm">
                    🚀
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Language Modeling</h4>
                    <div className="text-xs text-amber-700 font-black mt-1">★ 4.9</div>
                  </div>
                </div>

                <div className="card-course-yellow p-5 flex flex-col justify-between h-44 shadow-sm hover:scale-[1.02] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-200/80 flex items-center justify-center text-2xl shadow-sm">
                    💻
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Computer Science</h4>
                    <div className="text-xs text-amber-700 font-black mt-1">★ 4.8</div>
                  </div>
                </div>

                <div className="card-course-blue p-5 flex flex-col justify-between h-44 shadow-sm hover:scale-[1.02] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-200/80 flex items-center justify-center text-2xl shadow-sm">
                    🧠
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">AI Fundamentals</h4>
                    <div className="text-xs text-amber-700 font-black mt-1">★ 4.9</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 Cols): Study Craft Mascot Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#fef9c3] rounded-[2.5rem] p-6 border border-yellow-200/80 space-y-5 text-center shadow-sm">
              <div className="flex items-center justify-between text-left">
                <h3 className="font-black text-slate-900 text-lg">Study Craft</h3>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black shadow-sm">
                  #2
                </span>
              </div>

              <div className="w-44 h-44 mx-auto relative my-1">
                <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="AI Professor Mascot">
                  <circle cx="100" cy="110" r="45" fill="#f97316" />
                  <polygon points="65,70 80,40 90,75" fill="#f97316" />
                  <polygon points="135,70 120,40 110,75" fill="#f97316" />
                  <circle cx="85" cy="100" r="12" fill="none" stroke="#0f172a" strokeWidth="3" />
                  <circle cx="115" cy="100" r="12" fill="none" stroke="#0f172a" strokeWidth="3" />
                  <line x1="97" y1="100" x2="103" y2="100" stroke="#0f172a" strokeWidth="3" />
                  <circle cx="85" cy="100" r="3" fill="#0f172a" />
                  <circle cx="115" cy="100" r="3" fill="#0f172a" />
                  <line x1="140" y1="120" x2="175" y2="85" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                  <text x="145" y="75" fontSize="13" fontWeight="bold" fill="#78350f">E=mc²</text>
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">Science Play 🎓</h4>
                  <span className="w-7 h-7 rounded-full bg-white font-black text-[11px] flex items-center justify-center border border-yellow-300 shadow-sm">
                    5.0
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Discover the magic of learning in a playful way! With your wise AI professor.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-3 rounded-2xl border border-yellow-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Hours</div>
                  <div className="text-xl font-black text-slate-900">32</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-yellow-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Lessons</div>
                  <div className="text-xl font-black text-slate-900">16</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

function SidebarLink({ href, active, title, children }: { href: string; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={title}
      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
        active ? "bg-white text-slate-900 shadow-md scale-105" : "text-slate-400 hover:text-white hover:bg-slate-800"
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
    </Link>
  );
}
