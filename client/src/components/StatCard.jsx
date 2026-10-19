export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl2 border border-slate-100 shadow-sm p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-display font-semibold text-ink mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      {Icon && (
        <div className="rounded-lg bg-indigo-50 text-indigo p-2.5">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
