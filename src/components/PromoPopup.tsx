import { useState } from 'react';
import { Blueprint } from './Blueprint';
import './PromoPopup.css';

const DISMISS_KEY = 'saldo-promo-dismissed-v1';

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

interface PromoPopupProps {
  onAddMovement: () => void;
}

/** Popup di benvenuto mostrato in Home solo a patrimonio zero e nessun movimento registrato. */
export function PromoPopup({ onAddMovement }: PromoPopupProps) {
  const [dismissed, setDismissed] = useState(wasDismissed);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // storage non disponibile: il popup potrà ripresentarsi, non è grave
    }
    setDismissed(true);
  };

  return (
    <div className="promo-overlay">
      <div className="promo-backdrop" onClick={dismiss} />
      <Blueprint className="promo-card">
        <span className="card-kicker promo-kicker">Benvenuto in Saldo</span>
        <h4>Inizia a tracciare le tue finanze</h4>
        <p className="promo-text">
          Il tuo patrimonio è ancora a zero e non hai registrato nessun movimento. Aggiungi la tua prima
          entrata o spesa per iniziare a vedere quanto puoi spendere ogni giorno.
        </p>
        <div className="promo-actions">
          <Blueprint
            as="button"
            type="button"
            className="btn btn-primary promo-cta"
            onClick={() => {
              dismiss();
              onAddMovement();
            }}
          >
            Aggiungi un movimento
          </Blueprint>
          <button type="button" className="btn btn-ghost promo-skip" onClick={dismiss}>
            Più tardi
          </button>
        </div>
      </Blueprint>
    </div>
  );
}
