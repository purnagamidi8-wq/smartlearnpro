export default function ProgressBar({ percent = 0, tone = 'indigo' }) {
  const colors = { indigo: 'bg-indigo', success: 'bg-success', cyan: 'bg-cyan' };
  return (
    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full ${colors[tone] || colors.indigo} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
