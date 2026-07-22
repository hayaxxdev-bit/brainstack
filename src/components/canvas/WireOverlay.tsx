import React from 'react';
import { useStackStore } from '../../stores/useStackStore';

export const WireOverlay: React.FC = () => {
  const { cards, connections, deleteConnection } = useStackStore();

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <defs>
        {/* Desain Kepala Panah */}
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const fromCard = cards.find((c) => c.id === conn.from);
        const toCard = cards.find((c) => c.id === conn.to);

        if (!fromCard || !toCard) return null;

        // Hitung koordinat tengah kartu (w-80 = 320px -> setengahnya 160px)
        const startX = fromCard.x + 160;
        const startY = fromCard.y + 60;
        const endX = toCard.x + 160;
        const endY = toCard.y + 60;

        // Kalkulasi kurva melengkung (Bézier Curve) agar natural ala diagram modern
        const dx = Math.abs(endX - startX) * 0.5;
        const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

        return (
          <g key={conn.id} className="group pointer-events-auto cursor-pointer">
            {/* Garis transparan tebal untuk area klik yang lebih mudah */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              onClick={() => {
                if (confirm('Hapus garis koneksi ini?')) deleteConnection(conn.id);
              }}
            />
            {/* Garis Visual Utama */}
            <path
              d={pathData}
              fill="none"
              stroke="#64748b"
              strokeWidth="3"
              strokeDasharray="4 2"
              markerEnd="url(#arrowhead)"
              className="group-hover:stroke-rose-500 group-hover:stroke-[4px] transition-all duration-200"
            />
          </g>
        );
      })}
    </svg>
  );
};