"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserId } from "@/lib/session";

export default function Landing() {
  const hasSession = Boolean(useUserId());
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-dashboard-canvas text-slate-900 font-sans">
      
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION WITH ISOMETRIC STUDIO PREVIEW */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-10 flex flex-col items-center">
        
        {/* Top Pill Tag */}
        <div className="inline-flex items-center gap-2.5 text-xs font-black tracking-wider uppercase text-slate-900 bg-white border border-slate-300 rounded-full px-5 py-2 mb-8 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
          <span>Interactive Spoken AI Teacher · Grounded RAG Studio</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 mb-6 leading-[1.08] max-w-5xl">
          AUTO<span className="bg-yellow-400 text-slate-950 px-3 py-0.5 rounded-2xl ml-1">PSY</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-2xl text-slate-600 max-w-3xl mb-10 leading-relaxed font-semibold">
          The AI teacher that <strong className="text-slate-950 font-black">understands your material</strong>, <strong className="text-slate-900 underline decoration-yellow-400 decoration-4">teaches out loud</strong> with live visual panels, catches misconceptions, and adapts until you achieve full mastery.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href={hasSession ? "/dashboard" : "/onboarding"}
            className="btn-black-pill text-base flex items-center gap-3 px-8 py-4 shadow-xl"
          >
            <span>{hasSession ? "Open Learning Dashboard" : "Start Learning Free"}</span>
            <span className="text-yellow-400">→</span>
          </Link>
          <Link
            href="/onboarding"
            className="px-8 py-4 rounded-full bg-white font-black text-slate-800 hover:bg-slate-50 transition-all border border-slate-300 shadow-sm text-sm"
          >
            Try Spoken Demo Lesson
          </Link>
        </div>

        {/* HIGH-CONTRAST LIGHT & OBSIDIAN APP PREVIEW MOCKUP CARD */}
        <div className="w-full max-w-5xl my-4">
          <div className="p-6 sm:p-8 relative overflow-hidden bg-white shadow-2xl rounded-[2.5rem] border border-slate-300/80">
            
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-slate-800 ml-2">AUTOPSY AI Teaching Studio — Active Lesson</span>
              </div>
              <span className="text-[11px] font-black text-slate-900 bg-yellow-400 px-3 py-1 rounded-full">
                ● Grounded RAG Reranker
              </span>
            </div>

            {/* 2-Column Studio Room Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              
              {/* Left Column: Line-Art AI Teacher Player */}
              <div className="lg:col-span-5 bg-[#09090b] text-white rounded-3xl p-5 border border-slate-800 flex flex-col items-center justify-between min-h-[280px] shadow-lg">
                <div className="flex items-center justify-between w-full text-xs font-black text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI TEACHER NARRATING
                  </span>
                  <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-[11px]">0.95× Speed</span>
                </div>

                <div className="my-4 relative">
                  <div className="w-24 h-24 rounded-full bg-yellow-400/10 blur-xl absolute inset-0 animate-pulse" />
                  <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10 drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#171717" stroke="#333333" strokeWidth="2" />
                    <circle cx="50" cy="42" r="20" fill="#fde68a" />
                    <circle cx="43" cy="42" r="2.5" fill="#18171c" />
                    <circle cx="57" cy="42" r="2.5" fill="#18171c" />
                    <rect x="42" y="52" width="16" height="6" rx="3" fill="#991b1b" />
                    <path d="M 25 85 Q 50 68 75 85" fill="#facc15" />
                  </svg>
                </div>

                {/* Animated Soundwave Equalizer */}
                <div className="flex items-center gap-1.5 h-5 my-1">
                  <div className="w-1.5 bg-yellow-400 rounded-full animate-soundwave-1" />
                  <div className="w-1.5 bg-yellow-300 rounded-full animate-soundwave-2" />
                  <div className="w-1.5 bg-yellow-500 rounded-full animate-soundwave-3" />
                  <div className="w-1.5 bg-yellow-400 rounded-full animate-soundwave-4" />
                </div>

                <p className="text-xs text-slate-300 font-semibold text-center bg-slate-950 rounded-2xl p-3 border border-slate-800 w-full">
                  &quot;Let&apos;s derive how Backpropagation uses the chain rule to update neural weights...&quot;
                </p>
              </div>

              {/* Right Column: Visual Spec Panel */}
              <div className="lg:col-span-7 bg-[#f8f9fa] rounded-3xl p-5 border border-slate-200 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    ⚡ Interactive Concept Visual
                  </span>
                  <span className="text-xs font-mono text-slate-500">LaTeX Render</span>
                </div>

                <div className="bg-white p-4 rounded-2xl font-mono text-slate-900 text-center text-sm sm:text-base font-extrabold border border-slate-300 shadow-sm flex items-center justify-center gap-2">
                  <span className="text-slate-900 font-serif italic">∂L / ∂wᵢ</span>
                  <span>=</span>
                  <span>(</span>
                  <span className="text-indigo-700 font-serif italic">∂L / ∂ŷ</span>
                  <span>)</span>
                  <span>·</span>
                  <span>(</span>
                  <span className="text-emerald-700 font-serif italic">∂ŷ / ∂z</span>
                  <span>)</span>
                  <span>·</span>
                  <span className="text-amber-700 font-serif italic">xᵢ</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wide">Lesson Flow Timeline:</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800">1. Forward Pass</div>
                    <div className="bg-yellow-400 p-2.5 rounded-xl border border-yellow-500 font-black text-slate-950 shadow-sm">2. Loss Calc</div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800">3. Weight Update</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: METRIC HIGHLIGHT GRID */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { metric: "100%", label: "Grounded RAG", desc: "Built strictly from your uploaded files", highlight: "bg-yellow-400 text-slate-950" },
            { metric: "0", label: "Wall of Text", desc: "Spoken voice + dynamic visual mindmaps", highlight: "bg-slate-900 text-white" },
            { metric: "< 2s", label: "Realtime Diagnosis", desc: "Instantly catches misconceptions", highlight: "bg-slate-900 text-white" },
            { metric: "4.9/5", label: "Learner Rating", desc: "Loved by STEM & Medical students", highlight: "bg-yellow-400 text-slate-950" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[2rem] border border-slate-300/80 text-left relative overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
                {stat.metric}
              </div>
              <div className="font-extrabold text-slate-900 text-sm mb-1">{stat.label}</div>
              <p className="text-xs text-slate-500 font-semibold">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TEACHING METHODOLOGY GRID */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10 space-y-14">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-slate-900 bg-yellow-400 px-4 py-1.5 rounded-full">
            How AUTOPSY Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Built like a human 1-on-1 private tutor
          </h2>
          <p className="text-slate-600 text-base font-semibold">
            Instead of dumping generic textbook walls of text, AUTOPSY executes a structured 4-phase adaptive teaching loop.
          </p>
        </div>

        {/* Phase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Phase 1 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-300/80 space-y-4 shadow-sm hover:border-slate-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black">
              01
            </div>
            <h3 className="text-2xl font-black text-slate-900">Document-Grounded RAG</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Upload your lecture slides, PDF textbooks, or study notes. AUTOPSY parses, embeds, and grounds every spoken sentence strictly in your exact syllabus.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">PDF Support</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">DOCX & PPTX</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Vector Search</span>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-300/80 space-y-4 shadow-sm hover:border-slate-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center text-lg font-black">
              02
            </div>
            <h3 className="text-2xl font-black text-slate-900">Spoken Voice & Visual Studio</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Teaches out loud with natural voice modulation paired with dynamic mindmap nodes, LaTeX formulas, code sandboxes, and step flowcharts.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Natural Pitch & Rate</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">LaTeX Render</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Code Nodes</span>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-300/80 space-y-4 shadow-sm hover:border-slate-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black">
              03
            </div>
            <h3 className="text-2xl font-black text-slate-900">Misconception Diagnosis Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Asks checkpoint questions after each concept section. If you answer incorrectly, AUTOPSY diagnoses *why* you made that error and isolates the mental trap.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Voice Input</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Misconception Taxonomy</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Severity Tagging</span>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-300/80 space-y-4 shadow-sm hover:border-slate-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center text-lg font-black">
              04
            </div>
            <h3 className="text-2xl font-black text-slate-900">Adaptive Re-Teaching & Mastery</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Re-explains flagged concepts using targeted analogies before advancing. Tracks real-time mastery scores across every subtopic.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Dynamic Re-explanation</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Mastery Progress</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Diagnostic Reports</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SAMPLE LESSON SHOWCASE CARDS */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Try Interactive Sample Lessons</h2>
          <p className="text-slate-600 text-sm font-semibold">Select a topic below to jump straight into a live spoken session</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Neural Networks & Backpropagation", category: "AI & Data Science", difficulty: "Intermediate" },
            { title: "Quantum Superposition & Qubits", category: "Physics & Computing", difficulty: "Advanced" },
            { title: "Cellular Respiration & ATP Synthesis", category: "Biology & Life Sciences", difficulty: "Beginner" },
          ].map((course, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-300/80 flex flex-col justify-between h-64 shadow-sm hover:shadow-md transition-all group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">🎓</span>
                  <span className="text-[10px] uppercase font-black text-slate-900 bg-yellow-400 px-3 py-1 rounded-full">
                    {course.difficulty}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">{course.category}</div>
                <h3 className="font-black text-slate-900 text-lg leading-snug">{course.title}</h3>
              </div>

              <Link
                href="/onboarding"
                className="w-full py-3 rounded-full bg-slate-900 text-white font-extrabold text-xs text-center hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Launch Spoken Lesson</span>
                <span className="text-yellow-400">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm font-semibold">Everything you need to know about AUTOPSY</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does AUTOPSY ground lessons in my uploaded study material?",
              a: "When you upload a PDF, DOCX, or text file, AUTOPSY parses and embeds the content into grounded retrieval chunks. Every spoken lesson script and question is built strictly from these source chunks."
            },
            {
              q: "Can I run AUTOPSY without an Anthropic API Key?",
              a: "Yes! AUTOPSY includes a complete DEMO MODE. If no Anthropic API key is supplied, deterministic rule-based algorithms power the teaching loop so you can test all features free of charge."
            },
            {
              q: "Does AUTOPSY support multiple languages?",
              a: "Yes! AUTOPSY supports English, Hindi, and Hinglish for both speech audio narration and question prompts."
            },
            {
              q: "Can I answer checkpoint questions using my voice?",
              a: "Yes! AUTOPSY integrates browser Speech-to-Text so you can speak your answers directly into your microphone."
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden transition-all border border-slate-300/80 shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-black text-slate-900 text-base flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <span className="text-slate-900 bg-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black">{openFaq === idx ? "−" : "+"}</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed font-semibold border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FINAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="p-10 sm:p-14 text-center relative overflow-hidden bg-slate-900 text-white rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to learn out loud with your personal <span className="text-yellow-400">AI Teacher</span>?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-semibold">
              Start your first grounded spoken lesson in less than 30 seconds.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href={hasSession ? "/dashboard" : "/onboarding"}
                className="btn-yellow-pill text-base px-10 py-4"
              >
                {hasSession ? "Open Learning Dashboard" : "Start Learning Free"} →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

