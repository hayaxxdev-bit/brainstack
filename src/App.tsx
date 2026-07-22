// src/App.tsx

import React, { memo, useCallback, useMemo, useEffect, useRef } from 'react';
import { useStackStore } from './stores/useStackStore';
import { CardNode } from './components/canvas/CardNode';
import { WireOverlay } from './components/canvas/WireOverlay';
import { MiniMap } from './components/canvas/MiniMap';
import { Toolbar } from './components/ui/Toolbar';
import { PlayArena } from './components/play/PlayArena';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { BrainCircuit, Layers, Search, X, EyeOff, Tag } from 'lucide-react';

// Import types dengan type-only import
import type { CardNodeData } from './types';
import type { ErrorInfo } from 'react';

/**
 * Constants
 */
const CONSTANTS = {
  CANVAS_ID: 'brainstack-canvas-area',
  ANIMATION_DURATION: 200,
  ZOOM_MIN: 0.25,
  ZOOM_MAX: 3.0,
  DEFAULT_SEARCH_PLACEHOLDER: 'Cari ide...',
  KEYBOARD_SHORTCUTS: {
    ZEN_MODE: 'Escape',
    SEARCH_FOCUS: 'k',
  },
  MAX_SEARCH_LENGTH: 100,
} as const;

/**
 * Type definitions
 */
interface AppHeaderProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  selectedTag: string | null;
  onClearTag: () => void;
  cardCount: number;
}

interface CanvasAreaProps {
  zoom: number;
  cards: CardNodeData[];
}

/**
 * Type guard untuk validasi CardNodeData
 */
const isValidCardData = (data: unknown): data is CardNodeData => {
  if (!data || typeof data !== 'object') return false;
  const card = data as Record<string, unknown>;
  return (
    typeof card.id === 'string' &&
    typeof card.title === 'string' &&
    typeof card.content === 'string' &&
    typeof card.x === 'number' &&
    typeof card.y === 'number'
  );
};

/**
 * Memoized Header Component
 */
const AppHeader = memo<AppHeaderProps>(({ isZenMode, onToggleZenMode }) => {
  if (isZenMode) {
    return (
      <button
        onClick={onToggleZenMode}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-xl text-xs font-mono text-slate-300 transition-all cursor-pointer pointer-events-auto focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        aria-label="Exit Zen Mode"
        title={`Exit Zen Mode (${CONSTANTS.KEYBOARD_SHORTCUTS.ZEN_MODE})`}
        type="button"
      >
        <EyeOff className="w-4 h-4 text-indigo-400" aria-hidden="true" />
        <span>Exit Zen Mode</span>
      </button>
    );
  }

  return (
    <header 
      className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-lg pointer-events-auto"
      role="banner"
      aria-label="BrainStack Studio Header"
    >
      <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400" aria-hidden="true">
        <BrainCircuit className="w-6 h-6" />
      </div>
      <div>
        <h1 className="font-bold text-sm tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          BRAINSTACK STUDIO
        </h1>
        <p className="text-[10px] text-slate-400 font-mono">Visual Knowledge & Idea Playground</p>
      </div>
    </header>
  );
});

AppHeader.displayName = 'AppHeader';

/**
 * Memoized Search Panel Component
 */
