import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import DataMesin from './pages/DataMesin';
import LaporanKerusakan from './pages/LaporanKerusakan';
import LaporanDetail from './pages/LaporanDetail';

// Placeholder pages
function PenangananPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Penanganan & Perbaikan</h1>
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman ini akan menampilkan daftar laporan yang membutuhkan penanganan dan riwayat perbaikan.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Laporan & Ekspor</h1>
      <div className="card">
        <div className="card-body">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman ini akan menampilkan filter laporan dan tombol ekspor Excel/PDF.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mesin" element={<DataMesin />} />
            <Route path="laporan" element={<LaporanKerusakan />} />
            <Route path="laporan/:id" element={<LaporanDetail />} />
            <Route path="perbaikan" element={<PenangananPage />} />
            <Route path="report" element={<ReportPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
