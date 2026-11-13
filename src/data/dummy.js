// Helper untuk generate ID sederhana
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mesin (Arcade Machines)
export const mesinData = [
  {
    id: 'mesin-1',
    kodeMesin: 'TZ-M-001',
    namaMesin: 'Air Hockey',
    kategori: 'Arcade',
    lokasi: 'Area Arcade A',
    statusKondisi: 'Normal',
    catatan: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'mesin-2',
    kodeMesin: 'TZ-M-002',
    namaMesin: 'Claw Machine Premium',
    kategori: 'Prize',
    lokasi: 'Area Arcade A',
    statusKondisi: 'Rusak',
    catatan: 'Mekanisme hadiah bermasalah',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: 'mesin-3',
    kodeMesin: 'TZ-M-003',
    namaMesin: 'Basketball Arcade',
    kategori: 'Arcade',
    lokasi: 'Area Arcade B',
    statusKondisi: 'Normal',
    catatan: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'mesin-4',
    kodeMesin: 'TZ-M-004',
    namaMesin: 'Racing Simulator GT',
    kategori: 'Racing',
    lokasi: 'Area Racing',
    statusKondisi: 'Dalam Perbaikan',
    catatan: 'Pedal bermasalah',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 'mesin-5',
    kodeMesin: 'TZ-M-005',
    namaMesin: 'Motorcycle Racing',
    kategori: 'Racing',
    lokasi: 'Area Racing',
    statusKondisi: 'Normal',
    catatan: '',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// Laporan Kerusakan
export const laporanData = [
  {
    id: 'laporan-1',
    nomorLaporan: 'TZ-RK-0001',
    mesinId: 'mesin-2',
    jenisKerusakan: 'Mekanisme Hadiah Macet',
    deskripsi: 'Mekanisme claw tidak dapat mengangkat hadiah dengan baik. Sering terlepas di tengah jalan.',
    tanggalKejadian: new Date('2025-01-08'),
    tanggalLaporan: new Date('2025-01-08'),
    pelapor: 'Budi Santoso',
    prioritas: 'Tinggi',
    status: 'Dalam Perbaikan',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-09'),
  },
  {
    id: 'laporan-2',
    nomorLaporan: 'TZ-RK-0002',
    mesinId: 'mesin-4',
    jenisKerusakan: 'Pedal Bermasalah',
    deskripsi: 'Pedal gas tidak merespons dengan baik, terkadang macet di posisi tertekan.',
    tanggalKejadian: new Date('2025-01-07'),
    tanggalLaporan: new Date('2025-01-07'),
    pelapor: 'Siti Aminah',
    prioritas: 'Sedang',
    status: 'Dalam Perbaikan',
    createdAt: new Date('2025-01-07'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 'laporan-3',
    nomorLaporan: 'TZ-RK-0003',
    mesinId: 'mesin-1',
    jenisKerusakan: 'Sensor Skor Tidak Akurat',
    deskripsi: 'Sensor skor terkadang tidak mendeteksi gol dengan benar.',
    tanggalKejadian: new Date('2025-01-05'),
    tanggalLaporan: new Date('2025-01-05'),
    pelapor: 'Ahmad Rizki',
    prioritas: 'Rendah',
    status: 'Selesai',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-06'),
  },
];

// Dokumentasi (Photos)
export const dokumentasiData = [
  {
    id: 'dok-1',
    laporanId: 'laporan-1',
    namaFile: 'claw-machine-broken.jpg',
    previewUrl: 'https://via.placeholder.com/400x300/1e40af/ffffff?text=Claw+Machine',
    keterangan: 'Mekanisme claw tampak aus',
    tanggalUpload: new Date('2025-01-08'),
  },
  {
    id: 'dok-2',
    laporanId: 'laporan-1',
    namaFile: 'claw-detail.jpg',
    previewUrl: 'https://via.placeholder.com/400x300/0891b2/ffffff?text=Claw+Detail',
    keterangan: 'Detail bagian claw yang bermasalah',
    tanggalUpload: new Date('2025-01-08'),
  },
  {
    id: 'dok-3',
    laporanId: 'laporan-2',
    namaFile: 'pedal-issue.jpg',
    previewUrl: 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Pedal+Issue',
    keterangan: 'Pedal macet di posisi bawah',
    tanggalUpload: new Date('2025-01-07'),
  },
  {
    id: 'dok-4',
    laporanId: 'laporan-3',
    namaFile: 'sensor-air-hockey.jpg',
    previewUrl: 'https://via.placeholder.com/400x300/16a34a/ffffff?text=Sensor',
    keterangan: 'Sensor skor yang bermasalah',
    tanggalUpload: new Date('2025-01-05'),
  },
];

// Tindakan Perbaikan
export const tindakanData = [
  {
    id: 'tindakan-1',
    laporanId: 'laporan-1',
    tanggalPemeriksaan: new Date('2025-01-09'),
    hasilPemeriksaan: 'Ditemukan bagian claw yang aus dan perlu diganti. Motor claw masih berfungsi baik.',
    tindakanServis: 'Penggantian bagian claw dengan yang baru dan kalibrasi ulang kekuatan cengkeraman.',
    estimasiDurasi: 4, // hours
    tanggalMulai: new Date('2025-01-09'),
    tanggalSelesai: null,
    teknisi: 'Andi Wijaya',
    status: 'Dalam Perbaikan',
    createdAt: new Date('2025-01-09'),
    updatedAt: new Date('2025-01-09'),
  },
  {
    id: 'tindakan-2',
    laporanId: 'laporan-2',
    tanggalPemeriksaan: new Date('2025-01-08'),
    hasilPemeriksaan: 'Pedal bermasalah karena sensor posisi yang rusak.',
    tindakanServis: 'Pembersihan dan penggantian sensor posisi pedal gas.',
    estimasiDurasi: 3,
    tanggalMulai: new Date('2025-01-08'),
    tanggalSelesai: null,
    teknisi: 'Andi Wijaya',
    status: 'Menunggu Suku Cadang',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 'tindakan-3',
    laporanId: 'laporan-3',
    tanggalPemeriksaan: new Date('2025-01-05'),
    hasilPemeriksaan: 'Sensor kotor dan perlu dibersihkan. Tidak ada kerusakan hardware.',
    tindakanServis: 'Pembersihan sensor dan kalibrasi ulang.',
    estimasiDurasi: 2,
    tanggalMulai: new Date('2025-01-05'),
    tanggalSelesai: new Date('2025-01-06'),
    teknisi: 'Dewi Lestari',
    status: 'Selesai',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-06'),
  },
];

// Suku Cadang
export const sukuCadangData = [
  {
    id: 'sc-1',
    tindakanId: 'tindakan-1',
    namaSukuCadang: 'Claw Mechanism Part',
    jumlah: 1,
    catatan: 'Original replacement part',
    createdAt: new Date('2025-01-09'),
  },
  {
    id: 'sc-2',
    tindakanId: 'tindakan-2',
    namaSukuCadang: 'Sensor Posisi Pedal',
    jumlah: 1,
    catatan: 'Masih dalam proses pemesanan',
    createdAt: new Date('2025-01-08'),
  },
];

// Helper functions untuk get data
export function getAllMesin() {
  return [...mesinData];
}

export function getMesinById(id) {
  return mesinData.find(m => m.id === id);
}

export function getAllLaporan() {
  return [...laporanData];
}

export function getLaporanById(id) {
  return laporanData.find(l => l.id === id);
}

export function getDokumentasiByLaporanId(laporanId) {
  return dokumentasiData.filter(d => d.laporanId === laporanId);
}

export function getTindakanByLaporanId(laporanId) {
  return tindakanData.filter(t => t.laporanId === laporanId);
}

export function getSukuCadangByTindakanId(tindakanId) {
  return sukuCadangData.filter(sc => sc.tindakanId === tindakanId);
}

// Generate nomor laporan baru
export function generateNomorLaporan() {
  const allLaporan = getAllLaporan();
  
  if (allLaporan.length === 0) {
    return 'TZ-RK-0001';
  }
  
  const numbers = allLaporan
    .map(l => l.nomorLaporan)
    .filter(n => n.startsWith('TZ-RK-'))
    .map(n => parseInt(n.substring(6)))
    .filter(n => !isNaN(n));
  
  const maxNumber = Math.max(...numbers, 0);
  const nextNumber = maxNumber + 1;
  
  return `TZ-RK-${String(nextNumber).padStart(4, '0')}`;
}

// Status statistics
export function getStatusStatistics(laporanList = laporanData) {
  const stats = {
    total: 0,
    baru: 0,
    menungguPemeriksaan: 0,
    dalamPerbaikan: 0,
    menungguSukuCadang: 0,
    selesai: 0,
    tidakDapatDiperbaiki: 0
  };
  
  for (const laporan of laporanList) {
    stats.total++;
    
    switch (laporan.status) {
      case 'Baru':
        stats.baru++;
        break;
      case 'Menunggu Pemeriksaan':
        stats.menungguPemeriksaan++;
        break;
      case 'Dalam Perbaikan':
        stats.dalamPerbaikan++;
        break;
      case 'Menunggu Suku Cadang':
        stats.menungguSukuCadang++;
        break;
      case 'Selesai':
        stats.selesai++;
        break;
      case 'Tidak Dapat Diperbaiki':
        stats.tidakDapatDiperbaiki++;
        break;
    }
  }
  
  return stats;
}
