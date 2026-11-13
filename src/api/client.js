// =============================================
// DUMMY MODE — tidak butuh backend/database
// Semua data disimpan in-memory di browser
// =============================================
import {
  mesinData,
  laporanData,
  dokumentasiData,
  tindakanData,
  sukuCadangData,
} from '../data/dummy.js';

// Salin data ke array mutable agar CRUD in-memory bisa jalan
let _mesin = mesinData.map((m) => ({
  ...m,
  createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
}));

let _laporan = laporanData.map((l) => ({
  ...l,
  tanggalKejadian: l.tanggalKejadian instanceof Date ? l.tanggalKejadian.toISOString() : l.tanggalKejadian,
  tanggalLaporan: l.tanggalLaporan instanceof Date ? l.tanggalLaporan.toISOString() : l.tanggalLaporan,
  createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : l.updatedAt,
}));

let _dokumentasi = dokumentasiData.map((d) => ({
  ...d,
  tanggalUpload: d.tanggalUpload instanceof Date ? d.tanggalUpload.toISOString() : d.tanggalUpload,
}));

let _tindakan = tindakanData.map((t) => ({
  ...t,
  tanggalPemeriksaan: t.tanggalPemeriksaan instanceof Date ? t.tanggalPemeriksaan.toISOString() : t.tanggalPemeriksaan,
  tanggalMulai: t.tanggalMulai instanceof Date ? t.tanggalMulai.toISOString() : t.tanggalMulai,
  tanggalSelesai: t.tanggalSelesai instanceof Date ? t.tanggalSelesai.toISOString() : t.tanggalSelesai,
  createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
}));

let _sukuCadang = sukuCadangData.map((sc) => ({
  ...sc,
  createdAt: sc.createdAt instanceof Date ? sc.createdAt.toISOString() : sc.createdAt,
}));

// --- helpers ---
const delay = () => new Promise((r) => setTimeout(r, 60));
const uuid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

function buildMesin(raw) {
  return { ...raw };
}

function buildLaporan(raw) {
  const mesin = _mesin.find((m) => m.id === raw.mesinId) || null;
  return { ...raw, mesin };
}

