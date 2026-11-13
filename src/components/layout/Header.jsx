import { useTheme } from '../../contexts/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-[#0d1928]/95 sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 hidden sm:block">Terra Zone / Sistem Operasional</p>
          <h1 className="text-sm font-bold text-navy-900 dark:text-white sm:text-base">
            Maintenance System
          </h1>
          <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
            Sistem Pengelolaan Laporan Kerusakan & Perbaikan Mesin
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
            aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon
              <svg className="w-6 h-6 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* User Info (dummy) */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700 sm:pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-blue-500">
              A
            </div>
            <span className="hidden text-sm font-semibold text-navy-900 dark:text-white sm:inline">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
