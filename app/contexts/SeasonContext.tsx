'use client';

import React, { createContext, useContext, useState } from 'react';

interface SeasonContextType {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [selectedSeason, setSelectedSeason] = useState<string>('current');

  return (
    <SeasonContext.Provider value={{ selectedSeason, setSelectedSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
}
