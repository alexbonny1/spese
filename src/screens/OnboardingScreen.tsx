import { useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { fmt } from '../lib/format';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
  onComplete: (initialBalance: number) => void;
}

function cleanDecimal(v: string): string {
  return v.replace(/[^\d,.]/g, '');
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [amt, setAmt] = useState('');
  const n = parseFloat(amt.replace(',', '.')) || 0;

  return (
    <div className="onboarding-screen">
      <div className="onboarding-body">
        <span className="onboarding-kicker">Benvenuto</span>
        <h3>Qual è il tuo patrimonio attuale?</h3>
        <p className="onboarding-hint">
          Conto, contanti, risparmi e investimenti che hai già oggi. Da qui in poi Saldo aggiungerà
          quello che registri tu: entrate, spese, salvadanai e acquisti.
        </p>

        <div className="field onboarding-field">
          <label>Patrimonio iniziale (€)</label>
          <input
            className="input onboarding-input"
            inputMode="decimal"
            autoFocus
            value={amt}
            onChange={(e) => setAmt(cleanDecimal(e.target.value))}
            placeholder="0,00"
          />
        </div>

        {n > 0 && <span className="onboarding-preview">€ {fmt(n)}</span>}
      </div>

      <div className="onboarding-footer">
        <Blueprint as="button" type="button" className="btn btn-primary onboarding-start" onClick={() => onComplete(n)}>
          Inizia
        </Blueprint>
        <button type="button" className="btn btn-ghost onboarding-skip" onClick={() => onComplete(0)}>
          Parto da zero
        </button>
      </div>
    </div>
  );
}
