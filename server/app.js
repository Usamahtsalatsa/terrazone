import crypto from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { del, put } from '@vercel/blob';
import { db, initializeDatabase } from './database.js';

await initializeDatabase();

const app = express();
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.join(serverDirectory, 'uploads');
const statuses = ['Baru', 'Menunggu Pemeriksaan', 'Dalam Perbaikan', 'Menunggu Suku Cadang', 'Selesai', 'Tidak Dapat Diperbaiki'];
const priorities = ['Rendah', 'Sedang', 'Tinggi'];
const machineStatuses = ['Normal', 'Rusak', 'Dalam Perbaikan'];
const now = () => new Date().toISOString();
const isVercel = process.env.VERCEL === '1';
const maxPhotoSize = isVercel ? 4 * 1024 * 1024 : 8 * 1024 * 1024;

app.use(express.json({ limit: '1mb' }));
if (!isVercel) app.use('/uploads', express.static(uploadsDirectory));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxPhotoSize },
  fileFilter: (_request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      callback(new Error('File harus berupa gambar JPG, PNG, WEBP, atau GIF.'));
      return;
    }
    callback(null, true);
  },
});

const machineSelect = `
  SELECT id, kode_mesin AS kodeMesin, nama_mesin AS namaMesin, kategori, lokasi,
    status_kondisi AS statusKondisi, catatan, created_at AS createdAt, updated_at AS updatedAt
  FROM mesin
`;
const reportSelect = `
  SELECT id, nomor_laporan AS nomorLaporan, mesin_id AS mesinId, jenis_kerusakan AS jenisKerusakan,
    deskripsi, tanggal_kejadian AS tanggalKejadian, tanggal_laporan AS tanggalLaporan,
    pelapor, prioritas, status, created_at AS createdAt, updated_at AS updatedAt
  FROM laporan
`;

function sendError(response, status, message) {
  response.status(status).json({ error: message });
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw Object.assign(new Error(`${label} wajib diisi.`), { status: 400 });
  }
  return value.trim();
}

async function rows(sql, args = []) {
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => Object.fromEntries(result.columns.map((column, index) => [column, row[index]])));
}

async function row(sql, args = []) {
  return (await rows(sql, args))[0] || null;
}

async function execute(sql, args = []) {
  return db.execute({ sql, args });
}

async function readMachine(id) {
  return row(`${machineSelect} WHERE id = ?`, [id]);
}

async function readReport(id) {
  const report = await row(`${reportSelect} WHERE id = ?`, [id]);
  if (!report) return null;
  report.mesin = await readMachine(report.mesinId);
  report.dokumentasi = await rows(`
    SELECT id, laporan_id AS laporanId, nama_file AS namaFile, preview_url AS previewUrl,
      keterangan, tanggal_upload AS tanggalUpload
    FROM dokumentasi WHERE laporan_id = ? ORDER BY tanggal_upload DESC
  `, [id]);
  report.tindakan = await rows(`
    SELECT id, laporan_id AS laporanId, tanggal_pemeriksaan AS tanggalPemeriksaan,
      hasil_pemeriksaan AS hasilPemeriksaan, tindakan_servis AS tindakanServis,
      estimasi_durasi AS estimasiDurasi, tanggal_mulai AS tanggalMulai,
      tanggal_selesai AS tanggalSelesai, teknisi, status, created_at AS createdAt, updated_at AS updatedAt
    FROM tindakan WHERE laporan_id = ? ORDER BY tanggal_pemeriksaan DESC
  `, [id]);
  for (const action of report.tindakan) {
    action.sukuCadang = await rows(`
      SELECT id, tindakan_id AS tindakanId, nama_suku_cadang AS namaSukuCadang,
        jumlah, catatan, created_at AS createdAt
      FROM suku_cadang WHERE tindakan_id = ? ORDER BY created_at
    `, [action.id]);
  }
  return report;
}

