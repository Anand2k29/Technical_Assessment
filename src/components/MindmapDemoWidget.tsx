"use client";

import { useState } from "react";
import Link from "next/link";

export default function MindmapDemoWidget() {
  const [selectedNode, setSelectedNode] = useState("Arrhythmia");
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "documents" | "labs">("overview");
  const [timelineStep, setTimelineStep] = useState(4);

  const NODES = [
    { id: "Tachycardia", label: "Tachycardia", type: "topic" },
    { id: "Bradycardia", label: "Bradycardia", type: "topic" },
    { id: "Arrhythmia", label: "Arrhythmia (Active)", type: "active", bpm: "62-180 bpm" },
    { id: "Neurological", label: "Neurological Signal", type: "topic" },
    { id: "Heart Attack", label: "Ischemic Event", type: "topic" },
  ];

  return (
    <div className="bg-[#e8e8e2] rounded-[2.5rem] p-6 border border-slate-300/80 shadow-md space-y-6 relative overflow-hidden">
      
      {/* Top Header Row with Category Pills matching reference image */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-300/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping" />
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Interactive Concept Canvas</h3>
          </div>
          <p className="text-xs text-slate-600 font-bold">Featured Demo Experience • Grounded Mind Map Workspace</p>
        </div>

        {/* Category Pills Switcher */}
        <div className="flex items-center gap-1.5 bg-[#dcdcd4] p-1 rounded-full border border-slate-300/80">
          {(["overview", "notes", "documents", "labs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black capitalize transition-all ${
                activeTab === tab ? "bg-[#121212] text-white shadow-md" : "text-slate-700 hover:text-slate-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Concept Nodes Column */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
            Connected Knowledge Nodes
          </div>
          {NODES.map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                selectedNode === node.id
                  ? "bg-[#121212] text-white border-yellow-400/80 shadow-lg scale-[1.02]"
                  : "bg-white text-slate-800 border-slate-300/80 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedNode === node.id ? "bg-yellow-400" : "bg-slate-400"}`} />
                <span className="font-extrabold text-xs">{node.label}</span>
              </div>
              {node.bpm && (
                <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {node.bpm}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Side: Active Node Details Card (Matching reference black card & MRI chest boxes) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Black Node Card with Yellow Pin Accent */}
          <div className="bg-[#121212] text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                ⚡ Active Node: {selectedNode}
              </span>
              <span className="text-xs font-mono text-yellow-400 font-bold">62 - 180 bpm</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-white text-xl capitalize">{selectedNode} Dynamics</h4>
              <p className="text-xs text-slate-300 font-medium">
                Grounded diagnostic waveform analysis & adaptive lesson path
              </p>
            </div>

            {/* Simulated Cardiogram Waveform */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span>❤️</span>
                <span>Cardiogram Signal</span>
              </div>
              <svg className="w-48 h-6 text-emerald-400" viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M0 15 L30 15 L40 5 L50 25 L60 0 L70 30 L80 15 L120 15 L130 5 L140 25 L150 15 L200 15" />
              </svg>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-medium">Ready for spoken narration?</span>
              <Link
                href="/learn/new"
                className="bg-yellow-400 text-slate-950 hover:bg-yellow-300 px-5 py-2 rounded-full text-xs font-black transition shadow-md"
              >
                Launch Lesson Node →
              </Link>
            </div>
          </div>

          {/* Sub-cards Row (Lab Results & MRI Note) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-300/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-800 font-black flex items-center justify-center text-sm">
                🔬
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Lab Results</div>
                <div className="text-[10px] text-slate-500 font-medium">Diagnostic Note • 07:15</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-300/80 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-black flex items-center justify-center text-sm">
                🩺
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Heart MRI Note</div>
                <div className="text-[10px] text-slate-500 font-medium">Imaging Scan • 08:30</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Bottom Timeline Scrubber Track (Matching reference image bottom timeline) */}
      <div className="bg-white/90 rounded-2xl p-4 border border-slate-300/80 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-slate-900">
          <span>Timeline Scrubber Progression</span>
          <span className="bg-slate-900 text-white px-3 py-0.5 rounded-full text-[11px]">
            Phase {timelineStep} of 5
          </span>
        </div>

        <div className="relative flex items-center justify-between pt-3 pb-1 px-4">
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full" />
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              onClick={() => setTimelineStep(step)}
              className={`relative z-10 w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                step === timelineStep
                  ? "bg-yellow-400 text-slate-950 ring-4 ring-slate-900 scale-110 shadow-md"
                  : step < timelineStep
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-500 hover:bg-slate-300"
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
