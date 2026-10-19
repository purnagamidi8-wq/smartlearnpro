export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-700 to-cyan items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h1 className="font-display text-4xl font-semibold leading-tight">Learn at your pace. Prove what you know.</h1>
          <p className="mt-4 text-indigo-100">
            SmartLearn Pro combines structured courses, hands-on quizzes, and proctored assessments into one place.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-display font-semibold text-xl text-ink">SmartLearn <span className="text-indigo">Pro</span></span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
