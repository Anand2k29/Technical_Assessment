"use client";

import { useState } from "react";
import { VisualSpec } from "@/lib/api";

export default function VisualPanel({ visual, visualSpec, concept }: { visual?: VisualSpec; visualSpec?: VisualSpec; concept?: string }) {
  const spec = visual || visualSpec;
  const [activeTab, setActiveTab] = useState<"overview" | "nodes" | "notes" | "timeline">("overview");
  const [timelineStep, setTimelineStep] = useState(3); // 1..5 steps

  const type = spec?.type || "diagram";
  const title = spec?.title || concept || "Interactive Concept Canvas";

  return (
    <div className="bg-[#f2f2eb] rounded-[2.5rem] border border-slate-300/80 shadow-xl overflow-hidden flex flex-col h-full relative">
      
      {/* Top Filter Pill Bar (matching reference image top bar) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300/60 bg-[#e8e8e2]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-xs">
            ⚡
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-[#dcdcd4] p-1 rounded-full border border-slate-300/60">
          {(["overview", "nodes", "notes", "timeline"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold capitalize transition-all ${
                activeTab === tab ? "bg-[#121212] text-white shadow" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area: Connected Flow Nodes (matching reference mindmap image) */}
      <div className="flex-1 p-6 relative overflow-y-auto canvas-bg flex flex-col justify-between">
        
        {/* Top Floating Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Column 1: Main Concept Node */}
          <div className="md:col-span-4 space-y-3">
            <div className="node-card-black p-5 relative group border-2 border-yellow-400/40">
              <div className="flex items-center justify-between mb-2">
                <span className="pin-yellow text-[10px] px-2.5 py-0.5 uppercase tracking-wider font-extrabold">Active Topic</span>
                <span className="text-yellow-400 text-xs">● Live</span>
              </div>
              <h3 className="font-black text-white text-lg capitalize">{concept || "Core Concept"}</h3>
              <p className="text-xs text-slate-300 mt-1">Grounding knowledge node & adaptive teaching flow</p>
            </div>

            <div className="node-card-white p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                <span>🔬</span>
                <span>Prerequisites</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-200">Fundamentals</span>
                <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-200">Key Principles</span>
              </div>
            </div>
          </div>

          {/* Connection Vector Arrow (visual line connecting nodes) */}
          <div className="hidden md:flex md:col-span-1 justify-center">
            <div className="w-full h-0.5 bg-slate-400 relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900" />
            </div>
          </div>

          {/* Column 2: Spec Output Node (Equations, Diagrams, Timelines, Code) */}
          <div className="md:col-span-7">
            {type === "equation" && (
              <div className="node-card-black p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="pin-yellow text-xs px-3 py-1 font-bold">∑ Equation Spec</span>
                  <span className="text-xs text-slate-400 font-mono">LaTeX Render</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl font-mono text-emerald-400 text-center text-lg font-bold border border-slate-800">
                  {String(spec?.latex || spec?.subject || "E = mc^2")}
                </div>
                <p className="text-xs text-slate-300 text-center italic">{String(spec?.explanation || "Mathematical foundation breakdown")}</p>
              </div>
            )}

            {type === "code" && (
              <div className="node-card-black p-5 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="pin-yellow text-xs px-3 py-1 font-bold">💻 Code Node</span>
                  <span className="text-xs text-slate-400 font-mono">Python / JS</span>
                </div>
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800">
                  <code>{String(spec?.code || "// Code snippet representation\nfunction learn(concept) {\n  return concept.mastered;\n}")}</code>
                </pre>
              </div>
            )}

            {type === "timeline" && (
              <div className="node-card-white p-5 space-y-3">
                <span className="pin-yellow text-xs px-3 py-1 font-bold">📅 Timeline Flow</span>
                <div className="space-y-2 pt-2">
                  {((spec?.events as string[]) || ["Phase 1: Foundation", "Phase 2: Application", "Phase 3: Mastery"]).map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </div>
                      <span className="font-bold text-slate-800">{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type !== "equation" && type !== "code" && type !== "timeline" && (
              <div className="node-card-black p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="pin-yellow text-xs px-3 py-1 font-bold">💡 Concept Visual</span>
                  <span className="text-xs text-slate-400 font-semibold">{spec?.subject || "Grounded RAG"}</span>
                </div>
                <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-center space-y-3">
                  <div className="text-3xl">🧩</div>
                  <h4 className="font-extrabold text-white text-base">{spec?.title || "Visual Breakdown"}</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Interactive mind map node grounded directly in your study material.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Timeline Scrubber Track (Matching reference image bottom timeline) */}
        <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-300/80 shadow-md">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
              <span>Lesson Step Timeline Progress</span>
            </span>
            <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-full font-mono text-[11px]">
              Step {timelineStep} of 5
            </span>
          </div>

          {/* Interactive Steps Nodes Track */}
          <div className="relative flex items-center justify-between pt-3 pb-1 px-4">
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full" />
            
            {[1, 2, 3, 4, 5].map((step) => {
              const completed = step <= timelineStep;
              const current = step === timelineStep;
              return (
                <button
                  key={step}
                  onClick={() => setTimelineStep(step)}
                  className={`relative z-10 w-9 h-9 rounded-full font-extrabold text-xs flex items-center justify-center transition-all ${
                    current
                      ? "bg-yellow-400 text-slate-950 ring-4 ring-slate-900 scale-110 shadow-lg"
                      : completed
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                  }`}
                >
                  {step}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
