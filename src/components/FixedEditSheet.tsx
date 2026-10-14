import { useState } from 'react';
import { MESI_FULL } from '../lib/format';
import type { FixedExpense } from '../lib/types';
import { Blueprint } from './Blueprint';
import './FixedEditSheet.css';
import { SheetOverlay } from './SheetOverlay';

export interface FixedEditDraft {
  kind: 'inc' | 'fix';
  id: string | null;
  name: string;
  /** stringa decimale con virgola, es. "12,99" */
  amt: string;
  day: string;
  freq: 'monthly' | 'annual';
  /** 1-12 come stringa, usato solo se freq è 'annual' */
  month: string;
}

interface FixedEditSheetProps {
  draft: FixedEditDraft;
  onSave: (item: Pick<FixedExpense, 'name' | 'amt' | 'day' | 'freq' | 'month'>) => void;
  onDelete: () => void;
  onClose: () => void;
}

function toNum(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

export function FixedEditSheet({ draft, onSave, onDelete, onClose }: FixedEditSheetProps) {
  const [name, setName] = useState(draft.name);
  const [amt, setAmt] = useState(draft.amt);
  const [day, setDay] = useState(draft.day);
  const [freq, setFreq] = useState(draft.freq);
  const [month, setMonth] = useState(draft.month || '1');

  const amtN = toNum(amt || '0');
  const dayN = parseInt(day, 10);
  const monthN = parseInt(month, 10);
  const invalid =
    !name.trim() ||
    !(amtN > 0) ||
    !(dayN >= 1 && dayN <= 31) ||
    (freq === 'annual' && !(monthN >= 1 && monthN <= 12));

  const title = `${draft.id ? 'Modifica' : 'Nuova'} ${draft.kind === 'inc' ? 'entrata fissa' : 'spesa fissa'}`;

  const save = () => {
    if (invalid) return;
    onSave({
      name: name.trim(),
      amt: amtN,
      day: dayN,
      freq,
      month: freq === 'annual' ? monthN : undefined,
    });
  };

  return (
    <SheetOverlay onClose={onClose}>
      <div className="sheet-form-top">
        <h4>{title}</h4>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annulla
        </button>
      </div>

      <div className="field">
        <label>Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Affitto" />
      </div>

      <div className="sheet-form-row">
        <div className="field">
          <label>Importo (€)</label>
          <input
            className="input"
            inputMode="decimal"
            value={amt}
            onChange={(e) => setAmt(e.target.value.replace(/[^\d,.]/g, ''))}
            placeholder="0,00"
          />
        </div>
        <div className="field">
          <label>Giorno</label>
          <input
            className="input"
            inputMode="numeric"
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="1–31"
          />
        </div>
      </div>

      {draft.kind === 'fix' && (
        <>
          <div className="fixed-edit-freq">
            <button
              type="button"
              className="fixed-edit-freq-btn"
              style={{
                background: freq === 'monthly' ? 'var(--color-accent)' : 'transparent',
                color: freq === 'monthly' ? 'var(--color-bg)' : 'var(--color-text)',
              }}
              onClick={() => setFreq('monthly')}
            >
              Ogni mese
            </button>
            <button
              type="button"
              className="fixed-edit-freq-btn fixed-edit-freq-btn-second"
              style={{
                background: freq === 'annual' ? 'var(--color-accent)' : 'transparent',
                color: freq === 'annual' ? 'var(--color-bg)' : 'var(--color-text)',
              }}
              onClick={() => setFreq('annual')}
            >
              Ogni anno
            </button>
          </div>

          {freq === 'annual' && (
            <div className="field">
              <label>Mese</label>
              <div className="fixed-edit-month-stepper">
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => setMonth(String(monthN <= 1 ? 12 : monthN - 1))}
                >
                  −
                </button>
                <span className="fixed-edit-month-val">{MESI_FULL[(monthN || 1) - 1]}</span>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => setMonth(String(monthN >= 12 ? 1 : monthN + 1))}
                >
                  +
                </button>
              </div>
              <span className="sheet-form-hint">Si conta per 1/12 ogni mese nello spendibile, per intero il giorno in cui scade.</span>
            </div>
          )}
        </>
      )}

      <Blueprint as="button" type="button" className="btn btn-primary sheet-form-save" disabled={invalid} onClick={save}>
        Salva
      </Blueprint>

      {draft.id && (
        <button type="button" className="btn btn-secondary sheet-form-delete" onClick={onDelete}>
          Elimina
        </button>
      )}
    </SheetOverlay>
  );
}
