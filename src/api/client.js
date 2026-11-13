async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new Error('Server tidak dapat dihubungi. Pastikan backend sedang berjalan.');
  }

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Permintaan gagal diproses.');
  return body;
}

function sendJson(method, body) {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export const api = {
  mesin: {
    list: () => request('/mesin'),
    create: (data) => request('/mesin', sendJson('POST', data)),
    update: (id, data) => request(`/mesin/${id}`, sendJson('PUT', data)),
    remove: (id) => request(`/mesin/${id}`, { method: 'DELETE' }),
  },
  laporan: {
    list: () => request('/laporan'),
    get: (id) => request(`/laporan/${id}`),
    create: (data) => request('/laporan', sendJson('POST', data)),
    update: (id, data) => request(`/laporan/${id}`, sendJson('PUT', data)),
    remove: (id) => request(`/laporan/${id}`, { method: 'DELETE' }),
    addPhoto: (id, file, keterangan) => {
      const body = new FormData();
      body.append('foto', file);
      body.append('keterangan', keterangan);
      return request(`/laporan/${id}/dokumentasi`, { method: 'POST', body });
    },
    removePhoto: (id) => request(`/dokumentasi/${id}`, { method: 'DELETE' }),
    addAction: (id, data) => request(`/laporan/${id}/tindakan`, sendJson('POST', data)),
  },
};