const SearchPanel = memo<SearchPanelProps>(({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch, 
  selectedTag, 
  onClearTag, 
  cardCount 
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClearSearch();
      searchInputRef.current?.blur();
    }
  }, [onClearSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[<>]/g, '');
    onSearchChange(sanitizedValue);
  }, [onSearchChange]);

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-auto" role="search">
      {/* Active Tag Filter Indicator */}
      {selectedTag && (
        <div 
          className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <Tag className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Filter: #{selectedTag}</span>
          <button 
            onClick={onClearTag} 
            className="ml-1 hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded transition-colors"
            title="Reset filter tag"
            aria-label={`Remove ${selectedTag} filter`}
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder={CONSTANTS.DEFAULT_SEARCH_PLACEHOLDER}
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pl-8 pr-8 py-2 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 w-44 transition-all focus:w-60"
          aria-label="Search ideas"
          autoComplete="off"
          spellCheck={false}
          maxLength={CONSTANTS.MAX_SEARCH_LENGTH}
        />
        {searchQuery && (
          <button 
            onClick={onClearSearch} 
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Card Counter */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg text-xs font-mono text-slate-300">
        <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        <span>Stacks: <strong className="text-white">{cardCount}</strong></span>
      </div>
    </div>
  );
});

SearchPanel.displayName = 'SearchPanel';

/**
 * Memoized Canvas Area Component
 */
const CanvasArea = memo<CanvasAreaProps>(({ zoom, cards }) => {
  const safeZoom = useMemo(() => {
    return Math.max(CONSTANTS.ZOOM_MIN, Math.min(CONSTANTS.ZOOM_MAX, zoom));
  }, [zoom]);

  const validCards = useMemo(() => {
    return cards.filter(card => {
      const isValid = isValidCardData(card);
      if (!isValid) {
        console.warn('Invalid card data detected and filtered:', card);
      }
      return isValid;
    });
  }, [cards]);

  return (
    <main 
      id={CONSTANTS.CANVAS_ID}
      className="relative w-full h-full transform-gpu transition-transform duration-200 ease-out origin-center"
      style={{ transform: `scale(${safeZoom})` }}
      role="main"
      aria-label="Canvas area"
    >
      <WireOverlay />
      {validCards.map((card) => (
        <CardNode key={card.id} data={card} />
      ))}
    </main>
  );
});

CanvasArea.displayName = 'CanvasArea';

/**
 * Custom hook untuk keyboard shortcuts
 */
const useKeyboardShortcuts = () => {
  const { toggleZenMode, isPlayMode } = useStackStore();
  
  const isInputFocused = useCallback((): boolean => {
    const target = document.activeElement as HTMLElement;
    return !!(
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.isContentEditable ||
      target?.getAttribute('role') === 'textbox'
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPlayMode) return;
      if (isInputFocused()) return;

      if (e.key === CONSTANTS.KEYBOARD_SHORTCUTS.ZEN_MODE) {
        e.preventDefault();
        toggleZenMode();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === CONSTANTS.KEYBOARD_SHORTCUTS.SEARCH_FOCUS) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[aria-label="Search ideas"]');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode, isPlayMode, isInputFocused]);
};

/**
 * Custom hook untuk error handling
 */
const useAppErrorHandler = () => {
  const handleAppError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error('App Error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Optional: Send to analytics in production
    if (import.meta.env.PROD) {
      console.log('Error reported to monitoring service');
    }
  }, []);

  const handleAppReset = useCallback(() => {
    console.log('App reset after error');
    window.location.hash = '';
  }, []);

  return { handleAppError, handleAppReset };
};

/**
 * Main App Component
 */
function App() {
  const { 
    cards = [], 
    isPlayMode = false, 
    zoom = 1, 
    searchQuery = '', 
    setSearchQuery, 
    isZenMode = false, 
    toggleZenMode, 
    selectedTag = null, 
    setSelectedTag 
  } = useStackStore();

  const { handleAppError, handleAppReset } = useAppErrorHandler();

  useKeyboardShortcuts();

  const handleSearchChange = useCallback((query: string) => {
    const sanitizedQuery = query.replace(/[<>]/g, '').slice(0, CONSTANTS.MAX_SEARCH_LENGTH);
    setSearchQuery(sanitizedQuery);
  }, [setSearchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleClearTag = useCallback(() => {
    setSelectedTag(null);
  }, [setSelectedTag]);

  const handleToggleZenMode = useCallback(() => {
    toggleZenMode();
  }, [toggleZenMode]);

  const canvasContent = useMemo(() => {
    if (!Array.isArray(cards)) {
      console.error('Invalid cards data structure');
      return null;
    }
    return <CanvasArea zoom={zoom} cards={cards as CardNodeData[]} />;
  }, [zoom, cards]);

  const playArenaContent = useMemo(() => {
    if (!isPlayMode) return null;
    return <PlayArena />;
  }, [isPlayMode]);

  return (
    <ErrorBoundary
      onError={handleAppError}
      onReset={handleAppReset}
      maxErrorCount={3}
      resetTimeout={5000}
      showDetails={import.meta.env.DEV}
    >
      <div 
        className="relative w-screen h-screen bg-dot-grid overflow-hidden select-none"
        data-testid="brainstack-app"
        role="application"
        aria-label="BrainStack Studio Application"
      >
        <AppHeader 
          isZenMode={isZenMode} 
          onToggleZenMode={handleToggleZenMode} 
        />

        {!isZenMode && (
          <SearchPanel
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            selectedTag={selectedTag}
            onClearTag={handleClearTag}
            cardCount={cards.length}
          />
        )}

        {canvasContent}

        <MiniMap />
        <Toolbar />

        {playArenaContent}
      </div>
    </ErrorBoundary>
  );
}

export default App;