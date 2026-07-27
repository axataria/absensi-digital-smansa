import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { UserCog, Plus, Pencil, Trash2, X, KeyRound, Sparkles } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [resetModal, setResetModal] = useState({ open: false, userId: null, userName: '' });
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus akun "${nama}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User berhasil dihapus.');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  const handleSave = async (formData) => {
    try {
      if (modal.mode === 'add') {
        await api.post('/users', formData);
        toast.success('User berhasil ditambahkan.');
      } else {
        await api.put(`/users/${modal.data.id}`, formData);
        toast.success('User berhasil diperbarui.');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }
    try {
      await api.put(`/users/${resetModal.userId}/reset-password`, { password: newPassword });
      toast.success('Password berhasil direset.');
      setResetModal({ open: false, userId: null, userName: '' });
      setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal reset password.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
            AI Identity & Access Management
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Kelola Akun Pengguna
          </h1>
          <p className="text-xs text-slate-500 mt-1">Kelola hak akses admin dan guru pada sistem absensi</p>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: 'add', data: null })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                     text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Tambah Akun Baru
        </button>
      </div>

      <div className="ai-card-glow rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80">
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-14">No</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Nama Pengguna</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Hak Akses / Role</th>
                  <th className="text-center px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{u.nama}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold capitalize ${
                        u.role === 'admin' ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModal({ open: true, mode: 'edit', data: u })}
                          className="p-1.5 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetModal({ open: true, userId: u.id, userName: u.nama })}
                          className="p-1.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.nama)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">{modal.mode === 'add' ? 'Tambah Akun Baru' : 'Edit Data Akun'}</h3>
              <button onClick={() => setModal({ open: false, mode: 'add', data: null })} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <UserForm
              mode={modal.mode}
              data={modal.data}
              onClose={() => setModal({ open: false, mode: 'add', data: null })}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 animate-scaleUp">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">Reset password akun untuk: <span className="font-bold text-slate-800">{resetModal.userName}</span></p>
            <input
              type="password"
              placeholder="Password baru (min 6 karakter)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setResetModal({ open: false, userId: null, userName: '' }); setNewPassword(''); }}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserForm({ mode, data, onClose, onSave }) {
  const [form, setForm] = useState({
    nama: data?.nama || '',
    email: data?.email || '',
    password: '',
    role: data?.role || 'user',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (mode === 'edit' && !payload.password) delete payload.password;
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Pengguna</label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          required
          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
        />
      </div>
      {mode === 'add' && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password Initial</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Hak Akses (Role)</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
        >
          <option value="user">Guru (User)</option>
          <option value="admin">Administrator</option>
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
          Simpan Akun
        </button>
      </div>
    </form>
  );
}
