"use client";

import type { VisualSpec } from "@/lib/api";

// Subject-aware visual renderer. Deterministic per the Visual Planner's
// output (equation / diagram / timeline / code / concept card) -- no image
// generation, just structured native rendering (accuracy > flourish).
export default function VisualPanel({ visual }: { visual: VisualSpec }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 h-full flex flex-col">
      <div className="text-xs font-medium uppercase tracking-wide text-indigo-500 mb-3">{visual.subject} · {visual.type.replace("_", " ")}</div>
      {visual.type === "equation" && <EquationVisual visual={visual} />}
      {visual.type === "diagram" && <DiagramVisual visual={visual} />}
      {visual.type === "timeline" && <TimelineVisual visual={visual} />}
      {visual.type === "code" && <CodeVisual visual={visual} />}
      {visual.type === "concept_card" && <ConceptCardVisual visual={visual} />}
    </div>
  );
}

function EquationVisual({ visual }: { visual: VisualSpec }) {
  const steps = (visual.steps as string[]) || [];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="font-mono text-3xl font-semibold text-slate-800 bg-slate-50 rounded-xl px-6 py-4 border border-slate-100">
        {String(visual.formula)}
      </div>
      <ol className="text-sm text-slate-600 space-y-1 self-stretch list-decimal list-inside">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}

function DiagramVisual({ visual }: { visual: VisualSpec }) {
  const parts = (visual.parts as string[]) || [];
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {parts.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`px-4 py-3 rounded-xl border text-sm font-medium ${i === 1 ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
              {p}
            </div>
            {i < parts.length - 1 && <span className="text-slate-400">→</span>}
          </div>
        ))}
      </div>
      {Boolean(visual.formula) && <div className="font-mono text-sm text-slate-500 mt-2">{String(visual.formula)}</div>}
    </div>
  );
}

function TimelineVisual({ visual }: { visual: VisualSpec }) {
  const events = (visual.events as { label: string; detail: string }[]) || [];
  return (
    <div className="flex-1 flex items-center">
      <div className="w-full flex items-stretch gap-0">
        {events.map((e, i) => (
          <div key={i} className="flex-1 flex flex-col items-center text-center px-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600 mb-2" />
            {i < events.length - 1 && <div className="h-px bg-slate-200 w-full -mt-4 mb-4" />}
            <div className="font-semibold text-sm text-slate-800">{e.label}</div>
            <div className="text-xs text-slate-500 mt-1">{e.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeVisual({ visual }: { visual: VisualSpec }) {
  const flow = (visual.flow as string[]) || [];
  return (
    <div className="flex-1 flex flex-col gap-3">
      <pre className="bg-slate-900 text-emerald-300 text-xs rounded-xl p-4 overflow-x-auto flex-1"><code>{String(visual.snippet)}</code></pre>
      <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
        {flow.map((f, i) => <span key={i}>{f}{i < flow.length - 1 ? " → " : ""}</span>)}
      </div>
    </div>
  );
}

function ConceptCardVisual({ visual }: { visual: VisualSpec }) {
  const bullets = (visual.bullets as string[]) || [];
  return (
    <div className="flex-1 flex flex-col justify-center gap-3">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <span className="text-indigo-500 mt-0.5">●</span>
          <span className="text-sm text-slate-700">{b}</span>
        </div>
      ))}
    </div>
  );
}
