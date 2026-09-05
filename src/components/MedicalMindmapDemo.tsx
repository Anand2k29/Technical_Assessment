"use client";

import { useState } from "react";
import Link from "next/link";

export default function MedicalMindmapDemo() {
  const [selectedNode, setSelectedNode] = useState("Cardiovascular");
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "documents" | "labs" | "imaging">("overview");
  const [timelineYear, setTimelineYear] = useState(2026);

  const ANATOMICAL_PINS = [
    { id: "Neurological", label: "Cranial Node", cx: 50, cy: 22, color: "#8b5cf6", icon: "🧠" },
    { id: "Cardiovascular", label: "Cardiovascular Node", cx: 55, cy: 52, color: "#facc15", icon: "🫀", active: true },
    { id: "Pulmonary", label: "Pulmonary Node", cx: 43, cy: 54, color: "#38bdf8", icon: "🫁" },
    { id: "Renal System", label: "Abdominal Node", cx: 50, cy: 75, color: "#10b981", icon: "🩺" },
  ];

  const KNOWLEDGE_NODES = [
    { id: "Cardiovascular", label: "Cardiovascular Node", category: "Cardiac RAG", status: "Active Target", bpm: "72 bpm" },
    { id: "Neurological", label: "Neurological Network", category: "Central Nervous", status: "Synced", bpm: "Normal" },
    { id: "Pulmonary", label: "Pulmonary Circuit", category: "Respiratory", status: "Grounded", bpm: "98% SpO2" },
    { id: "Arrhythmia", label: "Arrhythmia & ECG", category: "Electrophysiology", status: "Diagnostic", bpm: "110 bpm" },
    { id: "Coronary Artery", label: "Coronary Circulation", category: "Vascular", status: "Grounded", bpm: "Normal" },
    { id: "Renal System", label: "Renal & Electrolytes", category: "Metabolic", status: "Monitored", bpm: "Normal" },
  ];

  const currentNodeInfo = KNOWLEDGE_NODES.find((n) => n.id === selectedNode) || KNOWLEDGE_NODES[0];

  return (
    <div className="bg-[#f8f9fa] rounded-[2.5rem] p-6 border border-slate-300 shadow-2xl space-y-6 relative overflow-hidden text-slate-900 w-full">
      
      {/* Top Header Navigation Row */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#09090b] text-yellow-400 font-black flex items-center justify-center text-lg shadow-md">
            🫀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-black text-slate-900 text-base tracking-tight">Anatomical & Diagnostic Workspace</h3>
            </div>
            <p className="text-xs text-slate-500 font-semibold">Grounded RAG Interactive Anatomy Studio</p>
          </div>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300 max-w-full overflow-x-auto">
          {(["overview", "notes", "documents", "labs", "imaging"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all shrink-0 ${
                activeTab === tab ? "bg-[#09090b] text-white shadow-md" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-56">
          <input className="input text-xs pl-9 py-2 bg-white font-semibold" placeholder="Search target node or topic..." />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: Sleek Interactive Anatomical Mannequin Card */}
        <div className="md:col-span-4 lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-300/80 flex flex-col items-center justify-between relative shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 bg-yellow-400 px-3 py-1 rounded-full">
              Anatomical Target Pins
            </span>
          </div>

          {/* Interactive Modern Vector Body Graphic */}
          <div className="w-full h-64 relative my-2 flex items-center justify-center">
            <svg viewBox="0 0 100 160" className="h-full w-auto drop-shadow-md">
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Head Silhouette */}
              <circle cx="50" cy="20" r="11" fill="url(#bodyGrad)" />
              {/* Neck */}
              <rect x="47" y="30" width="6" height="6" rx="2" fill="url(#bodyGrad)" />
              {/* Torso Silhouette */}
              <path d="M 32 36 C 32 36, 50 34, 68 36 L 64 88 C 64 88, 50 90, 36 88 Z" fill="url(#bodyGrad)" />
              {/* Arms */}
              <path d="M 31 37 C 22 55, 18 75, 16 92 C 18 93, 22 92, 23 90 C 26 75, 30 58, 34 44 Z" fill="url(#bodyGrad)" opacity="0.85" />
              <path d="M 69 37 C 78 55, 82 75, 84 92 C 82 93, 78 92, 77 90 C 74 75, 70 58, 66 44 Z" fill="url(#bodyGrad)" opacity="0.85" />
              {/* Legs */}
              <path d="M 37 88 L 38 152 C 38 154, 45 154, 46 152 L 48 89 Z" fill="url(#bodyGrad)" opacity="0.9" />
              <path d="M 63 88 L 62 152 C 62 154, 55 154, 54 152 L 52 89 Z" fill="url(#bodyGrad)" opacity="0.9" />

              {/* Skeletal / Circuit Grid Overlay Lines */}
              <line x1="50" y1="36" x2="50" y2="88" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
              <line x1="36" y1="52" x2="64" y2="52" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />

              {/* Interactive Target Pins */}
              {ANATOMICAL_PINS.map((pin) => {
                const isSelected = selectedNode === pin.id;
                return (
                  <g key={pin.id} className="cursor-pointer" onClick={() => setSelectedNode(pin.id)}>
                    {isSelected && (
                      <circle cx={pin.cx} cy={pin.cy} r="9" fill={pin.color} opacity="0.4" className="animate-ping" />
                    )}
                    <circle
                      cx={pin.cx}
                      cy={pin.cy}
                      r={isSelected ? "6" : "4.5"}
                      fill={pin.color}
                      stroke="#09090b"
                      strokeWidth="1.5"
                      className="transition-all hover:scale-125"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Active Pin Badge */}
          <div className="w-full text-center mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-full border border-slate-300 shadow-sm w-full justify-center">
              <span>📌 Target:</span>
              <span className="text-slate-950 font-black">{selectedNode}</span>
            </span>
          </div>
        </div>

        {/* COLUMN 2: Diagnostic Knowledge Nodes List */}
        <div className="md:col-span-8 lg:col-span-4 space-y-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Diagnostic Knowledge Nodes
            </span>
            <span className="text-[11px] font-bold text-slate-500">6 Connected Nodes</span>
          </div>

          <div className="space-y-2 flex-1 flex flex-col justify-between">
            {KNOWLEDGE_NODES.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full text-left px-4.5 py-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#09090b] text-white border-slate-900 shadow-lg ring-2 ring-yellow-400 scale-[1.01]"
                      : "bg-white text-slate-900 border-slate-300/80 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${isSelected ? "bg-yellow-400 animate-pulse" : "bg-slate-300"}`} />
                    <div>
                      <div className="font-black text-xs">{node.label}</div>
                      <div className={`text-[10px] font-semibold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{node.category}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${isSelected ? "bg-yellow-400 text-slate-950" : "bg-slate-100 text-slate-700"}`}>
                    {node.bpm}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: High-Contrast Obsidian Focus Card & Lab Cards */}
        <div className="md:col-span-12 lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Black Focus Card */}
          <div className="bg-[#09090b] text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-yellow-400 text-slate-950 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-black">
                  ⚡ Active Target: {currentNodeInfo.label}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Grounded RAG ●</span>
              </div>

              <h4 className="font-black text-white text-lg">{currentNodeInfo.label} Analysis</h4>
              <p className="text-xs text-slate-300 font-semibold mt-1 leading-relaxed">
                Real-time spoken lesson script narration & visual concept breakdown strictly grounded in your study material.
              </p>
            </div>

            {/* Simulated Live ECG Waveform Container */}
            <div className="bg-[#121215] p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between my-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <span className="text-rose-500 animate-pulse">❤️</span>
                <span>Live Signal</span>
              </div>
              <svg className="w-48 h-6 text-emerald-400" viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M0 15 L30 15 L40 5 L50 25 L60 0 L70 30 L80 15 L120 15 L130 5 L140 25 L150 15 L200 15" />
              </svg>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-semibold">Ready for AI Teaching</span>
              <Link
                href="/learn/new"
                className="btn-yellow-pill px-5 py-2 text-xs font-black shadow-md flex items-center gap-1.5"
              >
                <span>Launch Lesson</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Sub-cards Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-300/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-base shrink-0 shadow-sm">
                🔬
              </div>
              <div>
                <div className="font-black text-xs text-slate-900">Lab Results</div>
                <div className="text-[10px] text-slate-500 font-semibold">Grounded Clinical Note</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-300/80 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#09090b] text-yellow-400 font-black flex items-center justify-center text-base shrink-0 shadow-sm">
                🩺
              </div>
              <div>
                <div className="font-black text-xs text-slate-900">MRI Diagnostic</div>
                <div className="text-[10px] text-slate-500 font-semibold">Imaging Spec Render</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Timeline Scrubber Track */}
      <div className="bg-white rounded-2xl p-4 border border-slate-300/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-slate-900">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span>Interactive Timeline Progression Scrubber</span>
          </span>
          <span className="bg-[#09090b] text-white px-3 py-1 rounded-full text-[11px] font-mono">
            Year {timelineYear}
          </span>
        </div>

        <div className="relative flex items-center justify-between pt-3 pb-1 px-4">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full" />
          {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
            <button
              key={yr}
              onClick={() => setTimelineYear(yr)}
              className={`relative z-10 w-9 h-9 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                yr === timelineYear
                  ? "bg-yellow-400 text-slate-950 ring-4 ring-[#09090b] scale-110 shadow-md"
                  : yr < timelineYear
                  ? "bg-[#09090b] text-white"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {yr.toString().slice(2)}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

