export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-xl2 border border-slate-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
