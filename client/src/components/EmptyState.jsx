export default function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-16 px-6">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
