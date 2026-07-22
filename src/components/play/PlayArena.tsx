import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStackStore } from '../../stores/useStackStore';
import { Trophy, ArrowRight, RotateCcw, X, Sparkles, Brain } from 'lucide-react';

export const PlayArena: React.FC = () => {
  const { cards, togglePlayMode } = useStackStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex flex-col items-center justify-center p-4">
        <p className="text-slate-400 font-mono mb-4">Tidak ada kartu di kanvas untuk dimainkan!</p>
        <button onClick={togglePlayMode} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-semibold">Kembali ke Canvas</button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setScore((prev) => prev + 100);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none">
      {/* Header Play Mode */}
      <div className="absolute top-6 w-full max-w-xl flex justify-between items-center px-4">
        <div className="flex items-center gap-2 font-mono text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20">
          <Brain className="w-4 h-4 animate-bounce" />
          <span>PLAY MODE • Card {currentIndex + 1} of {cards.length}</span>
        </div>
        <button onClick={togglePlayMode} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <div className="w-full max-w-md flex flex-col items-center">
            {/* Kartu Flashcard Flip Interaktif */}
            <motion.div
              key={currentCard.id + (isFlipped ? '-flip' : '-front')}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ borderTop: `6px solid ${currentCard.colorAccent || '#6366f1'}` }}
              className="w-full h-80 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col justify-between cursor-pointer relative overflow-hidden group hover:border-slate-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  {isFlipped ? '💡 Content / Answer' : '❓ Topic / Question'}
                </span>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  Klik untuk {isFlipped ? 'tutup' : 'balik'}
                </span>
              </div>

              <div className="my-auto text-center">
                {!isFlipped ? (
                  <h2 className="text-2xl font-bold text-slate-100 tracking-wide">
                    {currentCard.title}
                  </h2>
                ) : (
                  <p className="text-base font-mono text-slate-300 leading-relaxed">
                    {currentCard.content}
                  </p>
                )}
              </div>

              <div className="text-center text-[11px] font-mono text-slate-500">
                {isFlipped ? '✦ Sudah paham konsep ini? Klik tombol di bawah' : '✦ Coba ingat isinya sebelum membalik kartu!'}
              </div>
            </motion.div>

            {/* Tombol Aksi */}
            <button
              onClick={handleNext}
              className="mt-8 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
            >
              <span>{currentIndex + 1 === cards.length ? 'Selesaikan Stack!' : 'Lanjut ke Kartu Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Layar Kemenangan / Selesai */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
              <Trophy className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Stack Completed! 🎉</h2>
            <p className="text-xs text-slate-400 font-mono mb-6">
              Kamu berhasil menelusuri semua ide dalam tumpukan ini.
            </p>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 w-full mb-6 font-mono">
              <div className="text-xs text-slate-500 mb-1">Total Brain XP</div>
              <div className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>+{score + 100} XP</span>
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsCompleted(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi
              </button>
              <button
                onClick={togglePlayMode}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                Kembali ke Canvas
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};