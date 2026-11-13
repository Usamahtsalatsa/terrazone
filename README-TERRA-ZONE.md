# Terra Zone Maintenance System

Sistem Informasi Pengelolaan Data Kerusakan dan Perbaikan Mesin Permainan Terra Zone Berbasis Web.

## Teknologi

- **Frontend:** React 19.3.1
- **Build Tool:** Vite 8.3.5
- **Styling:** Tailwind CSS 3.3.6
- **Router:** React Router DOM 6.20.0
- **Backend:** Express 5 + Node.js SQLite
- **Database:** SQLite lokal melalui libSQL; Turso saat deploy
- **Foto:** Penyimpanan lokal saat development; Vercel Blob saat deploy
- **Bahasa:** JavaScript (bukan TypeScript)

## Fitur yang Sudah Diimplementasikan

### ✅ Core Features
- [x] Theme Management (Dark Mode & Light Mode dengan localStorage persistence)
- [x] Layout responsif dengan Sidebar dan Header
- [x] Data dummy yang konsisten untuk demo

### ✅ Modul 1: Dashboard
- [x] Stats Cards (Total Laporan, Baru, Dalam Perbaikan, Selesai)
- [x] Distribusi Status dengan progress bars
- [x] Laporan Terbaru
- [x] Quick Actions links

### ✅ Modul 2: Data Mesin
- [x] Tabel data mesin dengan filter
- [x] Pencarian by nama/kode mesin
- [x] Filter by kategori dan status
- [x] Status badges
- [x] Tambah, edit, dan hapus melalui API/SQLite

### ✅ Modul 3: Laporan Kerusakan
- [x] Tabel laporan dengan filter lengkap
- [x] Filter by status, prioritas
- [x] Pencarian by nomor laporan, mesin, jenis kerusakan
- [x] Link ke detail laporan
- [x] Buat dan hapus laporan melalui API/SQLite
- [x] Upload dokumentasi foto ke penyimpanan lokal

### ✅ Modul Detail Laporan
- [x] Informasi lengkap laporan
- [x] Dokumentasi foto (galeri)
- [x] Riwayat tindakan perbaikan
- [x] Informasi suku cadang
- [x] Timeline penanganan

### ✅ Modul 4: Penanganan & Perbaikan
- [x] Tambah tindakan, estimasi, status, dan suku cadang opsional
- [x] Riwayat tindakan ditampilkan pada detail laporan

### 🚧 Modul 5: Laporan & Ekspor (Placeholder)
- [ ] Filter advanced dengan date range
- [ ] Ekspor Excel
- [ ] Ekspor PDF

### 🚧 Fitur Lainnya
- [x] Form dengan validasi dasar dan feedback
- [x] Upload foto galeri
- [ ] Autentikasi dan role pengguna
- [ ] Ekspor Excel/PDF

## Cara Install dan Menjalankan

### 1. Stop Dev Server yang Running (jika ada)
Tekan `Ctrl+C` di terminal yang menjalankan `npm run dev`

### 2. Install Dependencies
```bash
cd "d:\terrazone crash report\terrazone-app"
npm install
```

Kebutuhan runtime backend: **Node.js 22.13 atau lebih baru** (untuk `node:sqlite`).
`npm install` memasang Express, Multer, dan runner development.

### 3. Jalankan Development Server
```bash
npm run dev
```

Aplikasi: **http://localhost:5173**. API lokal berjalan di `http://127.0.0.1:3001` dan diproxy oleh Vite.
Database otomatis dibuat di `server/data/terrazone.sqlite`; saat kosong, aplikasi mengisinya dengan data contoh.
Foto yang diunggah disimpan di `server/uploads/`.

Untuk menjalankan API saja, gunakan `npm run dev:api`.

### Deploy ke Vercel

1. Buat database Turso/libSQL dan salin URL serta auth token database.
2. Buat Vercel Blob store.
3. Hubungkan repository GitHub ke Vercel dengan Root Directory `.` (root repository).
4. Tambahkan Environment Variables berikut di project Vercel:
	- `TURSO_DATABASE_URL`
	- `TURSO_AUTH_TOKEN`
	- `BLOB_READ_WRITE_TOKEN` (dapat diisi lewat integrasi Blob Vercel)
