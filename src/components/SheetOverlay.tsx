import type { ReactNode } from 'react';
import './SheetOverlay.css';

interface SheetOverlayProps {
  onClose: () => void;
  children: ReactNode;
}

/** Overlay con backdrop + pannello bottom-sheet, condiviso da tutti gli sheet dell'app. */
export function SheetOverlay({ onClose, children }: SheetOverlayProps) {
  return (
    <div className="sheet-overlay">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-panel">{children}</div>
    </div>
  );
}
