import { Link, useLocation } from 'react-router-dom';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'mesin',
    label: 'Data Mesin',
    path: '/mesin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    id: 'laporan',
    label: 'Laporan Kerusakan',
    path: '/laporan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    id: 'perbaikan',
    label: 'Penanganan & Perbaikan',
    path: '/perbaikan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'report',
    label: 'Laporan',
    path: '/report',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sticky top-0 z-20 min-h-screen w-[68px] shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0d1928] sm:w-[76px] lg:w-64">
      <div className="p-2 sm:p-3 lg:p-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3 px-0 py-2 lg:justify-start lg:px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white shadow-md shadow-blue-900/20">
            TZ
          </div>
          <div className="hidden min-w-0 lg:block">
            <h2 className="font-bold text-navy-900 dark:text-white">Terra Zone</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                aria-label={item.label}
                title={item.label}
                className={`flex min-h-11 items-center justify-center gap-3 rounded-lg px-2 transition-all duration-200 lg:justify-start lg:px-3 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                  {item.icon}
                </span>
                <span className="hidden text-sm lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="mt-8 hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 dark:border-slate-800 dark:bg-slate-900/60 lg:block">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Data Contoh
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Sistem frontend React + Vite dengan data dummy
          </p>
        </div>
      </div>
    </aside>
  );
}
