'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'table'
            ? 'bg-white text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List size={16} />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          view === 'cards'
            ? 'bg-white text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