function buildLaporanDetail(raw) {
  const mesin = _mesin.find((m) => m.id === raw.mesinId) || null;
  const dokumentasi = _dokumentasi
    .filter((d) => d.laporanId === raw.id)
    .sort((a, b) => new Date(b.tanggalUpload) - new Date(a.tanggalUpload));
  const tindakan = _tindakan
    .filter((t) => t.laporanId === raw.id)
    .sort((a, b) => new Date(b.tanggalPemeriksaan) - new Date(a.tanggalPemeriksaan))
    .map((t) => ({
      ...t,
      sukuCadang: _sukuCadang
        .filter((sc) => sc.tindakanId === t.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
  return { ...raw, mesin, dokumentasi, tindakan };
}

function syncMachineStatus(mesinId) {
  const aktif = _laporan.filter(
    (l) => l.mesinId === mesinId && !['Selesai', 'Tidak Dapat Diperbaiki'].includes(l.status),
  );
  let kondisi = 'Normal';
  if (aktif.length > 0) {
    kondisi = aktif.some((l) => ['Dalam Perbaikan', 'Menunggu Suku Cadang'].includes(l.status))
      ? 'Dalam Perbaikan'
      : 'Rusak';
  }
  _mesin = _mesin.map((m) => (m.id === mesinId ? { ...m, statusKondisi: kondisi, updatedAt: now() } : m));
}

// --- API dummy ---
export const api = {
  mesin: {
    list: async () => {
      await delay();
      return _mesin.map(buildMesin).sort((a, b) => a.kodeMesin.localeCompare(b.kodeMesin));
    },
    create: async (data) => {
      await delay();
      if (!data.kodeMesin?.trim()) throw new Error('Kode mesin wajib diisi.');
      if (!data.namaMesin?.trim()) throw new Error('Nama mesin wajib diisi.');
      if (!data.kategori?.trim()) throw new Error('Kategori wajib diisi.');
      if (!data.lokasi?.trim()) throw new Error('Lokasi wajib diisi.');
      if (_mesin.some((m) => m.kodeMesin === data.kodeMesin.trim())) throw new Error('Kode mesin sudah digunakan.');
      const ts = now();
      const newMachine = {
        id: uuid(),
        kodeMesin: data.kodeMesin.trim(),
        namaMesin: data.namaMesin.trim(),
        kategori: data.kategori.trim(),
        lokasi: data.lokasi.trim(),
        statusKondisi: data.statusKondisi || 'Normal',
        catatan: data.catatan?.trim() || '',
        createdAt: ts,
        updatedAt: ts,
      };
      _mesin = [..._mesin, newMachine];
      return buildMesin(newMachine);
    },
    update: async (id, data) => {
      await delay();
      const current = _mesin.find((m) => m.id === id);
      if (!current) throw new Error('Mesin tidak ditemukan.');
      if (data.kodeMesin && _mesin.some((m) => m.id !== id && m.kodeMesin === data.kodeMesin.trim())) {
        throw new Error('Kode mesin sudah digunakan.');
      }
      const updated = {
        ...current,
        kodeMesin: data.kodeMesin?.trim() ?? current.kodeMesin,
        namaMesin: data.namaMesin?.trim() ?? current.namaMesin,
        kategori: data.kategori?.trim() ?? current.kategori,
        lokasi: data.lokasi?.trim() ?? current.lokasi,
        statusKondisi: data.statusKondisi || current.statusKondisi,
        catatan: data.catatan !== undefined ? String(data.catatan).trim() : current.catatan,
        updatedAt: now(),
      };
      _mesin = _mesin.map((m) => (m.id === id ? updated : m));
      return buildMesin(updated);
    },
    remove: async (id) => {
      await delay();
      if (!_mesin.find((m) => m.id === id)) throw new Error('Mesin tidak ditemukan.');
      if (_laporan.some((l) => l.mesinId === id)) throw new Error('Mesin yang sudah memiliki laporan tidak dapat dihapus.');
      _mesin = _mesin.filter((m) => m.id !== id);
      return null;
    },
  },

  laporan: {
    list: async () => {
      await delay();
      return _laporan
        .sort((a, b) => new Date(b.tanggalLaporan) - new Date(a.tanggalLaporan))
        .map(buildLaporan);
    },
    get: async (id) => {
      await delay();
      const raw = _laporan.find((l) => l.id === id);
      if (!raw) throw new Error('Laporan tidak ditemukan.');
      return buildLaporanDetail(raw);
    },
    create: async (data) => {
      await delay();
      if (!data.mesinId?.trim()) throw new Error('Mesin wajib dipilih.');
      if (!_mesin.find((m) => m.id === data.mesinId)) throw new Error('Mesin yang dipilih tidak ditemukan.');
      if (!data.jenisKerusakan?.trim()) throw new Error('Jenis kerusakan wajib diisi.');
      if (!data.deskripsi?.trim()) throw new Error('Deskripsi wajib diisi.');
      if (!data.tanggalKejadian) throw new Error('Tanggal kejadian wajib diisi.');
      if (!data.pelapor?.trim()) throw new Error('Pelapor wajib diisi.');
      const existing = _laporan.filter((l) => l.nomorLaporan.startsWith('TZ-RK-'));
      const nums = existing.map((l) => parseInt(l.nomorLaporan.slice(6))).filter((n) => !isNaN(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      const ts = now();
      const newReport = {
        id: uuid(),
        nomorLaporan: `TZ-RK-${String(next).padStart(4, '0')}`,
        mesinId: data.mesinId,
        jenisKerusakan: data.jenisKerusakan.trim(),
        deskripsi: data.deskripsi.trim(),
        tanggalKejadian: data.tanggalKejadian,
        tanggalLaporan: data.tanggalLaporan || ts,
        pelapor: data.pelapor.trim(),
        prioritas: data.prioritas || 'Sedang',
        status: 'Baru',
        createdAt: ts,
        updatedAt: ts,
      };
      _laporan = [..._laporan, newReport];
      syncMachineStatus(newReport.mesinId);
      return buildLaporanDetail(newReport);
    },
    update: async (id, data) => {
      await delay();
      const current = _laporan.find((l) => l.id === id);
      if (!current) throw new Error('Laporan tidak ditemukan.');
      const updated = { ...current, ...data, updatedAt: now() };
      _laporan = _laporan.map((l) => (l.id === id ? updated : l));
      syncMachineStatus(updated.mesinId);
      return buildLaporanDetail(updated);
    },
    remove: async (id) => {
      await delay();
      const current = _laporan.find((l) => l.id === id);
      if (!current) throw new Error('Laporan tidak ditemukan.');
      _laporan = _laporan.filter((l) => l.id !== id);
      _dokumentasi = _dokumentasi.filter((d) => d.laporanId !== id);
      _tindakan = _tindakan.filter((t) => t.laporanId !== id);
      syncMachineStatus(current.mesinId);
      return null;
    },
    addPhoto: async (id, file, keterangan) => {
      await delay();
      if (!_laporan.find((l) => l.id === id)) throw new Error('Laporan tidak ditemukan.');
      const previewUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Gagal membaca file.'));
        reader.readAsDataURL(file);
      });
      const newDoc = {
        id: uuid(),
        laporanId: id,
        namaFile: file.name,
        previewUrl,
        keterangan: keterangan?.trim() || '',
        tanggalUpload: now(),
      };
      _dokumentasi = [newDoc, ..._dokumentasi];
      return newDoc;
    },
    removePhoto: async (id) => {
      await delay();
      if (!_dokumentasi.find((d) => d.id === id)) throw new Error('Dokumentasi tidak ditemukan.');
      _dokumentasi = _dokumentasi.filter((d) => d.id !== id);
      return null;
    },
    addAction: async (laporanId, data) => {
      await delay();
      const report = _laporan.find((l) => l.id === laporanId);
      if (!report) throw new Error('Laporan tidak ditemukan.');
      if (!data.hasilPemeriksaan?.trim()) throw new Error('Hasil pemeriksaan wajib diisi.');
      if (!data.tindakanServis?.trim()) throw new Error('Tindakan servis wajib diisi.');
      if (!data.teknisi?.trim()) throw new Error('Teknisi wajib diisi.');
      const ts = now();
      const newAction = {
        id: uuid(),
        laporanId,
        tanggalPemeriksaan: data.tanggalPemeriksaan || ts,
        hasilPemeriksaan: data.hasilPemeriksaan.trim(),
        tindakanServis: data.tindakanServis.trim(),
        estimasiDurasi: Number(data.estimasiDurasi || 0),
        tanggalMulai: data.tanggalMulai || null,
        tanggalSelesai: data.tanggalSelesai || null,
        teknisi: data.teknisi.trim(),
        status: data.status || 'Dalam Perbaikan',
        createdAt: ts,
        updatedAt: ts,
      };
      _tindakan = [newAction, ..._tindakan];
      // Tambah suku cadang jika ada
      if (Array.isArray(data.sukuCadang)) {
        for (const sc of data.sukuCadang) {
          if (sc.namaSukuCadang?.trim()) {
            _sukuCadang = [..._sukuCadang, {
              id: uuid(),
              tindakanId: newAction.id,
              namaSukuCadang: sc.namaSukuCadang.trim(),
              jumlah: Number(sc.jumlah || 1),
              catatan: sc.catatan?.trim() || '',
              createdAt: ts,
            }];
          }
        }
      }
      // Update status laporan
      _laporan = _laporan.map((l) => l.id === laporanId ? { ...l, status: newAction.status, updatedAt: ts } : l);
      syncMachineStatus(report.mesinId);
      return buildLaporanDetail(_laporan.find((l) => l.id === laporanId));
    },
  },
};