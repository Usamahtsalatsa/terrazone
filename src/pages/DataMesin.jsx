import { useState, useMemo, useEffect } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import { api } from '../api/client';

export default function DataMesin() {
  const [mesinList, setMesinList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ kodeMesin: '', namaMesin: '', kategori: '', lokasi: '', statusKondisi: 'Normal', catatan: '' });

  useEffect(() => {
    let active = true;
    api.mesin.list()
      .then((machines) => { if (active) setMesinList(machines); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Filter data
  const filteredMesin = useMemo(() => {
    return mesinList.filter(mesin => {
      const matchSearch = searchTerm === '' || 
        mesin.namaMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mesin.kodeMesin.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchKategori = filterKategori === '' || mesin.kategori === filterKategori;
      const matchStatus = filterStatus === '' || mesin.statusKondisi === filterStatus;
      
      return matchSearch && matchKategori && matchStatus;
    });
  }, [mesinList, searchTerm, filterKategori, filterStatus]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(mesinList.map(m => m.kategori))];
  }, [mesinList]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ kodeMesin: '', namaMesin: '', kategori: '', lokasi: '', statusKondisi: 'Normal', catatan: '' });
    setError('');
    setFormOpen(true);
  };

  const openEditForm = (machine) => {
    setEditingId(machine.id);
    setFormData({ kodeMesin: machine.kodeMesin, namaMesin: machine.namaMesin, kategori: machine.kategori, lokasi: machine.lokasi, statusKondisi: machine.statusKondisi, catatan: machine.catatan || '' });
    setError('');
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const savedMachine = editingId
        ? await api.mesin.update(editingId, formData)
        : await api.mesin.create(formData);
      setMesinList((current) => editingId
        ? current.map((machine) => machine.id === editingId ? savedMachine : machine)
        : [...current, savedMachine]);
      setNotice(editingId ? 'Data mesin berhasil diperbarui.' : 'Mesin berhasil ditambahkan.');
      setFormOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = async (machine) => {
    if (!window.confirm(`Hapus ${machine.namaMesin}? Mesin yang sudah memiliki laporan tidak dapat dihapus.`)) return;
    setError('');
    setNotice('');
    try {
      await api.mesin.remove(machine.id);
      setMesinList((current) => current.filter((item) => item.id !== machine.id));
      setNotice('Data mesin berhasil dihapus.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Data Mesin</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola data mesin permainan Terra Zone
          </p>
        </div>
        <button onClick={openCreateForm} className="btn btn-primary">
          + Tambah Mesin
        </button>
      </div>

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
                placeholder="Cari nama atau kode mesin..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
              </label>
              <select
                className="input"
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                <option value="Normal">Normal</option>
                <option value="Rusak">Rusak</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Menampilkan {filteredMesin.length} dari {mesinList.length} mesin
        </p>
      </div>

      {(error || notice) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${error ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'}`} role="status">
          {error || notice}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-navy-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kode Mesin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nama Mesin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lokasi
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
              {!loading && filteredMesin.map((mesin) => (
                <tr
                  key={mesin.id}
                  className="hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-navy-900 dark:text-white">
                      {mesin.kodeMesin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-navy-900 dark:text-white">
                        {mesin.namaMesin}
                      </div>
                      {mesin.catatan && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {mesin.catatan}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {mesin.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {mesin.lokasi}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={mesin.statusKondisi} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => openEditForm(mesin)} className="text-blue-600 dark:text-blue-400 hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(mesin)} className="text-red-600 dark:text-red-400 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Memuat data mesin...</div>}
          {!loading && filteredMesin.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada data mesin yang sesuai dengan filter
              </p>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="machine-form-title">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow mb-1">Data Aset</p>
                <h2 id="machine-form-title" className="text-xl font-bold text-navy-900 dark:text-white">{editingId ? 'Edit Mesin' : 'Tambah Mesin'}</h2>
              </div>
              <button type="button" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setFormOpen(false)} aria-label="Tutup form">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kode Mesin<input required maxLength={30} className="input mt-1.5" value={formData.kodeMesin} onChange={(event) => setFormData({ ...formData, kodeMesin: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Mesin<input required maxLength={100} className="input mt-1.5" value={formData.namaMesin} onChange={(event) => setFormData({ ...formData, namaMesin: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori<input required maxLength={60} className="input mt-1.5" value={formData.kategori} onChange={(event) => setFormData({ ...formData, kategori: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi<input required maxLength={100} className="input mt-1.5" value={formData.lokasi} onChange={(event) => setFormData({ ...formData, lokasi: event.target.value })} /></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Kondisi<select className="input mt-1.5" value={formData.statusKondisi} onChange={(event) => setFormData({ ...formData, statusKondisi: event.target.value })}><option>Normal</option><option>Rusak</option><option>Dalam Perbaikan</option></select></label>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Catatan<input maxLength={300} className="input mt-1.5" value={formData.catatan} onChange={(event) => setFormData({ ...formData, catatan: event.target.value })} /></label>
              </div>
              {error && <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Simpan Perubahan' : 'Simpan Mesin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
