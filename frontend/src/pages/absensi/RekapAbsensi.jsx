import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BarChart3, CalendarDays, Filter, Download, ChevronDown, Sparkles, FileSpreadsheet, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  Hadir: 'text-emerald-600',
  Sakit: 'text-amber-600',
  Ijin: 'text-blue-600',
  Dispen: 'text-violet-600',
  Alpa: 'text-rose-600',
};

export default function RekapAbsensi() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get('/kelas').then((res) => setKelasList(res.data.data || [])).catch(console.error);
    fetchRekap();
  }, []);

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const params = { start: startDate, end: endDate };
      if (kelasId) params.kelas_id = kelasId;
      const res = await api.get('/absensi/rekap', { params });
      setRekap(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat rekap absensi.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Mengunduh Laporan Excel...');
    try {
      const params = { start: startDate, end: endDate };
      if (kelasId) params.kelas_id = kelasId;

      const response = await api.get('/absensi/export', {
        params,
        responseType: 'blob',
      });

      // Create blob download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekap_absensi_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Laporan Excel berhasil diunduh!', { id: toastId, icon: '📊' });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh laporan Excel.', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-max mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
            AI Analytical Rekap Matrix
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Rekapitulasi Absensi
          </h1>
          <p className="text-xs text-slate-500 font-medium">Ringkasan kehadiran siswa periode {startDate} s/d {endDate}</p>
        </div>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Filter Kelas
            </label>
            <div className="relative w-full">
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all pr-10"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 mt-2 border-t border-slate-100">
          <button
            onClick={fetchRekap}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'AI Fetching...' : 'Tampilkan Rekap AI'}
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export ke Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Rekap Matrix Table */}
      {rekap.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-10 sm:w-14">No</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">NIS</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nama Siswa</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Kelas</th>
                  {['Hadir', 'Sakit', 'Ijin', 'Dispen', 'Alpa'].map((s) => (
                    <th key={s} className={`text-center px-2 sm:px-4 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider ${STATUS_COLORS[s]}`}>{s}</th>
                  ))}
                  <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekap.map((row, i) => (
                  <tr key={row.siswa_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs font-semibold text-slate-500">{row.nis}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">{row.nama_lengkap}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold text-slate-600">{row.kelas?.nama_kelas || '-'}</td>
                    <td className="text-center px-4 py-4 font-bold text-emerald-600">{row.Hadir}</td>
                    <td className="text-center px-4 py-4 font-bold text-amber-600">{row.Sakit}</td>
                    <td className="text-center px-4 py-4 font-bold text-blue-600">{row.Ijin}</td>
                    <td className="text-center px-4 py-4 font-bold text-violet-600">{row.Dispen}</td>
                    <td className="text-center px-4 py-4 font-bold text-rose-600">{row.Alpa}</td>
                    <td className="text-center px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                        row.persentase_hadir >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        row.persentase_hadir >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.persentase_hadir}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
