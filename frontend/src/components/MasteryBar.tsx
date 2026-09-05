export default function MasteryBar({ label, mastery }: { label: string; mastery: number }) {
  const pct = Math.round(mastery * 100);
  const color =
    pct >= 80
      ? "from-emerald-500 to-teal-400"
      : pct >= 50
      ? "from-indigo-500 to-violet-400"
      : pct >= 30
      ? "from-amber-500 to-orange-400"
      : "from-rose-500 to-pink-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-200 capitalize">{label}</span>
        <span className="text-indigo-300">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-900/80 border border-white/5 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 shadow-sm`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
