import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil! Selamat datang.', { icon: '✨' });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden ai-glow-bg">
      {/* AI Ambient Glowing Light Orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Minimalist AI Glass Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 mb-4 shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Sparkles className="w-7 h-7 text-white animate-ai-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              E-Absensi
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">AI OS</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">Sistem Absensi Digital Siswa Minimalis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sekolah.sch.id"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-800 bg-slate-950/60 text-slate-100 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-800 bg-slate-950/60 text-slate-100 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                         text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-100
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  Mengautentikasi AI...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk ke E-Absensi
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