async function syncMachineStatus(machineId) {
  const activeStatuses = (await rows(`SELECT status FROM laporan WHERE mesin_id = ? AND status NOT IN ('Selesai', 'Tidak Dapat Diperbaiki')`, [machineId])).map((report) => report.status);
  const condition = activeStatuses.length === 0
    ? 'Normal'
    : activeStatuses.some((status) => status === 'Dalam Perbaikan' || status === 'Menunggu Suku Cadang')
      ? 'Dalam Perbaikan'
      : 'Rusak';
  await execute('UPDATE mesin SET status_kondisi = ?, updated_at = ? WHERE id = ?', [condition, now(), machineId]);
}

async function savePhoto(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const filename = `${crypto.randomUUID()}${extension}`;
  if (isVercel) {
    const blob = await put(`dokumentasi/${filename}`, file.buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.mimetype,
    });
    return blob.url;
  }
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.join(uploadsDirectory, filename), file.buffer);
  return `/uploads/${filename}`;
}

async function removePhoto(url) {
  if (url.startsWith('https://')) {
    if (isVercel) await del(url);
    return;
  }
  const filename = path.basename(url);
  await unlink(path.join(uploadsDirectory, filename)).catch(() => {});
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, database: process.env.TURSO_DATABASE_URL ? 'turso' : 'sqlite' });
});

app.get('/api/mesin', async (_request, response) => {
  response.json(await rows(`${machineSelect} ORDER BY kode_mesin`));
});

