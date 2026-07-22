import React from 'react';
import { useStackStore } from '../../stores/useStackStore';
import { Compass } from 'lucide-react';

export const MiniMap: React.FC = () => {
  const { cards, isZenMode } = useStackStore();

  // Sembunyikan mini-map saat dalam Zen Mode
  if (isZenMode || cards.length === 0) return null;

  // Hitung perkiraan batas koordinat untuk scaling
  const maxCoord = 1200; // Skala area kanvas
  const mapWidth = 140;
  const mapHeight = 100;

  return (
    <div className="absolute bottom-6 right-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-2xl hidden lg:block select-none pointer-events-auto">
      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1">
        <Compass className="w-3 h-3 text-indigo-400 animate-spin-slow" />
        <span>RADAR MAP</span>
      </div>

      <div 
        className="relative bg-slate-950/80 border border-slate-800/60 rounded-lg overflow-hidden"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {/* Render setiap kartu sebagai titik warna di radar */}
        {cards.map((card) => {
          // Normalisasi koordinat ke skala ukuran MiniMap
          const left = Math.min(Math.max((card.x / maxCoord) * mapWidth, 4), mapWidth - 8);
          const top = Math.min(Math.max((card.y / maxCoord) * mapHeight, 4), mapHeight - 8);

          return (
            <div
              key={`minimap-${card.id}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                backgroundColor: card.colorAccent || '#6366f1',
              }}
              className="absolute w-2 h-2 rounded-full shadow-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
              title={card.title}
            />
          );
        })}
      </div>
    </div>
  );
};