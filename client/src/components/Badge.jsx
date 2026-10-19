const STYLES = {
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  info: 'bg-indigo-50 text-indigo',
  neutral: 'bg-slate-100 text-slate-600',
};

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[tone]}`}>
      {children}
    </span>
  );
}