app.post('/api/mesin', async (request, response) => {
  try {
    const body = request.body;
    const machine = {
      id: crypto.randomUUID(),
      kodeMesin: requireText(body.kodeMesin, 'Kode mesin'),
      namaMesin: requireText(body.namaMesin, 'Nama mesin'),
      kategori: requireText(body.kategori, 'Kategori'),
      lokasi: requireText(body.lokasi, 'Lokasi'),
      statusKondisi: body.statusKondisi || 'Normal',
      catatan: typeof body.catatan === 'string' ? body.catatan.trim() : '',
    };
    if (!machineStatuses.includes(machine.statusKondisi)) throw Object.assign(new Error('Status mesin tidak valid.'), { status: 400 });
    const timestamp = now();
    await execute(`INSERT INTO mesin (id, kode_mesin, nama_mesin, kategori, lokasi, status_kondisi, catatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [machine.id, machine.kodeMesin, machine.namaMesin, machine.kategori, machine.lokasi, machine.statusKondisi, machine.catatan, timestamp, timestamp]);
    response.status(201).json(await readMachine(machine.id));
  } catch (error) {
    sendError(response, error.status || (error.code?.includes('CONSTRAINT') ? 409 : 400), error.code?.includes('CONSTRAINT') ? 'Kode mesin sudah digunakan.' : error.message);
  }
});

app.put('/api/mesin/:id', async (request, response) => {
  try {
    const current = await readMachine(request.params.id);
    if (!current) return sendError(response, 404, 'Mesin tidak ditemukan.');
    const body = request.body;
    const machine = {
      kodeMesin: body.kodeMesin === undefined ? current.kodeMesin : requireText(body.kodeMesin, 'Kode mesin'),
      namaMesin: body.namaMesin === undefined ? current.namaMesin : requireText(body.namaMesin, 'Nama mesin'),
      kategori: body.kategori === undefined ? current.kategori : requireText(body.kategori, 'Kategori'),
      lokasi: body.lokasi === undefined ? current.lokasi : requireText(body.lokasi, 'Lokasi'),
      statusKondisi: body.statusKondisi || current.statusKondisi,
      catatan: body.catatan === undefined ? current.catatan : String(body.catatan).trim(),
    };
    if (!machineStatuses.includes(machine.statusKondisi)) throw Object.assign(new Error('Status mesin tidak valid.'), { status: 400 });
    await execute(`UPDATE mesin SET kode_mesin = ?, nama_mesin = ?, kategori = ?, lokasi = ?, status_kondisi = ?, catatan = ?, updated_at = ? WHERE id = ?`,
      [machine.kodeMesin, machine.namaMesin, machine.kategori, machine.lokasi, machine.statusKondisi, machine.catatan, now(), request.params.id]);
    return response.json(await readMachine(request.params.id));
  } catch (error) {
    return sendError(response, error.status || (error.code?.includes('CONSTRAINT') ? 409 : 400), error.code?.includes('CONSTRAINT') ? 'Kode mesin sudah digunakan.' : error.message);
  }
});

app.delete('/api/mesin/:id', async (request, response) => {
  try {
    const result = await execute('DELETE FROM mesin WHERE id = ?', [request.params.id]);
    if (Number(result.rowsAffected) === 0) return sendError(response, 404, 'Mesin tidak ditemukan.');
    return response.status(204).end();
  } catch (error) {
    if (error.code?.includes('CONSTRAINT')) return sendError(response, 409, 'Mesin yang sudah memiliki laporan tidak dapat dihapus.');
    throw error;
  }
});

app.get('/api/laporan', async (_request, response) => {
  const reports = await rows(`${reportSelect} ORDER BY tanggal_laporan DESC`);
  for (const report of reports) report.mesin = await readMachine(report.mesinId);
  response.json(reports);
});

app.post('/api/laporan', async (request, response) => {
  try {
    const body = request.body;
    const machine = await readMachine(requireText(body.mesinId, 'Mesin'));
    if (!machine) return sendError(response, 400, 'Mesin yang dipilih tidak ditemukan.');
    const priority = body.prioritas || 'Sedang';
    if (!priorities.includes(priority)) throw Object.assign(new Error('Prioritas tidak valid.'), { status: 400 });
    const numberResult = await row(`SELECT COALESCE(MAX(CAST(SUBSTR(nomor_laporan, 7) AS INTEGER)), 0) + 1 AS next FROM laporan WHERE nomor_laporan LIKE 'TZ-RK-%'`);
    const id = crypto.randomUUID();
    const timestamp = now();
    const report = {
      id,
      nomorLaporan: `TZ-RK-${String(numberResult.next).padStart(4, '0')}`,
      mesinId: machine.id,
      jenisKerusakan: requireText(body.jenisKerusakan, 'Jenis kerusakan'),
      deskripsi: requireText(body.deskripsi, 'Deskripsi'),
      tanggalKejadian: requireText(body.tanggalKejadian, 'Tanggal kejadian'),
      tanggalLaporan: body.tanggalLaporan || timestamp,
      pelapor: requireText(body.pelapor, 'Pelapor'),
      prioritas: priority,
      status: 'Baru',
    };
    await execute(`INSERT INTO laporan (id, nomor_laporan, mesin_id, jenis_kerusakan, deskripsi, tanggal_kejadian, tanggal_laporan, pelapor, prioritas, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [report.id, report.nomorLaporan, report.mesinId, report.jenisKerusakan, report.deskripsi, report.tanggalKejadian, report.tanggalLaporan, report.pelapor, report.prioritas, report.status, timestamp, timestamp]);
    await syncMachineStatus(machine.id);
    return response.status(201).json(await readReport(id));
  } catch (error) {
    return sendError(response, error.status || 400, error.message);
  }
});

app.get('/api/laporan/:id', async (request, response) => {
  const report = await readReport(request.params.id);
  if (!report) return sendError(response, 404, 'Laporan tidak ditemukan.');
  return response.json(report);
});

app.put('/api/laporan/:id', async (request, response) => {
  try {
    const current = await row(`${reportSelect} WHERE id = ?`, [request.params.id]);
    if (!current) return sendError(response, 404, 'Laporan tidak ditemukan.');
    const body = request.body;
    const report = {
      mesinId: body.mesinId === undefined ? current.mesinId : requireText(body.mesinId, 'Mesin'),
      jenisKerusakan: body.jenisKerusakan === undefined ? current.jenisKerusakan : requireText(body.jenisKerusakan, 'Jenis kerusakan'),
      deskripsi: body.deskripsi === undefined ? current.deskripsi : requireText(body.deskripsi, 'Deskripsi'),
      tanggalKejadian: body.tanggalKejadian === undefined ? current.tanggalKejadian : requireText(body.tanggalKejadian, 'Tanggal kejadian'),
      tanggalLaporan: body.tanggalLaporan === undefined ? current.tanggalLaporan : body.tanggalLaporan,
      pelapor: body.pelapor === undefined ? current.pelapor : requireText(body.pelapor, 'Pelapor'),
      prioritas: body.prioritas || current.prioritas,
      status: body.status || current.status,
    };
    if (!await readMachine(report.mesinId)) return sendError(response, 400, 'Mesin yang dipilih tidak ditemukan.');
    if (!priorities.includes(report.prioritas) || !statuses.includes(report.status)) throw Object.assign(new Error('Prioritas atau status tidak valid.'), { status: 400 });
    await execute(`UPDATE laporan SET mesin_id = ?, jenis_kerusakan = ?, deskripsi = ?, tanggal_kejadian = ?, tanggal_laporan = ?, pelapor = ?, prioritas = ?, status = ?, updated_at = ? WHERE id = ?`,
      [report.mesinId, report.jenisKerusakan, report.deskripsi, report.tanggalKejadian, report.tanggalLaporan, report.pelapor, report.prioritas, report.status, now(), request.params.id]);
    await syncMachineStatus(current.mesinId);
    if (current.mesinId !== report.mesinId) await syncMachineStatus(report.mesinId);
    return response.json(await readReport(request.params.id));
  } catch (error) {
    return sendError(response, error.status || 400, error.message);
  }
});

app.delete('/api/laporan/:id', async (request, response) => {
  const report = await row('SELECT mesin_id AS mesinId FROM laporan WHERE id = ?', [request.params.id]);
  if (!report) return sendError(response, 404, 'Laporan tidak ditemukan.');
  const documents = await rows('SELECT preview_url AS previewUrl FROM dokumentasi WHERE laporan_id = ?', [request.params.id]);
  await execute('DELETE FROM laporan WHERE id = ?', [request.params.id]);
  for (const document of documents) await removePhoto(document.previewUrl);
  await syncMachineStatus(report.mesinId);
  return response.status(204).end();
});

app.post('/api/laporan/:id/dokumentasi', upload.single('foto'), async (request, response) => {
  const report = await row('SELECT id FROM laporan WHERE id = ?', [request.params.id]);
  if (!report) return sendError(response, 404, 'Laporan tidak ditemukan.');
  if (!request.file) return sendError(response, 400, 'Pilih file gambar terlebih dahulu.');
  const previewUrl = await savePhoto(request.file);
  const document = {
    id: crypto.randomUUID(),
    laporanId: report.id,
    namaFile: request.file.originalname,
    previewUrl,
    keterangan: typeof request.body.keterangan === 'string' ? request.body.keterangan.trim() : '',
    tanggalUpload: now(),
  };
  await execute('INSERT INTO dokumentasi (id, laporan_id, nama_file, preview_url, keterangan, tanggal_upload) VALUES (?, ?, ?, ?, ?, ?)',
    [document.id, document.laporanId, document.namaFile, document.previewUrl, document.keterangan, document.tanggalUpload]);
  return response.status(201).json(document);
});

app.delete('/api/dokumentasi/:id', async (request, response) => {
  const document = await row('SELECT preview_url AS previewUrl FROM dokumentasi WHERE id = ?', [request.params.id]);
  if (!document) return sendError(response, 404, 'Dokumentasi tidak ditemukan.');
  await execute('DELETE FROM dokumentasi WHERE id = ?', [request.params.id]);
  await removePhoto(document.previewUrl);
  return response.status(204).end();
});

app.post('/api/laporan/:id/tindakan', async (request, response) => {
  try {
    const report = await row(`${reportSelect} WHERE id = ?`, [request.params.id]);
    if (!report) return sendError(response, 404, 'Laporan tidak ditemukan.');
    const body = request.body;
    const status = body.status || 'Menunggu Pemeriksaan';
    if (!statuses.includes(status)) throw Object.assign(new Error('Status tindakan tidak valid.'), { status: 400 });
    const id = crypto.randomUUID();
    const timestamp = now();
    const action = {
      id,
      laporanId: report.id,
      tanggalPemeriksaan: body.tanggalPemeriksaan || timestamp,
      hasilPemeriksaan: requireText(body.hasilPemeriksaan, 'Hasil pemeriksaan'),
      tindakanServis: requireText(body.tindakanServis, 'Tindakan servis'),
      estimasiDurasi: Number(body.estimasiDurasi || 0),
      tanggalMulai: body.tanggalMulai || null,
      tanggalSelesai: body.tanggalSelesai || null,
      teknisi: requireText(body.teknisi, 'Teknisi'),
      status,
    };
    if (!Number.isFinite(action.estimasiDurasi) || action.estimasiDurasi < 0) throw Object.assign(new Error('Estimasi durasi harus berupa angka positif.'), { status: 400 });
    const parts = Array.isArray(body.sukuCadang) ? body.sukuCadang : [];
    const transaction = await db.transaction('write');
    try {
      await transaction.execute({
        sql: `INSERT INTO tindakan (id, laporan_id, tanggal_pemeriksaan, hasil_pemeriksaan, tindakan_servis, estimasi_durasi, tanggal_mulai, tanggal_selesai, teknisi, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [action.id, action.laporanId, action.tanggalPemeriksaan, action.hasilPemeriksaan, action.tindakanServis, action.estimasiDurasi, action.tanggalMulai, action.tanggalSelesai, action.teknisi, action.status, timestamp, timestamp],
      });
      for (const part of parts) {
        const quantity = Number(part.jumlah || 1);
        if (!Number.isInteger(quantity) || quantity < 1) throw Object.assign(new Error('Jumlah suku cadang harus bilangan bulat positif.'), { status: 400 });
        await transaction.execute({
          sql: 'INSERT INTO suku_cadang (id, tindakan_id, nama_suku_cadang, jumlah, catatan, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          args: [crypto.randomUUID(), id, requireText(part.namaSukuCadang, 'Nama suku cadang'), quantity, String(part.catatan || '').trim(), timestamp],
        });
      }
      await transaction.execute({ sql: 'UPDATE laporan SET status = ?, updated_at = ? WHERE id = ?', args: [status, timestamp, report.id] });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    await syncMachineStatus(report.mesinId);
    return response.status(201).json(await readReport(report.id));
  } catch (error) {
    return sendError(response, error.status || 400, error.message);
  }
});

app.put('/api/tindakan/:id', async (request, response) => {
  const current = await row('SELECT * FROM tindakan WHERE id = ?', [request.params.id]);
  if (!current) return sendError(response, 404, 'Tindakan tidak ditemukan.');
  const body = request.body;
  const status = body.status || current.status;
  if (!statuses.includes(status)) return sendError(response, 400, 'Status tindakan tidak valid.');
  await execute(`UPDATE tindakan SET status = ?, hasil_pemeriksaan = ?, tindakan_servis = ?, estimasi_durasi = ?, tanggal_mulai = ?, tanggal_selesai = ?, teknisi = ?, updated_at = ? WHERE id = ?`,
    [status, body.hasilPemeriksaan ?? current.hasil_pemeriksaan, body.tindakanServis ?? current.tindakan_servis, Number(body.estimasiDurasi ?? current.estimasi_durasi), body.tanggalMulai ?? current.tanggal_mulai, body.tanggalSelesai ?? current.tanggal_selesai, body.teknisi ?? current.teknisi, now(), request.params.id]);
  await execute('UPDATE laporan SET status = ?, updated_at = ? WHERE id = ?', [status, now(), current.laporan_id]);
  const report = await row('SELECT mesin_id AS mesinId FROM laporan WHERE id = ?', [current.laporan_id]);
  await syncMachineStatus(report.mesinId);
  return response.json(await readReport(current.laporan_id));
});

app.delete('/api/tindakan/:id', async (request, response) => {
  const action = await row('SELECT laporan_id AS laporanId FROM tindakan WHERE id = ?', [request.params.id]);
  if (!action) return sendError(response, 404, 'Tindakan tidak ditemukan.');
  await execute('DELETE FROM tindakan WHERE id = ?', [request.params.id]);
  return response.status(204).end();
});

app.use((error, _request, response, _next) => {
  void _next;
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return sendError(response, 413, `Ukuran foto maksimal ${isVercel ? '4' : '8'} MB.`);
  }
  return sendError(response, error.status || 400, error.message || 'Permintaan tidak dapat diproses.');
});

export default app;
