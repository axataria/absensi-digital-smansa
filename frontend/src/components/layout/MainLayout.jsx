import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AICommandBar from '../AICommandBar';
import { Menu, Sparkles, Command, Search } from 'lucide-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 ai-glow-bg antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <AICommandBar isOpen={commandBarOpen} onClose={() => setCommandBarOpen(false)} />

      {/* Main content area */}
      <div className="min-h-screen transition-all flex flex-col" style={{ marginLeft: '260px' }}>
        {/* Top Navigation Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* AI Command Input Trigger */}
            <button
              onClick={() => setCommandBarOpen(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 
                         hover:border-indigo-300 text-slate-400 text-xs font-medium shadow-2xs transition-all w-64 md:w-80"
            >
              <Search className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="flex-1 text-left truncate">Perintahkan AI / Cari data...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded-md border border-slate-200">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Cloud</span>
            </div>

            <button
              onClick={() => setCommandBarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5 animate-ai-pulse text-white" />
              <span>AI Command Bar</span>
            </button>
          </div>
        </header>

        {/* Main Content Container with Explicit Padding & Spacing */}
        <main className="flex-1 py-8 px-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
