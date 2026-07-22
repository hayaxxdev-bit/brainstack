import React, { useState } from 'react';
import { useStackStore } from '../../stores/useStackStore';
import { Plus, Play, RotateCcw, X, Check, ZoomIn, ZoomOut, Camera, Share2, Dices, Eye } from 'lucide-react';
import { toPng } from 'html-to-image';

export const Toolbar: React.FC = () => {
  const { 
    addCard, togglePlayMode, resetToDefault, zoom, setZoom, 
    connectingFromId, cancelConnection, isZenMode, toggleZenMode 
  } = useStackStore();
  
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [colorAccent, setColorAccent] = useState('#6366f1');
  const [isExporting, setIsExporting] = useState(false);

  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  // Generator Ide dengan Otomatisasi Tag
  const handleInspireMe = () => {
    const randomIdeas = [
      { t: '⚡ Optimasi Web Performance', c: 'Gunakan Web Workers untuk kalkulasi berat agar UI tidak freeze.', col: '#10b981', tags: 'performance, react' },
      { t: '🎮 Game Loop Mechanics', c: 'Deteksi collision antar sprite 2D menggunakan metode AABB Bounding Box.', col: '#ec4899', tags: 'gamedev, physics' },
      { t: '🔐 Auth & Security', c: 'Implementasi Role-Based Access Control (RBAC) dengan Row Level Security.', col: '#6366f1', tags: 'database, security' },
      { t: '🌌 Cyberpunk UI Aesthetics', c: 'Buat efek neon glow dengan CSS drop-shadow dan transisi font berdenyut.', col: '#8b5cf6', tags: 'ui, design' },
      { t: '📊 State Architecture', c: 'Kapan harus pakai Zustand vs React Context API dalam skala besar?', col: '#f59e0b', tags: 'architecture, state' }
    ];
    const picked = randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
    setTitle(picked.t);
    setContent(picked.c);
    setColorAccent(picked.col);
    setTagsInput(picked.tags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Ubah string "react, gamedev" menjadi array ['react', 'gamedev']
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    addCard(title, content, colorAccent, parsedTags);
    setTitle('');
    setContent('');
    setTagsInput('');
    setIsOpenModal(false);
  };

  const handleExportImage = async () => {
    const canvasElement = document.getElementById('brainstack-canvas-area');
    if (!canvasElement) return;

    try {
      setIsExporting(true);
      const currentZoom = zoom;
      setZoom(1);

      setTimeout(async () => {
        const dataUrl = await toPng(canvasElement, { backgroundColor: '#0f172a', quality: 0.95 });
        setZoom(currentZoom);
        setIsExporting(false);
        const link = document.createElement('a');
        link.download = `brainstack-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }, 300);
    } catch (err) {
      console.error('Gagal export gambar:', err);
      setIsExporting(false);
    }
  };

  // Sembunyikan Toolbar normal jika Zen Mode Aktif
  if (isZenMode) return null;

  return (
    <>
      {/* Banner Saat Menyambungkan Kartu */}
      {connectingFromId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500/20 border border-amber-500/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 text-xs text-amber-300 shadow-xl animate-pulse">
          <Share2 className="w-4 h-4" />
          <span>Mode Koneksi Aktif: Klik tombol konektor (cabang) pada kartu tujuan!</span>
          <button onClick={cancelConnection} className="ml-2 px-2 py-0.5 bg-slate-900/80 hover:bg-rose-500/40 text-slate-300 rounded text-[10px] cursor-pointer">
            Batal
          </button>
        </div>
      )}

      {/* Toolbar Utama */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl flex-wrap justify-center">
        <button onClick={() => setIsOpenModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95">
          <Plus className="w-4 h-4" />
          <span>Add Card</span>
        </button>

        <button onClick={togglePlayMode} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer active:scale-95">
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play Stack</span>
        </button>

        <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 px-1.5 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Tombol Zen Mode */}
        <button onClick={toggleZenMode} className="p-2 bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-500/30" title="Aktifkan Zen Mode (Sembunyikan UI)">
          <Eye className="w-4 h-4" />
        </button>

        <button onClick={handleExportImage} disabled={isExporting} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50" title="Export Canvas to Image">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export PNG'}</span>
        </button>

        <button onClick={() => { if (confirm('Reset semua tumpukan?')) resetToDefault(); }} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors cursor-pointer" title="Reset Stack">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Modal Form Tambah Ide */}
      {isOpenModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button type="button" onClick={() => setIsOpenModal(false)} className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-white">Buat Ide Baru</h3>
              <button type="button" onClick={handleInspireMe} className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer">
                <Dices className="w-3.5 h-3.5" />
                <span>Inspire Me!</span>
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Judul Ide / Pertanyaan</label>
                <input type="text" required placeholder="e.g., Alur Login Supabase" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Konten / Penjelasan / Jawaban</label>
                <textarea required rows={3} placeholder="Tulis detail ide atau jawaban di sini..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none" />
              </div>

              {/* Input Tags Baru */}
              <div>
                <label className="block text-slate-400 mb-1">Tags (pisahkan dengan koma)</label>
                <input type="text" placeholder="e.g., react, gamedev, ui" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 lowercase" />
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Aksen Warna Kartu</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button key={color} type="button" onClick={() => setColorAccent(color)} style={{ backgroundColor: color }} className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                      {colorAccent === color && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsOpenModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300">Batal</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">Simpan ke Canvas</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};