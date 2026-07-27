import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function SiswaUploadCsv() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    Papa.parse(f, {
      header: true,
      preview: 10,
      complete: (results) => setPreview(results.data),
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) {
      handleFile(f);
    } else {
      toast.error('Hanya file CSV yang diperbolehkan.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/siswa/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      toast.success(res.data.message || 'CSV berhasil di-import!', { icon: '✨' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload gagal.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-ai-pulse" />
          AI Batch Data Import
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Import Data Siswa (CSV)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Unggah file CSV untuk mengimpor atau memperbarui data siswa secara massal</p>
      </div>

      {/* Format Info Card */}
      <div className="ai-card-glow rounded-3xl p-5 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 border border-indigo-100">
        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Format Kolom CSV AI Engine:
        </p>
        <code className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 inline-block shadow-2xs">
          NIS, Nama, Kelas, Jenis Kelamin (L/P)
        </code>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`ai-card-glow rounded-3xl p-10 text-center transition-all duration-200 border-2 border-dashed ${
          dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-white'
        }`}
      >
        <FileText className="w-12 h-12 text-indigo-300 mx-auto mb-3 animate-pulse" />
        <p className="text-sm font-semibold text-slate-700 mb-3">
          {file ? `File terpilih: ${file.name}` : 'Tarik & lepaskan file CSV di sini'}
        </p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 cursor-pointer transition-all hover:scale-105">
          <Upload className="w-4 h-4" />
          Pilih File CSV
          <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </label>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="ai-card-glow rounded-3xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Preview AI Parser (10 Baris Pertama)</h3>
            <span className="text-xs font-semibold text-indigo-600">{preview.length} Baris Terbaca</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-800">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  {Object.keys(preview[0] || {}).map((key) => (
                    <th key={key} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-5 py-3 text-xs font-semibold text-slate-700">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {uploading ? 'AI Processing & Saving...' : 'Proses & Import ke Supabase'}
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="ai-card-glow rounded-3xl p-6 space-y-3 bg-white">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Hasil AI Batch Processing
          </h3>
          <div className="flex gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Berhasil: {result.berhasil}
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              <XCircle className="w-4 h-4" /> Gagal: {result.gagal}
            </span>
            <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Total Baris: {result.total_baris}
            </span>
          </div>

          {result.errors?.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Detail Catatan Error:
              </p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-rose-500 font-mono bg-rose-50 px-3 py-1 rounded-lg">Baris {err.baris}: {err.pesan}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
