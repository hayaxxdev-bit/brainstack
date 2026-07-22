import React from 'react';
import { useStackStore } from './stores/useStackStore';
import { CardNode } from './components/canvas/CardNode';
import { WireOverlay } from './components/canvas/WireOverlay';
import { MiniMap } from './components/canvas/MiniMap';
import { Toolbar } from './components/ui/Toolbar';
import { PlayArena } from './components/play/PlayArena';
import { BrainCircuit, Layers, Search, X, EyeOff, Tag } from 'lucide-react';

export default function App() {
  const { 
    cards, isPlayMode, zoom, searchQuery, setSearchQuery, 
    isZenMode, toggleZenMode, selectedTag, setSelectedTag 
  } = useStackStore();

  return (
    <div className="relative w-screen h-screen bg-dot-grid overflow-hidden select-none">
      {/* Header Studio (Sembunyi saat Zen Mode) */}
      {!isZenMode && (
        <header className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-lg pointer-events-auto">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              BRAINSTACK STUDIO
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Visual Knowledge & Idea Playground</p>
          </div>
        </header>
      )}

      {/* Tombol Keluar dari Zen Mode (Hanya muncul saat Zen Mode Aktif) */}
      {isZenMode && (
        <button
          onClick={toggleZenMode}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-xl text-xs font-mono text-slate-300 transition-all cursor-pointer pointer-events-auto"
        >
          <EyeOff className="w-4 h-4 text-indigo-400" />
          <span>Exit Zen Mode</span>
        </button>
      )}

      {/* Panel Search, Filter Tag, & Counter (Sembunyi saat Zen Mode) */}
      {!isZenMode && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-auto">
          {/* Indikator Filter Tag Aktif */}
          {selectedTag && (
            <div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md animate-pulse">
              <Tag className="w-3.5 h-3.5" />
              <span>Filter: #{selectedTag}</span>
              <button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-white cursor-pointer" title="Reset filter tag">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fitur Search Spotlight */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari ide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-44 transition-all focus:w-60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Counter */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg text-xs font-mono text-slate-300 hidden md:flex">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Stacks: <strong className="text-white">{cards.length}</strong></span>
          </div>
        </div>
      )}

      {/* Area Kanvas Utama */}
      <main 
        id="brainstack-canvas-area"
        className="relative w-full h-full transform-gpu transition-transform duration-200 ease-out origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Mesin Garis SVG Murni */}
        <WireOverlay />

        {/* Render Kartu */}
        {cards.map((card) => (
          <CardNode key={card.id} data={card} />
        ))}
      </main>

      {/* Radar Mini-Map (Pojok Kanan Bawah) */}
      <MiniMap />

      {/* Toolbar Melayang */}
      <Toolbar />

      {/* Play Arena Mode */}
      {isPlayMode && <PlayArena />}
    </div>
  );
}