5. Deploy. Endpoint API memakai folder `api/`, sedangkan frontend Vite dibangun ke `dist/`.

Jangan masukkan token ke repository atau file yang dikomit. Tanpa kredensial Turso dan Blob, deployment Vercel tidak memiliki penyimpanan persisten dan alur tulis tidak siap digunakan.

### 4. Build untuk Production
```bash
npm run build
```

Output akan ada di folder `dist/`

## Struktur Folder

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── StatsCard.jsx
│   │   └── StatusBadge.jsx
│   └── layout/          # Layout components
│       ├── Header.jsx
│       ├── Sidebar.jsx
│       └── MainLayout.jsx
├── contexts/
│   └── ThemeContext.jsx # Theme management
├── data/
│   └── dummy.js         # Data dummy yang konsisten
├── pages/
│   ├── Dashboard.jsx
│   ├── DataMesin.jsx
│   ├── LaporanKerusakan.jsx
│   └── LaporanDetail.jsx
├── App.jsx              # Main app dengan routing
├── main.jsx             # Entry point
└── index.css            # Tailwind directives & custom styles
```

## Cara Menggunakan

### Navigasi
- **Dashboard** - Lihat ringkasan statistik dan laporan terbaru
- **Data Mesin** - Browse dan filter daftar mesin
- **Laporan Kerusakan** - Lihat semua laporan, klik untuk detail
- **Detail Laporan** - Klik nomor laporan untuk lihat dokumentasi foto dan riwayat perbaikan

### Toggle Theme
Klik icon Sun/Moon di header kanan atas untuk switch Dark/Light mode. Preferensi akan tersimpan di localStorage.

### Filter Data
Setiap halaman memiliki filter yang bisa dikombinasikan:
- Search by text
- Filter by kategori/status
- Filter by prioritas (di laporan)

## Data Dummy

Sistem menggunakan data dummy yang realistis:

**Mesin:**
- 5 mesin: Air Hockey, Claw Machine, Basketball, Racing Simulator, Motorcycle
- Kategori: Arcade, Racing, Prize
- Lokasi: Area Arcade A/B, Area Racing

**Laporan:**
- 3 laporan dengan status berbeda (Dalam Perbaikan, Selesai)
- Dokumentasi foto (placeholder images)
- Riwayat tindakan perbaikan dengan suku cadang

## Batasan dan Keamanan

Backend ini ditujukan untuk pengembangan/demo lokal, bukan deployment publik:

- Tidak ada autentikasi atau pembatasan role; jangan buka API langsung ke internet.
- Database lokal dan foto tersimpan di disk lokal; pada Vercel gunakan Turso dan Blob seperti langkah deploy.
- Foto maksimal 8 MB saat lokal dan 4 MB di Vercel, format JPG, PNG, WEBP, atau GIF.
- Data seed hanya masuk otomatis ketika tabel mesin masih kosong; database yang sudah ada tidak ditimpa.
- Ekspor Excel/PDF dan halaman rekap lanjutan belum tersedia.

Data perubahan yang dibuat lewat API tetap ada setelah refresh dan restart server lokal.

## Troubleshooting

### Error: Cannot find module 'react-router-dom'
```bash
npm install react-router-dom
```

### Error: PostCSS/Tailwind not found
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Page blank/white screen
1. Buka Browser DevTools (F12)
2. Lihat Console tab untuk error messages
3. Pastikan semua dependencies terinstall
4. Restart dev server

### Tailwind classes tidak bekerja
1. Pastikan `tailwind.config.js` dan `postcss.config.js` ada
2. Restart dev server setelah config changes
3. Check `index.css` ada directives `@tailwind`

## Kontak / Support

Untuk pertanyaan atau issue, hubungi tim development Terra Zone.

---

**Built with ❤️ for Terra Zone**
