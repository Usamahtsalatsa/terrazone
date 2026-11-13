// Simple fallback App jika ada error dengan routing
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function SimpleApp() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
              Terra Zone Maintenance System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistem frontend sedang dalam proses setup
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-all"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            ⚠️ Dependencies Need to be Installed
          </h2>
          <p className="text-yellow-800 dark:text-yellow-300 mb-4">
            Untuk menjalankan aplikasi lengkap, install dependencies terlebih dahulu.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800 dark:text-yellow-300 text-sm">
            <li>Stop dev server (Ctrl+C)</li>
            <li>Run: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">npm install</code></li>
            <li>Atau jalankan: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">install-deps.bat</code></li>
            <li>Run: <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">npm run dev</code></li>
          </ol>
        </div>

        {/* Features Card */}
        <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">
            ✨ Fitur yang Sudah Dibangun
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-2">📊 Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stats cards, distribusi status, laporan terbaru
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-2">🎮 Data Mesin</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tabel dengan filter, search, dan status badges
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-2">📝 Laporan Kerusakan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daftar laporan dengan filter lengkap
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-lg">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-2">📷 Detail Laporan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dokumentasi foto dan riwayat perbaikan
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">
            🛠️ Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {['React 19.3', 'Vite 8.3', 'Tailwind CSS', 'React Router', 'Dark Mode'].map(tech => (
              <span
                key={tech}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SimpleApp />
    </ThemeProvider>
  );
}

export default App;
