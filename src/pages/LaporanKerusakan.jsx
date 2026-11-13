import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../api/client';

export default function LaporanKerusakan() {
  const [laporanList, setLaporanList] = useState([]);
  const [mesinList, setMesinList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPrioritas, setFilterPrioritas] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [foto, setFoto] = useState(null);
  const [formData, setFormData] = useState({ mesinId: '', jenisKerusakan: '', deskripsi: '', tanggalKejadian: new Date().toISOString().slice(0, 10), pelapor: '', prioritas: 'Sedang' });

  useEffect(() => {
    let active = true;
    Promise.all([api.laporan.list(), api.mesin.list()])
      .then(([reports, machines]) => {
        if (!active) return;
        setLaporanList(reports);
        setMesinList(machines);
        setFormData((current) => ({ ...current, mesinId: current.mesinId || machines[0]?.id || '' }));
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter data
  const filteredLaporan = useMemo(() => {
    return laporanList.filter(laporan => {
      const matchSearch = searchTerm === '' || 
        laporan.nomorLaporan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laporan.mesin?.namaMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        laporan.jenisKerusakan.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === '' || laporan.status === filterStatus;
      const matchPrioritas = filterPrioritas === '' || laporan.prioritas === filterPrioritas;
      
      return matchSearch && matchStatus && matchPrioritas;
    });
  }, [laporanList, searchTerm, filterStatus, filterPrioritas]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const created = await api.laporan.create(formData);
      let savedReport = created;
      if (foto) {
        try {
          await api.laporan.addPhoto(created.id, foto, 'Dokumentasi awal');
          savedReport = await api.laporan.get(created.id);
        } catch (photoError) {
          setNotice(`Laporan tersimpan, tetapi foto gagal diunggah: ${photoError.message}`);
        }
      } else {
        setNotice(`Laporan ${created.nomorLaporan} berhasil dibuat.`);
      }
      setLaporanList((current) => [savedReport, ...current]);
      setFormOpen(false);
      setFoto(null);
      setFormData((current) => ({ ...current, jenisKerusakan: '', deskripsi: '', pelapor: '' }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Hapus laporan ${report.nomorLaporan} beserta riwayat tindakannya?`)) return;
    setError('');
    setNotice('');
    try {
      await api.laporan.remove(report.id);
      setLaporanList((current) => current.filter((item) => item.id !== report.id));
      setNotice('Laporan berhasil dihapus.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Laporan Kerusakan</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Daftar laporan kerusakan mesin permainan
          </p>
        </div>
        <button onClick={() => { setError(''); setNotice(''); setFormOpen(true); }} className="btn btn-primary">
          + Buat Laporan Baru
        </button>
      </div>

      {(error || notice) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'}`} role="status">
          {error || notice}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pencarian
              </label>
              <input
                type="text"
                placeholder="Cari nomor laporan, mesin, atau jenis kerusakan..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="Baru">Baru</option>
                <option value="Menunggu Pemeriksaan">Menunggu Pemeriksaan</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                <option value="Menunggu Suku Cadang">Menunggu Suku Cadang</option>
                <option value="Selesai">Selesai</option>
                <option value="Tidak Dapat Diperbaiki">Tidak Dapat Diperbaiki</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioritas
              </label>
              <select
                className="input"
                value={filterPrioritas}
                onChange={(e) => setFilterPrioritas(e.target.value)}
              >
                <option value="">Semua Prioritas</option>
                <option value="Rendah">Rendah</option>
                <option value="Sedang">Sedang</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Menampilkan {filteredLaporan.length} dari {laporanList.length} laporan
        </p>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-navy-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nomor Laporan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mesin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jenis Kerusakan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prioritas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-800">
              {!loading && filteredLaporan.map((laporan) => (
                <tr
                  key={laporan.id}
                  className="hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/laporan/${laporan.id}`}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {laporan.nomorLaporan}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-navy-900 dark:text-white">
                      {laporan.mesin?.namaMesin}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {laporan.mesin?.kodeMesin}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {laporan.jenisKerusakan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      laporan.prioritas === 'Tinggi' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : laporan.prioritas === 'Sedang'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {laporan.prioritas}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(laporan.tanggalLaporan)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Kejadian: {formatDate(laporan.tanggalKejadian)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={laporan.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/laporan/${laporan.id}`} className="text-blue-600 dark:text-blue-400 hover:underline mr-3">Detail</Link>
                    <button onClick={() => handleDelete(laporan)} className="text-rose-600 dark:text-rose-400 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Memuat laporan...</div>}
          {!loading && filteredLaporan.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada data laporan yang sesuai dengan filter
              </p>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <div className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="report-form-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><p className="eyebrow mb-1">Laporan Kerusakan</p><h2 id="report-form-title" className="text-xl font-bold text-navy-900 dark:text-white">Buat Laporan Baru</h2></div>
              <button type="button" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setFormOpen(false)} aria-label="Tutup form">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mesin<select required className="input mt-1.5" value={formData.mesinId} onChange={(event) => setFormData({ ...formData, mesinId: event.target.value })}><option value="">Pilih mesin</option>{mesinList.map((machine) => <option key={machine.id} value={machine.id}>{machine.kodeMesin} · {machine.namaMesin}</option>)}</select></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Kerusakan<input required maxLength={120} className="input mt-1.5" value={formData.jenisKerusakan} onChange={(event) => setFormData({ ...formData, jenisKerusakan: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Kejadian<input required type="date" className="input mt-1.5" value={formData.tanggalKejadian} onChange={(event) => setFormData({ ...formData, tanggalKejadian: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pelapor<input required maxLength={100} className="input mt-1.5" value={formData.pelapor} onChange={(event) => setFormData({ ...formData, pelapor: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prioritas<select className="input mt-1.5" value={formData.prioritas} onChange={(event) => setFormData({ ...formData, prioritas: event.target.value })}><option>Rendah</option><option>Sedang</option><option>Tinggi</option></select></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Foto (opsional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="input mt-1.5" onChange={(event) => setFoto(event.target.files?.[0] || null)} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:col-span-2">Deskripsi Gejala<textarea required rows={4} maxLength={2000} className="input mt-1.5" value={formData.deskripsi} onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })} /></label>
              </div>
              {error && <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Laporan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
