import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Pencil, Trash2, X, Users, Sparkles } from 'lucide-react';

export default function KelasList() {
  const [kelas, setKelas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });

  const fetchKelas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kelas');
      setKelas(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchKelas();
    api.get('/users').then((res) => setUsers(res.data.data || [])).catch(console.error);
  }, []);

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus kelas "${nama}"?`)) return;
    try {
      await api.delete(`/kelas/${id}`);
      toast.success('Kelas berhasil dihapus.');
      fetchKelas();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  const handleSave = async (formData) => {
    try {
      if (modal.mode === 'add') {
        await api.post('/kelas', formData);
        toast.success('Kelas berhasil ditambahkan.');
      } else {
        await api.put(`/kelas/${modal.data.id}`, formData);
        toast.success('Kelas berhasil diperbarui.');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchKelas();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
            AI Class Architecture
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Kelola Data Kelas
          </h1>
          <p className="text-xs text-slate-500 mt-1">Struktur organisasi kelas dan penugasan wali kelas</p>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: 'add', data: null })}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                     text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-3xl" />)
        ) : kelas.length === 0 ? (
          <div className="col-span-full ai-card-glow rounded-3xl p-16 text-center text-slate-400 text-sm font-medium">
            Belum ada data kelas terdaftar
          </div>
        ) : (
          kelas.map((k) => (
            <div key={k.id} className="ai-card-glow rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      Tingkat {k.tingkat || '-'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-2">{k.nama_kelas}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setModal({ open: true, mode: 'edit', data: k })}
                      className="p-1.5 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(k.id, k.nama_kelas)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-medium">Tahun Ajaran: {k.tahun_ajaran || '-'}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium mt-4">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {k.dataValues?.jumlah_siswa ?? k.jumlah_siswa ?? '0'} Siswa
                </span>
                {k.waliKelas ? (
                  <span className="text-indigo-600 font-semibold truncate max-w-[130px]">Wali: {k.waliKelas.nama}</span>
                ) : (
                  <span className="text-slate-400">Wali: Belum di-set</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modal.open && (
        <KelasModal
          mode={modal.mode}
          data={modal.data}
          users={users}
          onClose={() => setModal({ open: false, mode: 'add', data: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function KelasModal({ mode, data, users, onClose, onSave }) {
  const [form, setForm] = useState({
    nama_kelas: data?.nama_kelas || '',
    tingkat: data?.tingkat || 'X',
    tahun_ajaran: data?.tahun_ajaran || '2026/2027',
    wali_kelas_id: data?.wali_kelas_id || '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-scaleUp">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">{mode === 'add' ? 'Tambah Kelas Baru' : 'Edit Data Kelas'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Kelas</label>
            <input
              type="text"
              value={form.nama_kelas}
              onChange={(e) => setForm({ ...form, nama_kelas: e.target.value })}
              required
              placeholder="contoh: X-1, XI-IPA-2"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tingkat</label>
              <select
                value={form.tingkat}
                onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              >
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tahun Ajaran</label>
              <input
                type="text"
                value={form.tahun_ajaran}
                onChange={(e) => setForm({ ...form, tahun_ajaran: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Wali Kelas</label>
            <select
              value={form.wali_kelas_id}
              onChange={(e) => setForm({ ...form, wali_kelas_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            >
              <option value="">— Tidak Ada —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>)}
            </select>
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
              Simpan Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
