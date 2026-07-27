import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck,
  BarChart3, Upload, UserCog, LogOut, X, BookOpen, Sparkles, Shield
} from 'lucide-react';

const allMenuItems = [
  { path: '/', label: 'Dashboard AI', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { path: '/absensi/input', label: 'Input Absensi', icon: ClipboardCheck, roles: ['admin', 'user'] },
  { path: '/absensi/rekap', label: 'Rekap Absensi', icon: BarChart3, roles: ['admin', 'user'] },
  { path: '/siswa', label: 'Data Siswa', icon: GraduationCap, roles: ['admin', 'user'] },
  { path: '/kelas', label: 'Kelola Kelas', icon: BookOpen, roles: ['admin'] },
  { path: '/siswa/upload-csv', label: 'Import CSV', icon: Upload, roles: ['admin'] },
  { path: '/users', label: 'Kelola Akun', icon: UserCog, roles: ['admin'] },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        style={{ width: '260px' }}
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col
                    bg-slate-900 border-r border-slate-800 text-slate-200
                    transition-transform duration-300 ease-in-out
                    lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-white animate-ai-pulse" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight tracking-tight flex items-center gap-1.5">
                E-Absensi
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase">AI</span>
              </h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">Minimalist AI OS</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigasi Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold
                           transition-all duration-200 group relative
                           ${isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-500" />
                )}
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* AI Engine Status Card */}
        <div className="px-4 py-3 mx-4 mb-4 rounded-2xl bg-slate-800/40 border border-slate-800/80 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-ping" />
          <div className="text-[11px] min-w-0">
            <p className="text-slate-200 font-semibold truncate">Supabase DB Connected</p>
            <p className="text-slate-400 text-[10px]">AI Neural Sync Ready</p>
          </div>
        </div>

        {/* User Account & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.nama}</p>
                <p className="text-slate-400 text-[10px] flex items-center gap-1 capitalize">
                  <Shield className="w-2.5 h-2.5 text-indigo-400" />
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Keluar Akun"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
