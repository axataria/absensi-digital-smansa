import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Plus, Search, Pencil, Trash2, X, ChevronDown, Sparkles } from 'lucide-react';

export default function SiswaList() {
  const { isAdmin } = useAuth();
  const [siswa, setSiswa] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (filterKelas) params.kelas_id = filterKelas;
      const res = await api.get('/siswa', { params });
      setSiswa(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/kelas').then((res) => setKelasList(res.data.data || [])).catch(console.error);
  }, []);

  useEffect(() => { fetchSiswa(); }, [search, filterKelas]);

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus data siswa "${nama}"?`)) return;
    try {
      await api.delete(`/siswa/${id}`);
      toast.success('Siswa berhasil dihapus.');
      fetchSiswa();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  const handleSaveModal = async (formData) => {
    try {
      if (modal.mode === 'add') {
        await api.post('/siswa', formData);
        toast.success('Siswa berhasil ditambahkan.');
      } else {
        await api.put(`/siswa/${modal.data.id}`, formData);
        toast.success('Data siswa berhasil diperbarui.');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchSiswa();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
            AI Student Database
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Data Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">Kelola direktori siswa terdaftar pada Supabase Database</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setModal({ open: true, mode: 'add', data: null })}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                       text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa Baru
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="ai-card-glow rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>
        <div className="relative w-full sm:w-52">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="ai-card-glow rounded-2xl sm:rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}</div>
        ) : siswa.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm font-medium">Tidak ada data siswa ditemukan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80">
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-10 sm:w-14">No</th>
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">NIS</th>
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nama</th>
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Kelas</th>
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">JK</th>
                  <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  {isAdmin() && <th className="text-center px-3 sm:px-5 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswa.map((s, i) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-slate-500">{s.nis}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{s.nama_lengkap}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{s.kelas?.nama_kelas || '-'}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold">{s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        s.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        s.status === 'pindah' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setModal({ open: true, mode: 'edit', data: s })}
                            className="p-1.5 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.nama_lengkap)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <SiswaModal
          mode={modal.mode}
          data={modal.data}
          kelasList={kelasList}
          onClose={() => setModal({ open: false, mode: 'add', data: null })}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}

function SiswaModal({ mode, data, kelasList, onClose, onSave }) {
  const [form, setForm] = useState({
    nis: data?.nis || '',
    nama_lengkap: data?.nama_lengkap || '',
    kelas_id: data?.kelas_id || '',
    jenis_kelamin: data?.jenis_kelamin || 'L',
    status: data?.status || 'aktif',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-scaleUp">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">{mode === 'add' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">NIS</label>
            <input
              type="text"
              value={form.nis}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Kelas</label>
            <select
              value={form.kelas_id}
              onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="">Pilih Kelas</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
          </div>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                name="jk"
                value="L"
                checked={form.jenis_kelamin === 'L'}
                onChange={() => setForm({ ...form, jenis_kelamin: 'L' })}
                className="accent-indigo-600"
              />
              Laki-laki
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
              <input
                type="radio"
                name="jk"
                value="P"
                checked={form.jenis_kelamin === 'P'}
                onChange={() => setForm({ ...form, jenis_kelamin: 'P' })}
                className="accent-indigo-600"
              />
              Perempuan
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
