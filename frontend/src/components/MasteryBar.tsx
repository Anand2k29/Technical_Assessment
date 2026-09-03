export default function MasteryBar({ label, mastery }: { label: string; mastery: number }) {
  const pct = Math.round(mastery * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-indigo-500" : pct >= 30 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-slate-700 capitalize">{label}</span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
