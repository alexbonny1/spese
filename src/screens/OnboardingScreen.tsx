import { useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { fmt } from '../lib/format';
import './OnboardingScreen.css';

interface OnboardingScreenProps {
  onComplete: (v: { cash: number; bank: number; invested: number }) => void;
}

function cleanDecimal(v: string): string {
  return v.replace(/[^\d,.]/g, '');
}

function toNum(v: string): number {
  return parseFloat(v.replace(',', '.')) || 0;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [cash, setCash] = useState('');
  const [bank, setBank] = useState('');
  const [invested, setInvested] = useState('');

  const cashN = toNum(cash);
  const bankN = toNum(bank);
  const investedN = toNum(invested);
  const total = cashN + bankN + investedN;

  const submit = () => onComplete({ cash: cashN, bank: bankN, invested: investedN });

  return (
    <div className="onboarding-screen">
      <div className="onboarding-body">
        <span className="onboarding-kicker">Benvenuto</span>
        <h3>Qual è il tuo patrimonio attuale?</h3>
        <p className="onboarding-hint">
          Quello che hai già oggi, diviso per dove si trova. Da qui in poi Saldo aggiungerà quello che
          registri tu: entrate, spese, salvadanai e acquisti.
        </p>

        <div className="field onboarding-field">
          <label>Contanti (€)</label>
          <input className="input" inputMode="decimal" autoFocus value={cash} onChange={(e) => setCash(cleanDecimal(e.target.value))} placeholder="0,00" />
        </div>
        <div className="field onboarding-field">
          <label>Saldo sul conto (€)</label>
          <input className="input" inputMode="decimal" value={bank} onChange={(e) => setBank(cleanDecimal(e.target.value))} placeholder="0,00" />
        </div>
        <div className="field onboarding-field">
          <label>Già investito (€)</label>
          <input className="input" inputMode="decimal" value={invested} onChange={(e) => setInvested(cleanDecimal(e.target.value))} placeholder="0,00" />
          <span className="sheet-form-hint">Valore totale, non serve indicare i singoli titoli: quelli li aggiungi con "Cerca e compra".</span>
        </div>

        {total > 0 && (
          <div className="onboarding-total">
            <span>Patrimonio di partenza</span>
            <span>€ {fmt(total)}</span>
          </div>
        )}
      </div>

      <div className="onboarding-footer">
        <Blueprint as="button" type="button" className="btn btn-primary onboarding-start" onClick={submit}>
          Inizia
        </Blueprint>
        <button type="button" className="btn btn-ghost onboarding-skip" onClick={() => onComplete({ cash: 0, bank: 0, invested: 0 })}>
          Parto da zero
        </button>
      </div>
    </div>
  );
}
