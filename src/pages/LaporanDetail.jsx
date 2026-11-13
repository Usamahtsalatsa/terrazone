import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../api/client';

export default function LaporanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [actionData, setActionData] = useState({ hasilPemeriksaan: '', tindakanServis: '', estimasiDurasi: '', teknisi: '', status: 'Dalam Perbaikan', namaSukuCadang: '', jumlahSukuCadang: '1' });

  useEffect(() => {
    let active = true;
    api.laporan.get(id)
      .then((report) => {
        if (!active) return;
        setLaporan(report);
        setError('');
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const reloadReport = async () => {
    const report = await api.laporan.get(id);
    setLaporan(report);
  };

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    if (!photo) return;
    setError('');
    try {
      await api.laporan.addPhoto(id, photo, 'Dokumentasi tambahan');
      await reloadReport();
      setPhoto(null);
      event.target.reset();
      setNotice('Foto berhasil disimpan di server lokal.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handlePhotoDelete = async (document) => {
    if (!window.confirm(`Hapus foto ${document.namaFile}?`)) return;
    try {
      await api.laporan.removePhoto(document.id);
      await reloadReport();
      setNotice('Foto berhasil dihapus.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleActionSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const parts = actionData.namaSukuCadang.trim()
      ? [{ namaSukuCadang: actionData.namaSukuCadang.trim(), jumlah: Number(actionData.jumlahSukuCadang) }]
      : [];
    try {
      await api.laporan.addAction(id, {
        hasilPemeriksaan: actionData.hasilPemeriksaan,
        tindakanServis: actionData.tindakanServis,
        estimasiDurasi: Number(actionData.estimasiDurasi || 0),
        teknisi: actionData.teknisi,
        status: actionData.status,
        tanggalMulai: new Date().toISOString(),
        sukuCadang: parts,
      });
      await reloadReport();
      setActionOpen(false);
      setActionData({ hasilPemeriksaan: '', tindakanServis: '', estimasiDurasi: '', teknisi: '', status: 'Dalam Perbaikan', namaSukuCadang: '', jumlahSukuCadang: '1' });
      setNotice('Tindakan perbaikan berhasil disimpan.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const dokumentasi = laporan?.dokumentasi || [];
  const tindakanList = laporan?.tindakan || [];
  const mesin = laporan?.mesin;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || (laporan && laporan.id !== id)) {
    return <div className="card p-6 text-sm text-slate-500 dark:text-slate-400">Memuat detail laporan...</div>;
  }

  if (!laporan || laporan.id !== id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{error || 'Laporan tidak ditemukan'}</p>
        <button onClick={() => navigate('/laporan')} className="btn btn-primary mt-4">
          Kembali ke Daftar Laporan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || notice) && <div className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'}`} role="status">{error || notice}</div>}
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/laporan')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
            Detail Laporan {laporan.nomorLaporan}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Informasi lengkap laporan kerusakan
          </p>
        </div>
        <StatusBadge status={laporan.status} />
      </div>

      {/* Laporan Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">
                Informasi Laporan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Mesin</label>
                  <p className="font-medium text-navy-900 dark:text-white">
                    {mesin?.namaMesin}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {mesin?.kodeMesin} • {mesin?.lokasi}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Jenis Kerusakan</label>
                  <p className="font-medium text-navy-900 dark:text-white">
                    {laporan.jenisKerusakan}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Tanggal Kejadian</label>
                  <p className="font-medium text-navy-900 dark:text-white">
                        {formatDate(laporan.tanggalKejadian)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Tanggal Laporan</label>
                  <p className="font-medium text-navy-900 dark:text-white">
                    {formatDate(laporan.tanggalLaporan)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Pelapor</label>
                  <p className="font-medium text-navy-900 dark:text-white">
                    {laporan.pelapor}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Prioritas</label>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    laporan.prioritas === 'Tinggi' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : laporan.prioritas === 'Sedang'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {laporan.prioritas}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Deskripsi</label>
                  <p className="text-navy-900 dark:text-white mt-1">
                    {laporan.deskripsi}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dokumentasi Foto */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">
                Dokumentasi Foto ({dokumentasi.length})
              </h2>
              {dokumentasi.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dokumentasi.map((dok) => (
                    <div key={dok.id} className="group relative">
                      <img
                        src={dok.previewUrl.startsWith('/uploads/') ? dok.previewUrl : dok.previewUrl}
                        alt={dok.keterangan || dok.namaFile}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-navy-700"
                      />
                      <button type="button" onClick={() => handlePhotoDelete(dok)} className="absolute right-2 top-2 rounded bg-slate-950/75 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">Hapus</button>
                      {dok.keterangan && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {dok.keterangan}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada dokumentasi foto
                </p>
              )}
              <form onSubmit={handlePhotoUpload} className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">Tambah Foto<input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="input mt-1.5" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></label>
                <button type="submit" className="btn btn-secondary">Unggah Foto</button>
              </form>
            </div>
          </div>

          {/* Riwayat Tindakan */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">
                Riwayat Penanganan ({tindakanList.length})
              </h2>
              {tindakanList.length > 0 ? (
                <div className="space-y-4">
                  {tindakanList.map((tindakan, index) => (
                    <div
                      key={tindakan.id}
                      className="p-4 bg-gray-50 dark:bg-navy-800/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-navy-900 dark:text-white">
                            Tindakan #{index + 1}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(tindakan.tanggalPemeriksaan)}
                          </p>
                        </div>
                        <StatusBadge status={tindakan.status} />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Teknisi:</span>
                          <span className="ml-2 text-navy-900 dark:text-white font-medium">
                            {tindakan.teknisi}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Hasil Pemeriksaan:</span>
                          <p className="text-navy-900 dark:text-white mt-1">
                            {tindakan.hasilPemeriksaan}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Tindakan Servis:</span>
                          <p className="text-navy-900 dark:text-white mt-1">
                            {tindakan.tindakanServis}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Estimasi Durasi:</span>
                            <span className="ml-2 text-navy-900 dark:text-white">
                              {tindakan.estimasiDurasi} jam
                            </span>
                          </div>
                          {tindakan.tanggalSelesai && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Tanggal Selesai:</span>
                              <span className="ml-2 text-navy-900 dark:text-white">
                                {formatDate(tindakan.tanggalSelesai)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {tindakan.sukuCadang && tindakan.sukuCadang.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-navy-700">
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Suku Cadang:</p>
                            <div className="space-y-1">
                              {tindakan.sukuCadang.map((sc) => (
                                <div key={sc.id} className="flex justify-between text-sm">
                                  <span className="text-navy-900 dark:text-white">
                                    {sc.namaSukuCadang}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Qty: {sc.jumlah}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Belum ada riwayat penanganan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
                Aksi
              </h3>
              <div className="space-y-2">
                <button onClick={() => { setError(''); setActionOpen(true); }} className="w-full btn btn-primary">
                  + Tambah Tindakan
                </button>
                <button onClick={() => navigate('/laporan')} className="w-full btn btn-secondary">
                  Kembali ke Laporan
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
                Informasi Mesin
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status Mesin:</span>
                  <div className="mt-1">
                    <StatusBadge status={mesin?.statusKondisi} />
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Kategori:</span>
                  <p className="text-navy-900 dark:text-white mt-1">
                    {mesin?.kategori}
                  </p>
                </div>
                <Link
                  to="/mesin"
                  className="block text-blue-600 dark:text-blue-400 hover:underline text-sm mt-3"
                >
                  Lihat Detail Mesin →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setActionOpen(false); }}>
          <div className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="action-form-title">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="eyebrow mb-1">Riwayat Perbaikan</p><h2 id="action-form-title" className="text-xl font-bold text-navy-900 dark:text-white">Tambah Tindakan</h2></div><button type="button" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setActionOpen(false)} aria-label="Tutup form">✕</button></div>
            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Teknisi<input required maxLength={100} className="input mt-1.5" value={actionData.teknisi} onChange={(event) => setActionData({ ...actionData, teknisi: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Estimasi Durasi (jam)<input type="number" min="0" step="0.5" className="input mt-1.5" value={actionData.estimasiDurasi} onChange={(event) => setActionData({ ...actionData, estimasiDurasi: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status<select className="input mt-1.5" value={actionData.status} onChange={(event) => setActionData({ ...actionData, status: event.target.value })}>{['Menunggu Pemeriksaan', 'Dalam Perbaikan', 'Menunggu Suku Cadang', 'Selesai', 'Tidak Dapat Diperbaiki'].map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Suku Cadang (opsional)<input maxLength={100} className="input mt-1.5" value={actionData.namaSukuCadang} onChange={(event) => setActionData({ ...actionData, namaSukuCadang: event.target.value })} /></label>
                {actionData.namaSukuCadang && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah<input required type="number" min="1" step="1" className="input mt-1.5" value={actionData.jumlahSukuCadang} onChange={(event) => setActionData({ ...actionData, jumlahSukuCadang: event.target.value })} /></label>}
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:col-span-2">Hasil Pemeriksaan<textarea required rows={3} maxLength={2000} className="input mt-1.5" value={actionData.hasilPemeriksaan} onChange={(event) => setActionData({ ...actionData, hasilPemeriksaan: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:col-span-2">Tindakan Servis<textarea required rows={3} maxLength={2000} className="input mt-1.5" value={actionData.tindakanServis} onChange={(event) => setActionData({ ...actionData, tindakanServis: event.target.value })} /></label>
              </div>
              {error && <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"><button type="button" onClick={() => setActionOpen(false)} className="btn btn-secondary">Batal</button><button type="submit" className="btn btn-primary">Simpan Tindakan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
