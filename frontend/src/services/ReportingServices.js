// ============================================================
// reportingService.js
// Matches routes: /reporting/preview | /reporting/export/excel | /reporting/export/pdf | /reporting/history
// ============================================================

const BASE_URL = '/reporting';

const reportingService = {

  // --- GET Preview (table data + summary) ---
  // GET /reporting/preview?report_type=&date_from=&date_to=&status=&category=&reagent_id=&role=
  async getPreview(queryString) {
    const res = await fetch(`${BASE_URL}/preview?${queryString}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
    return res.json();
  },

  // --- EXPORT: Download file (Excel or PDF) ---
  // GET /reporting/export/excel?... | GET /reporting/export/pdf?...
  async exportReport(format, queryString) {
    const endpoint = format === 'excel' ? 'excel' : 'pdf';
    const res = await fetch(`${BASE_URL}/export/${endpoint}?${queryString}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);

    // Ambil filename dari header Content-Disposition
    const disposition = res.headers.get('Content-Disposition') || '';
    let filename = `Laporan_${format === 'excel' ? 'xlsx' : 'pdf'}`;
    const match = disposition.match(/filename=(.+)/);
    if (match) filename = match[1].replace(/"/g, '');

    // Download as blob
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // --- GET Report History ---
  // GET /reporting/history?limit=
  async getHistory(limit = 20) {
    const res = await fetch(`${BASE_URL}/history?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`History failed: ${res.status}`);
    return res.json();
  }
};

export default reportingService;