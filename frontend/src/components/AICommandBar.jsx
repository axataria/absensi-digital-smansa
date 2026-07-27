import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Command, ArrowRight, CheckCircle2, LayoutDashboard, UserCheck, FileSpreadsheet, Users, GraduationCap, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AICommandBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'dash', title: 'Buka Dashboard Summary', icon: LayoutDashboard, path: '/' },
    { id: 'input', title: 'Input Absensi Kolektif', icon: UserCheck, path: '/absensi/input' },
    { id: 'rekap', title: 'Lihat Rekapitulasi Kehadiran', icon: FileSpreadsheet, path: '/absensi/rekap' },
    { id: 'siswa', title: 'Kelola Data Siswa', icon: Users, path: '/siswa' },
    { id: 'csv', title: 'Import Data via CSV', icon: UploadCloud, path: '/siswa/upload-csv' },
    { id: 'kelas', title: 'Kelola Data Kelas', icon: GraduationCap, path: '/kelas' },
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (actionPath, title) => {
    setIsProcessing(true);
    toast.success(`AI Executing: ${title}`, { icon: '✨' });
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      if (actionPath) navigate(actionPath);
    }, 400);
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    const q = query.toLowerCase();

    setTimeout(() => {
      setIsProcessing(false);
      if (q.includes('input') || q.includes('absen')) {
        toast.success('AI Prompt: Membuka Input Absensi...', { icon: '🤖' });
        navigate('/absensi/input');
      } else if (q.includes('rekap') || q.includes('laporan')) {
        toast.success('AI Prompt: Membuka Rekap Absensi...', { icon: '📊' });
        navigate('/absensi/rekap');
      } else if (q.includes('siswa') || q.includes('murid')) {
        toast.success('AI Prompt: Membuka Data Siswa...', { icon: '🎓' });
        navigate('/siswa');
      } else if (q.includes('csv') || q.includes('import')) {
        toast.success('AI Prompt: Membuka Import CSV...', { icon: '📥' });
        navigate('/siswa/upload-csv');
      } else {
        toast.success(`AI Response: Menampilkan hasil untuk "${query}"`, { icon: '✨' });
        navigate('/');
      }
      onClose();
      setQuery('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden transition-all transform animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <form onSubmit={handlePromptSubmit} className="relative flex items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200 mr-3">
            <Sparkles className="w-4 h-4 text-white animate-ai-pulse" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tanyakan atau perintahkan AI (cth: 'Input absensi X-1', 'Rekap bulan ini')..."
            className="w-full text-base bg-transparent border-none text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {isProcessing ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              AI Thinking...
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Command className="w-3 h-3" /> K
            </div>
          )}
        </form>

        {/* Suggestions & Quick Actions */}
        <div className="p-4 max-h-[380px] overflow-y-auto space-y-2">
          <div className="px-3 py-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Aksi Pintar AI</span>
            <span>Navigasi Cepat</span>
          </div>

          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleExecute(action.path, action.title)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-sm text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{action.title}</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <span>Jalankan</span>
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-bounce" />
              <p className="text-sm font-medium">Tekan <kbd className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">Enter</kbd> untuk memproses perintah AI: "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            AI Assistant Engine Active
          </span>
          <span>Tekan <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">ESC</kbd> untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
