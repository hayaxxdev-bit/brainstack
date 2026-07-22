import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CardNodeData {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  colorAccent?: string;
  tags?: string[];
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

interface StackStore {
  cards: CardNodeData[];
  connections: Connection[];
  isPlayMode: boolean;
  isZenMode: boolean;
  zoom: number;
  connectingFromId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  
  // Actions
  updateCardPosition: (id: string, x: number, y: number) => void;
  addCard: (title: string, content: string, colorAccent: string, tags?: string[]) => void;
  deleteCard: (id: string) => void;
  togglePlayMode: () => void;
  toggleZenMode: () => void;
  resetToDefault: () => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
  startConnection: (id: string) => void;
  completeConnection: (toId: string) => void;
  cancelConnection: () => void;
  deleteConnection: (id: string) => void;
}

const defaultCards: CardNodeData[] = [
  { id: 'node-1', title: '💡 Idea #1: Stacking Physics', content: 'Gunakan Framer Motion untuk fisika drag bebas dengan spring damping.', x: 100, y: 150, colorAccent: '#6366f1', tags: ['animation', 'react'] },
  { id: 'node-2', title: '🎮 Idea #2: Gamified Loop', content: 'Ubah tumpukan kartu ini jadi teka-teki logika atau flashcard interaktif.', x: 520, y: 150, colorAccent: '#ec4899', tags: ['gameplay', 'logic'] },
  { id: 'node-3', title: '🚀 Idea #3: Open-Source Hub', content: 'Biar komunitas bisa saling fork dan mengadopsi stack ide terbaik!', x: 300, y: 420, colorAccent: '#10b981', tags: ['community', 'github'] },
];

const defaultConnections: Connection[] = [
  { id: 'conn-1', from: 'node-1', to: 'node-2' },
  { id: 'conn-2', from: 'node-2', to: 'node-3' }
];

export const useStackStore = create<StackStore>()(
  persist(
    (set, get) => ({
      cards: defaultCards,
      connections: defaultConnections,
      isPlayMode: false,
      isZenMode: false,
      zoom: 1,
      connectingFromId: null,
      searchQuery: '',
      selectedTag: null,

      updateCardPosition: (id, x, y) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, x, y } : card
          ),
        })),

      addCard: (title, content, colorAccent, tags = []) =>
        set((state) => {
          const newId = `node-${Date.now()}`;
          return {
            cards: [
              ...state.cards,
              {
                id: newId,
                title,
                content,
                x: Math.floor(Math.random() * 150) + 200,
                y: Math.floor(Math.random() * 150) + 200,
                colorAccent,
                tags: tags.length > 0 ? tags : ['general'],
              },
            ],
          };
        }),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          connections: state.connections.filter((c) => c.from !== id && c.to !== id),
        })),

      togglePlayMode: () => set((state) => ({ isPlayMode: !state.isPlayMode })),
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      resetToDefault: () => set({ cards: defaultCards, connections: defaultConnections, zoom: 1, searchQuery: '', selectedTag: null }),
      
      setZoom: (zoomVal) => 
        set((state) => ({ zoom: typeof zoomVal === 'function' ? zoomVal(state.zoom) : zoomVal })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTag: (tag) => set({ selectedTag: tag }),

      startConnection: (id) => set({ connectingFromId: id }),

      completeConnection: (toId) => {
        const { connectingFromId, connections } = get();
        if (connectingFromId && connectingFromId !== toId) {
          const exists = connections.some(
            (c) => (c.from === connectingFromId && c.to === toId) || (c.from === toId && c.to === connectingFromId)
          );
          if (!exists) {
            set({
              connections: [...connections, { id: `conn-${Date.now()}`, from: connectingFromId, to: toId }],
              connectingFromId: null
            });
            return;
          }
        }
        set({ connectingFromId: null });
      },

      cancelConnection: () => set({ connectingFromId: null }),
      deleteConnection: (id) => set((state) => ({ connections: state.connections.filter((c) => c.id !== id) })),
    }),
    { name: 'brainstack-studio-storage' }
  )
);