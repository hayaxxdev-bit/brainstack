// src/types/index.ts

/**
 * Application-wide type definitions
 */

export interface CardNodeData {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppError {
  id: string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export interface AppConfig {
  zoom: {
    min: number;
    max: number;
    default: number;
  };
  search: {
    maxLength: number;
    placeholder: string;
  };
  error: {
    maxCount: number;
    resetTimeout: number;
  };
}

export type Theme = 'light' | 'dark' | 'system';
export type ViewMode = 'canvas' | 'list' | 'grid';
export type SortOrder = 'asc' | 'desc';
export type SortField = 'title' | 'createdAt' | 'updatedAt';