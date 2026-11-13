import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';
import {
  dokumentasiData,
  laporanData,
  mesinData,
  sukuCadangData,
  tindakanData,
} from '../src/data/dummy.js';

const defaultDatabasePath = fileURLToPath(new URL('./data/terrazone.sqlite', import.meta.url));
const localDatabasePath = resolve(process.env.TERRAZONE_DB_PATH || defaultDatabasePath).replaceAll('\\', '/');
const databaseUrl = process.env.TURSO_DATABASE_URL || `file:${localDatabasePath}`;

if (databaseUrl.startsWith('file:')) mkdirSync(dirname(localDatabasePath), { recursive: true });

export const db = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const schema = [
  `CREATE TABLE IF NOT EXISTS mesin (
    id TEXT PRIMARY KEY,
    kode_mesin TEXT NOT NULL UNIQUE,
    nama_mesin TEXT NOT NULL,
    kategori TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    status_kondisi TEXT NOT NULL DEFAULT 'Normal',
    catatan TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS laporan (
    id TEXT PRIMARY KEY,
    nomor_laporan TEXT NOT NULL UNIQUE,
    mesin_id TEXT NOT NULL REFERENCES mesin(id) ON DELETE RESTRICT,
    jenis_kerusakan TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    tanggal_kejadian TEXT NOT NULL,
    tanggal_laporan TEXT NOT NULL,
    pelapor TEXT NOT NULL,
    prioritas TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Baru',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dokumentasi (
    id TEXT PRIMARY KEY,
    laporan_id TEXT NOT NULL REFERENCES laporan(id) ON DELETE CASCADE,
    nama_file TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    keterangan TEXT NOT NULL DEFAULT '',
    tanggal_upload TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS tindakan (
    id TEXT PRIMARY KEY,
    laporan_id TEXT NOT NULL REFERENCES laporan(id) ON DELETE CASCADE,
    tanggal_pemeriksaan TEXT NOT NULL,
    hasil_pemeriksaan TEXT NOT NULL,
    tindakan_servis TEXT NOT NULL,
    estimasi_durasi REAL NOT NULL DEFAULT 0,
    tanggal_mulai TEXT,
    tanggal_selesai TEXT,
    teknisi TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS suku_cadang (
    id TEXT PRIMARY KEY,
    tindakan_id TEXT NOT NULL REFERENCES tindakan(id) ON DELETE CASCADE,
    nama_suku_cadang TEXT NOT NULL,
    jumlah INTEGER NOT NULL DEFAULT 1,
    catatan TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS idx_laporan_mesin ON laporan(mesin_id)',
  'CREATE INDEX IF NOT EXISTS idx_laporan_status ON laporan(status)',
  'CREATE INDEX IF NOT EXISTS idx_dokumentasi_laporan ON dokumentasi(laporan_id)',
  'CREATE INDEX IF NOT EXISTS idx_tindakan_laporan ON tindakan(laporan_id)',
  'CREATE INDEX IF NOT EXISTS idx_suku_cadang_tindakan ON suku_cadang(tindakan_id)',
];

const toIso = (value) => value instanceof Date ? value.toISOString() : value || new Date().toISOString();

export async function initializeDatabase() {
  for (const statement of schema) await db.execute(statement);

  const transaction = await db.transaction('write');
  try {
    const machineCount = await transaction.execute('SELECT COUNT(*) AS count FROM mesin');
    if (Number(machineCount.rows[0].count) === 0) {
      for (const machine of mesinData) {
        await transaction.execute({
          sql: `INSERT OR IGNORE INTO mesin (id, kode_mesin, nama_mesin, kategori, lokasi, status_kondisi, catatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [machine.id, machine.kodeMesin, machine.namaMesin, machine.kategori, machine.lokasi, machine.statusKondisi, machine.catatan, toIso(machine.createdAt), toIso(machine.updatedAt)],
        });
      }
      for (const report of laporanData) {
        await transaction.execute({
          sql: `INSERT OR IGNORE INTO laporan (id, nomor_laporan, mesin_id, jenis_kerusakan, deskripsi, tanggal_kejadian, tanggal_laporan, pelapor, prioritas, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [report.id, report.nomorLaporan, report.mesinId, report.jenisKerusakan, report.deskripsi, toIso(report.tanggalKejadian), toIso(report.tanggalLaporan), report.pelapor, report.prioritas, report.status, toIso(report.createdAt), toIso(report.updatedAt)],
        });
      }
      for (const document of dokumentasiData) {
        await transaction.execute({
          sql: `INSERT OR IGNORE INTO dokumentasi (id, laporan_id, nama_file, preview_url, keterangan, tanggal_upload) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [document.id, document.laporanId, document.namaFile, document.previewUrl, document.keterangan, toIso(document.tanggalUpload)],
        });
      }
      for (const action of tindakanData) {
        await transaction.execute({
          sql: `INSERT OR IGNORE INTO tindakan (id, laporan_id, tanggal_pemeriksaan, hasil_pemeriksaan, tindakan_servis, estimasi_durasi, tanggal_mulai, tanggal_selesai, teknisi, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [action.id, action.laporanId, toIso(action.tanggalPemeriksaan), action.hasilPemeriksaan, action.tindakanServis, action.estimasiDurasi, toIso(action.tanggalMulai), toIso(action.tanggalSelesai), action.teknisi, action.status, toIso(action.createdAt), toIso(action.updatedAt)],
        });
      }
      for (const part of sukuCadangData) {
        await transaction.execute({
          sql: `INSERT OR IGNORE INTO suku_cadang (id, tindakan_id, nama_suku_cadang, jumlah, catatan, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          args: [part.id, part.tindakanId, part.namaSukuCadang, part.jumlah, part.catatan, toIso(part.createdAt)],
        });
      }
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}