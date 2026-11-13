# Petunjuk Perbaikan Error Terra Zone

## Masalah yang Terjadi

Browser menampilkan error karena dependencies belum terinstall saat dev server dijalankan pertama kali oleh Vite CLI.

## ✅ Solusi Lengkap

### Langkah 1: Stop Dev Server

Jika dev server masih running, stop dengan:
- Tekan `Ctrl+C` di terminal
- Atau tutup terminal

### Langkah 2: Install Dependencies

**Pilihan A - Otomatis (Mudah):**
```bash
install-deps.bat
```
Double-click file `install-deps.bat` atau jalankan di terminal.

**Pilihan B - Manual:**
```bash
cd "d:\terrazone crash report\terrazone-app"
npm install
```

Ini akan menginstall:
- ✅ `react-router-dom` - untuk routing antar halaman
- ✅ `tailwindcss` - untuk styling
- ✅ `postcss` & `autoprefixer` - untuk Tailwind

### Langkah 3: Jalankan Ulang Dev Server

```bash
npm run dev
```

### Langkah 4: Buka Browser

Buka: **http://localhost:5173**

Aplikasi sekarang akan berjalan lengkap dengan:
- ✅ Theme Dark/Light mode
- ✅ Sidebar navigation
- ✅ Dashboard dengan stats
- ✅ Data Mesin
- ✅ Laporan Kerusakan
- ✅ Detail Laporan dengan foto

---

## 🔍 Jika Masih Ada Error

### Error: "Cannot find module 'react-router-dom'"

```bash
npm install react-router-dom
```

### Error: "Tailwind CSS not working"

1. Pastikan file ada:
   - `tailwind.config.js` ✅
   - `postcss.config.js` ✅
   - `src/index.css` dengan `@tailwind` directives ✅

2. Install dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
```

3. Restart dev server

### Error: White/Blank Screen

1. Buka DevTools (F12)
2. Lihat tab Console
3. Screenshot error yang muncul
4. Check apakah semua dependencies sudah terinstall:
```bash
npm list react-router-dom tailwindcss
```

### Port 5173 Sudah Dipakai

Vite akan otomatis menggunakan port lain (5174, 5175, dst).
Perhatikan output terminal untuk URL yang benar.

---

## 🎯 Verifikasi Instalasi Berhasil

Setelah `npm install` dan `npm run dev`, cek terminal output:

```
VITE v8.3.5  ready in 308 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Browser akan menampilkan:
- ✅ Sidebar Terra Zone di kiri
- ✅ Header dengan toggle theme di kanan
- ✅ Dashboard dengan 4 stats cards
- ✅ Navigasi berfungsi

---

## 📋 Checklist Dependencies

Setelah `npm install`, file `node_modules` harus berisi:

- [ ] `node_modules/react-router-dom/` ✅
- [ ] `node_modules/tailwindcss/` ✅
- [ ] `node_modules/postcss/` ✅
- [ ] `node_modules/autoprefixer/` ✅

Check dengan:
```bash
ls node_modules | findstr "react-router-dom tailwindcss"
```

---

## 🚀 Quick Start (Fresh Install)

Untuk clean install dari awal:

```bash
# 1. Stop server jika running
Ctrl+C

# 2. Hapus node_modules (optional, jika ada masalah)
rmdir /s /q node_modules

# 3. Install semua dependencies
npm install

# 4. Jalankan
npm run dev
```

---

## 📞 Masih Bermasalah?

1. Screenshot error dari browser Console (F12)
2. Copy terminal output
3. Check file `package.json` dependencies section
4. Pastikan Node.js version minimal v18

Hubungi tim development untuk bantuan lebih lanjut.

---

**Last Updated:** 2025-01-15
**Status:** Dependencies need one-time installation
