import React from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, Sparkles, Trash2, Share2, Tag } from 'lucide-react';
import { type CardNodeData, useStackStore } from '../../stores/useStackStore';

interface CardNodeProps {
  data: CardNodeData;
}

export const CardNode: React.FC<CardNodeProps> = ({ data }) => {
  const { 
    updateCardPosition, deleteCard, startConnection, 
    completeConnection, connectingFromId, searchQuery,
    selectedTag, setSelectedTag
  } = useStackStore();

  const isConnecting = connectingFromId !== null;
  const isSource = connectingFromId === data.id;

  // Logika Filter Gabungan (Pencarian Teks & Filter Tag)
  const matchesSearch = searchQuery === '' || 
    data.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    data.content.toLowerCase().includes(searchQuery.toLowerCase());
    
  const matchesTag = selectedTag === null || (data.tags && data.tags.includes(selectedTag));
  
  const isMatch = matchesSearch && matchesTag;

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnecting) {
      startConnection(data.id);
    } else {
      completeConnection(data.id);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: data.x, y: data.y }}
      onDragEnd={(_, info) => {
        updateCardPosition(data.id, data.x + info.offset.x, data.y + info.offset.y);
      }}
      whileHover={{ scale: 1.02, zIndex: 50 }}
      whileDrag={{ scale: 1.05, zIndex: 100, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ borderTop: `4px solid ${data.colorAccent || '#3b82f6'}` }}
      className={`absolute top-0 left-0 w-80 bg-slate-900/90 backdrop-blur-md border rounded-xl p-4 shadow-2xl cursor-grab select-none group text-slate-100 transition-all duration-300 ${
        isSource ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-800/80 hover:border-slate-700'
      } ${!isMatch ? 'opacity-15 pointer-events-none scale-95 grayscale' : 'opacity-100 z-10'}`}
    >
      {/* Header Kartu */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 pr-2 overflow-hidden">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
          <h3 className="font-semibold text-sm tracking-wide text-slate-200 truncate">{data.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleConnectClick}
            className={`p-1 rounded transition-all cursor-pointer ${
              isSource 
                ? 'bg-amber-500 text-slate-950 animate-pulse' 
                : isConnecting 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 animate-bounce' 
                : 'opacity-0 group-hover:opacity-100 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400'
            }`}
            title={isConnecting ? 'Klik untuk menyambungkan ke sini!' : 'Hubungkan dengan kartu lain'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCard(data.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
            title="Hapus kartu"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <GripHorizontal className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
        </div>
      </div>

      {/* Konten Kartu */}
      <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap mb-3">
        {data.content}
      </p>

      {/* Render Tags (Bisa diklik untuk filter cepat!) */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle filter tag
                setSelectedTag(selectedTag === tag ? null : tag);
              }}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-indigo-500 text-white font-bold ring-1 ring-indigo-400'
                  : 'bg-slate-950/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/40">
        <span>ID: {data.id.slice(-4)}</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          Active
        </span>
      </div>
    </motion.div>
  );
};