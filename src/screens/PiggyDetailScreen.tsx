import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { FullScreenOverlay } from '../components/FullScreenOverlay';
import type { PiggyCalc } from '../lib/calc';
import './PiggyDetailScreen.css';

type ContributeMode = 'in' | 'out';

interface PiggyDetailScreenProps {
  piggy: PiggyCalc;
  onBack: () => void;
  onEdit: () => void;
  onContribute: (amt: number, mode: ContributeMode) => void;
}

export function PiggyDetailScreen({ piggy, onBack, onEdit, onContribute }: PiggyDetailScreenProps) {
  const [mode, setMode] = useState<ContributeMode | null>(null);
  const [amount, setAmount] = useState('');

  const toggleMode = (m: ContributeMode) => {
    setMode((cur) => (cur === m ? null : m));
    setAmount('');
  };

  const amtN = parseFloat((amount || '0').replace(',', '.'));
  const invalid = !(amtN > 0) || (mode === 'out' && amtN > piggy.saved);

  const confirm = () => {
    if (invalid || !mode) return;
    onContribute(amtN, mode);
    setMode(null);
    setAmount('');
  };

  return (
    <FullScreenOverlay>
      <div className="piggy-detail-top">
        <button type="button" className="btn btn-ghost piggy-detail-back" onClick={onBack}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          Risparmi
        </button>
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Modifica
        </button>
      </div>

      <div className="piggy-detail-body">
        <div className="piggy-detail-head">
          <h3>{piggy.piggy.name}</h3>
          <div className="piggy-detail-amount">
            <span className="piggy-detail-saved">€ {piggy.savedF}</span>
            <span className="piggy-detail-goal">di € {piggy.goalF}</span>
          </div>
        </div>

        <div className="piggy-detail-progress">
          <Blueprint className="piggy-detail-bar">
            <div className="piggy-detail-bar-fill" style={{ width: piggy.w }} />
          </Blueprint>
          <div className="piggy-detail-progress-labels">
            <span>{piggy.pctF} raggiunto</span>
            <span>mancano € {piggy.leftF}</span>
          </div>
        </div>

        <div className="piggy-detail-grid">
          <div className="piggy-detail-cell">
            <div className="card-kicker piggy-detail-kicker">Quota attuale</div>
            <div className="piggy-detail-cell-value">€ {piggy.quotaF}/mese</div>
          </div>
          <div className="piggy-detail-cell">
            <div className="card-kicker piggy-detail-kicker">Servono per {piggy.dateF}</div>
            <div className="piggy-detail-cell-value">{piggy.needF}</div>
          </div>
        </div>

        <span className="piggy-detail-hint" style={{ color: piggy.hintColor }}>
          {piggy.hint}
        </span>

        <div className="piggy-detail-actions">
          <Blueprint
            as="button"
            type="button"
            className="btn btn-secondary piggy-action-btn"
            style={{ background: mode === 'in' ? 'var(--color-accent-100)' : 'transparent' }}
            onClick={() => toggleMode('in')}
          >
            + Versa
          </Blueprint>
          <Blueprint
            as="button"
            type="button"
            className="btn btn-secondary piggy-action-btn"
            style={{ background: mode === 'out' ? 'var(--color-accent-100)' : 'transparent' }}
            onClick={() => toggleMode('out')}
          >
            − Preleva
          </Blueprint>
        </div>

        {mode && (
          <div className="piggy-detail-mode">
            <div className="piggy-detail-mode-row">
              <div className="field">
                <label>{mode === 'out' ? 'Importo da prelevare (€)' : 'Importo da versare (€)'}</label>
                <input
                  className="input"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d,.]/g, ''))}
                  placeholder="0,00"
                />
              </div>
              <Blueprint as="button" type="button" className="btn btn-primary piggy-confirm-btn" disabled={invalid} onClick={confirm}>
                Conferma
              </Blueprint>
            </div>
            <span className="sheet-form-hint">
              {mode === 'out'
                ? `Torna nello spendibile di questo mese. Disponibile € ${piggy.savedF}`
                : 'Viene tolto subito dallo spendibile di questo mese.'}
            </span>
          </div>
        )}

        <div className="piggy-detail-hist">
          <h5>Storico</h5>
          {piggy.hist.map((e) => (
            <div key={e.id} className="piggy-hist-row">
              <div className="piggy-hist-text">
                <span className="piggy-hist-label">{e.label}</span>
                <span className="piggy-hist-date">{e.date}</span>
              </div>
              <span className="piggy-hist-amt" style={{ color: e.color }}>
                {e.amtF}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FullScreenOverlay>
  );
}
