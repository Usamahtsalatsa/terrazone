export default function StatsCard({ title, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-400/10',
    green: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-400/10',
    yellow: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-400/10',
    orange: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-400/10',
    red: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-400/10',
  };

  return (
    <div className="card group relative overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500" />
      <div className="p-4 pt-5 sm:p-5 sm:pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold leading-none text-navy-900 dark:text-white">{value}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClasses[color]}`} aria-hidden="true">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
