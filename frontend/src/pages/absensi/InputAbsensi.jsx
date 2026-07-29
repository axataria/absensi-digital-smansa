import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ClipboardCheck, Save, ChevronDown, CalendarDays, Filter, Sparkles } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Hadir', label: 'Hadir', bg: 'bg-emerald-600', text: 'text-emerald-700' },
  { value: 'Sakit', label: 'Sakit', bg: 'bg-amber-500', text: 'text-amber-700' },
  { value: 'Ijin', label: 'Ijin', bg: 'bg-blue-600', text: 'text-blue-700' },
  { value: 'Dispen', label: 'Dispen', bg: 'bg-violet-600', text: 'text-violet-700' },
  { value: 'Alpa', label: 'Alpa', bg: 'bg-rose-600', text: 'text-rose-700' },
];

export default function InputAbsensi() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0]);
  const [kelasId, setKelasId] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [absensiData, setAbsensiData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch kelas list
  useEffect(() => {
    api.get('/kelas').then((res) => setKelasList(res.data.data || [])).catch(console.error);
  }, []);

  // Fetch siswa + absensi
  useEffect(() => {
    if (!kelasId) {
      setSiswaList([]);
      setAbsensiData({});
      return;
    }
    fetchAbsensi();
  }, [tanggal, kelasId]);

  const fetchAbsensi = async () => {
    setLoading(true);
    try {
      const res = await api.get('/absensi', { params: { tanggal, kelas_id: kelasId } });
      const data = res.data.data || [];
      setSiswaList(data);
      const state = {};
      data.forEach((s) => {
        state[s.siswa_id] = s.status_absensi || 'Hadir';
      });
      setAbsensiData(state);
      setHasChanges(false);
    } catch (err) {
      toast.error('Gagal memuat data siswa.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (siswaId, status) => {
    setAbsensiData((prev) => ({ ...prev, [siswaId]: status }));
    setHasChanges(true);
  };

  const handleSetAllStatus = (status) => {
    const newData = {};
    siswaList.forEach((s) => { newData[s.siswa_id] = status; });
    setAbsensiData(newData);
    setHasChanges(true);
    toast.success(`AI Action: Semua siswa di-set ${status}`, { icon: '✨' });
  };

  const handleSave = async () => {
    if (siswaList.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        tanggal_absen: tanggal,
        data: Object.entries(absensiData).map(([siswa_id, status]) => ({
          siswa_id: parseInt(siswa_id),
          status,
        })),
      };
      const res = await api.post('/absensi', payload);
      toast.success(res.data.message || 'Absensi berhasil disimpan!', { icon: '✅' });
      setHasChanges(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan absensi.');
    } finally {
      setSaving(false);
    }
  };

  const statusCounts = {};
  STATUS_OPTIONS.forEach((s) => { statusCounts[s.value] = 0; });
  Object.values(absensiData).forEach((status) => {
    if (statusCounts[status] !== undefined) statusCounts[status]++;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 w-max mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
            AI Smart Attendance Matrix
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Input Absensi Kolektif
          </h1>
          <p className="text-xs text-slate-500 font-medium">Pilih tanggal dan kelas untuk mencatat absensi siswa</p>
        </div>

        {siswaList.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                       bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                       text-white font-semibold text-xs shadow-lg shadow-indigo-500/25
                       hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        )}
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Tanggal Absen
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-indigo-500" />
              Pilih Kelas
            </label>
            <div className="relative w-full">
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all pr-10"
              >
                <option value="">— Pilih Kelas —</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kelas} ({k.tingkat})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Quick Batch Toolbar */}
      {siswaList.length > 0 && (
        <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Quick Set:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSetAllStatus(s.value)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold
                           bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600
                           shadow-2xs transition-all hover:scale-105"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${s.bg}`} />
                {s.label}: <span className="font-bold">{statusCounts[s.value]}</span>
                <span className="text-[10px] text-slate-400 font-normal">— Set Semua</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Student List Matrix Table */}
      {!kelasId ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-slate-200 shadow-2xs">
          <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">Silakan pilih kelas di atas untuk menampilkan daftar siswa.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl p-6 flex flex-col gap-3 border border-slate-200 shadow-2xs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-2xl" />
          ))}
        </div>
      ) : siswaList.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center border border-slate-200 shadow-2xs">
          <p className="text-slate-500 font-medium text-sm">Tidak ada siswa aktif ditemukan di kelas ini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-10 sm:w-16">No</th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Data Siswa</th>
                  <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswaList.map((siswa, index) => {
                  const currentStatus = absensiData[siswa.siswa_id] || 'Hadir';
                  const initials = siswa.nama_lengkap
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={siswa.siswa_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-400 align-middle">{index + 1}</td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-600">{initials}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{siswa.nama_lengkap}</p>
                            <p className="text-[10px] sm:text-xs font-medium text-slate-400">NIS: {siswa.nis}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
                          {STATUS_OPTIONS.map((opt) => {
                            const isActive = currentStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(siswa.siswa_id, opt.value)}
                                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-150 ${
                                  isActive
                                    ? `${opt.bg} text-white shadow-sm scale-105`
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-500 font-medium">
              Total Siswa: <span className="font-bold text-slate-800">{siswaList.length}</span>
            </p>
            {hasChanges && (
              <span className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Ada perubahan yang belum disimpan
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
