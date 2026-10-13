import type { ReactNode } from 'react';
import './FullScreenOverlay.css';

interface FullScreenOverlayProps {
  children: ReactNode;
  zIndex?: number;
}

/** Schermata a tutto schermo con push/back (Dettaglio salvadanaio, Ricerca titoli, Dettaglio titolo). */
export function FullScreenOverlay({ children, zIndex = 10 }: FullScreenOverlayProps) {
  return (
    <div className="fullscreen-overlay" style={{ zIndex }}>
      {children}
    </div>
  );
}
