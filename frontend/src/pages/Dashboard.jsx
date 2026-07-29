import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Users, UserCheck, Stethoscope, FileText, XCircle,
  TrendingUp, Sparkles, Zap, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
  Hadir: '#10B981',
  Sakit: '#F59E0B',
  Ijin: '#3B82F6',
  Dispen: '#8B5CF6',
  Alpa: '#EF4444',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const kehadiran = data?.kehadiran_hari_ini || {};
  const totalSiswa = data?.total_siswa_aktif || 0;
  const totalHadir = kehadiran.Hadir || 0;
  const persentaseTotal = totalSiswa > 0 ? Math.round((totalHadir / totalSiswa) * 100) : 0;

  const pieData = Object.entries(kehadiran)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const statCards = [
    {
      label: 'Total Siswa',
      value: totalSiswa,
      subtext: 'Terdaftar & Aktif',
      icon: Users,
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      label: 'Hadir Hari Ini',
      value: kehadiran.Hadir || 0,
      subtext: `${persentaseTotal}% Tingkat Kehadiran`,
      icon: UserCheck,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      label: 'Sakit',
      value: kehadiran.Sakit || 0,
      subtext: 'Izin Dokter / Orang Tua',
      icon: Stethoscope,
      badgeColor: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      label: 'Ijin / Dispen',
      value: (kehadiran.Ijin || 0) + (kehadiran.Dispen || 0),
      subtext: 'Kegiatan Sekolah',
      icon: FileText,
      badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      label: 'Alpa',
      value: kehadiran.Alpa || 0,
      subtext: 'Tanpa Keterangan',
      icon: XCircle,
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & AI Briefing Banner */}
      <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold w-max">
              <Sparkles className="w-3.5 h-3.5 animate-ai-pulse text-indigo-400" />
              AI Neural Executive Briefing
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              Selamat Datang, {user?.nama}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              AI telah memproses data kehadiran per tanggal <span className="font-semibold text-white">{data?.tanggal}</span>. 
              Status keseluruhan stabil dengan tingkat kehadiran <span className="text-emerald-400 font-bold">{persentaseTotal}%</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/absensi/input')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4 text-indigo-200" />
              Input Absensi
            </button>
            <button
              onClick={() => navigate('/absensi/rekap')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
            >
              Rekapitulasi
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 flex flex-col justify-between hover:-translate-y-1 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-2xl border ${card.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                <p className="text-[11px] font-semibold text-slate-500">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Bar Chart — Kehadiran per Kelas */}
        <div className="lg:col-span-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Persentase Kehadiran per Kelas</h3>
                <p className="text-xs text-slate-400">Analisis kehadiran kolektif hari ini</p>
              </div>
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Realtime Sync
            </span>
          </div>

          {data?.persentase_per_kelas?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.persentase_per_kelas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="nama_kelas" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                />
                <Bar dataKey="persentase" fill="#6366F1" radius={[10, 10, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[290px] flex flex-col items-center justify-center text-slate-400 text-sm">
              <Sparkles className="w-8 h-8 mb-2 text-indigo-300 animate-pulse" />
              Belum ada data absensi hari ini
            </div>
          )}
        </div>

        {/* Pie Chart — Status Distribution */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Status</h3>
              <p className="text-xs text-slate-400">Proporsi statistik hari ini</p>
            </div>
            <span className="ai-badge">
              <Sparkles className="w-3 h-3" /> AI Summary
            </span>
          </div>

          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[290px] flex flex-col items-center justify-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-300" />
              Semua siswa nihil catatan alpa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="skeleton h-36 rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-80 rounded-3xl" />
        <div className="skeleton h-80 rounded-3xl" />
      </div>
    </div>
  );
}
