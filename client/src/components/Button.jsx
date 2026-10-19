export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-indigo text-white hover:bg-indigo-700',
    secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50',
    danger: 'bg-danger text-white hover:bg-red-700',
    ghost: 'text-indigo hover:bg-indigo-50',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
