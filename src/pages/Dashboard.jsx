import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StatsCard from '../components/common/StatsCard';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../api/client';

export default function Dashboard() {
  const [allLaporan, setAllLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.laporan.list()
      .then((reports) => {
        if (active) setAllLaporan(reports);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => allLaporan.reduce((result, report) => {
    result.total += 1;
    if (report.status === 'Baru') result.baru += 1;
    if (report.status === 'Menunggu Pemeriksaan') result.menungguPemeriksaan += 1;
    if (report.status === 'Dalam Perbaikan') result.dalamPerbaikan += 1;
    if (report.status === 'Menunggu Suku Cadang') result.menungguSukuCadang += 1;
    if (report.status === 'Selesai') result.selesai += 1;
    if (report.status === 'Tidak Dapat Diperbaiki') result.tidakDapatDiperbaiki += 1;
    return result;
  }, { total: 0, baru: 0, menungguPemeriksaan: 0, dalamPerbaikan: 0, menungguSukuCadang: 0, selesai: 0, tidakDapatDiperbaiki: 0 }), [allLaporan]);
  
  // Get recent reports (last 5)
  const recentReports = useMemo(() => {
    return [...allLaporan]
      .sort((a, b) => new Date(b.tanggalLaporan) - new Date(a.tanggalLaporan))
      .slice(0, 5)
      .map(laporan => ({ ...laporan }));
  }, [allLaporan]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="card p-6 text-sm text-slate-500 dark:text-slate-400">Memuat ringkasan...</div>;
  }

  if (error) {
    return <div className="card border-rose-200 p-6 text-sm text-rose-700 dark:border-rose-900 dark:text-rose-300">{error}</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">Monitoring Harian</p>
          <h1 className="mb-1 text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
          Ringkasan kondisi laporan kerusakan dan perbaikan mesin
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Data contoh
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Laporan"
          value={stats.total}
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8v-6" /></svg>}
          color="blue"
        />
        <StatsCard
          title="Laporan Baru"
          value={stats.baru + stats.menungguPemeriksaan}
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" /></svg>}
          color="yellow"
        />
        <StatsCard
          title="Dalam Perbaikan"
          value={stats.dalamPerbaikan + stats.menungguSukuCadang}
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m14.7 6.3 3 3m-9.4 9.4 8.5-8.5a3.5 3.5 0 0 0-4.9-4.9l-8.5 8.5a2.1 2.1 0 0 0 3 3Z" /></svg>}
          color="orange"
        />
        <StatsCard
          title="Selesai"
          value={stats.selesai}
          icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m5 12 4 4L19 6" /></svg>}
          color="green"
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="card">
          <div className="card-body">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Ringkasan</p>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white">Distribusi Status</h2>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{stats.total} laporan</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Baru', value: stats.baru, color: 'bg-blue-500' },
                { label: 'Menunggu Pemeriksaan', value: stats.menungguPemeriksaan, color: 'bg-yellow-500' },
                { label: 'Dalam Perbaikan', value: stats.dalamPerbaikan, color: 'bg-orange-500' },
                { label: 'Menunggu Suku Cadang', value: stats.menungguSukuCadang, color: 'bg-purple-500' },
                { label: 'Selesai', value: stats.selesai, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex justify-between gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                      <span className="text-sm font-semibold tabular-nums text-navy-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="card-body">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow mb-1">Aktivitas</p>
                <h2 className="text-lg font-bold text-navy-900 dark:text-white">Laporan Terbaru</h2>
              </div>
              <Link to="/laporan" className="rounded-md px-2 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
                Lihat Semua <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-blue-700 dark:bg-slate-800 dark:text-cyan-300">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3.75h7l4 4V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 6 20V4.5a.75.75 0 0 1 1-.75Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 4v4h4M9 13h6m-6 3h6" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy-900 dark:text-white">{report.mesin?.namaMesin}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{report.nomorLaporan} <span className="px-1">·</span> {report.jenisKerusakan}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-[52px] sm:shrink-0 sm:pl-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(report.tanggalLaporan)}
                    </p>
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-body">
          <div className="mb-4">
            <p className="eyebrow mb-1">Navigasi</p>
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">Aksi Cepat</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link
              to="/laporan"
              className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-700 dark:hover:border-blue-500/60 dark:hover:bg-blue-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:group-hover:bg-blue-500/25">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white text-sm">
                    Buat Laporan Baru
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Laporkan kerusakan mesin
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/mesin"
              className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-cyan-500 hover:bg-cyan-50/60 dark:border-slate-700 dark:hover:border-cyan-500/60 dark:hover:bg-cyan-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 transition-colors group-hover:bg-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:group-hover:bg-cyan-500/25">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 9h12a3 3 0 0 1 2.9 3.75l-.6 2.4A2.5 2.5 0 0 1 18 17h-1l-2-2H9l-2 2H6a2.5 2.5 0 0 1-2.3-1.85l-.6-2.4A3 3 0 0 1 6 9Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 11v4m-2-2h4m6-1h.01M18 14h.01" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white text-sm">
                    Kelola Data Mesin
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Tambah atau edit mesin
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/report"
              className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-emerald-500 hover:bg-emerald-50/60 dark:border-slate-700 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:group-hover:bg-emerald-500/25">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3.75h7l4 4V20a.75.75 0 0 1-.75.75h-10.5A.75.75 0 0 1 6 20V4.5a.75.75 0 0 1 1-.75Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 4v4h4M9 16v-3m3 3v-5m3 5v-2" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white text-sm">
                    Ekspor Laporan
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Download Excel/PDF
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
