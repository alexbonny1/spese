import { useState } from 'react';
import { Blueprint } from './Blueprint';
import { SheetOverlay } from './SheetOverlay';

export interface PiggyEditDraft {
  id: string | null;
  name: string;
  /** stringa decimale con virgola */
  goal: string;
  /** MM/AAAA */
  date: string;
  quota: string;
}

export interface PiggySaveItem {
  name: string;
  goal: number;
  tm: number;
  ty: number;
  quota: number;
}

interface PiggyEditSheetProps {
  draft: PiggyEditDraft;
  onSave: (item: PiggySaveItem) => void;
  onDelete: () => void;
  onClose: () => void;
}

function toNum(s: string): number {
  return parseFloat(s.replace(',', '.'));
}

export function PiggyEditSheet({ draft, onSave, onDelete, onClose }: PiggyEditSheetProps) {
  const [name, setName] = useState(draft.name);
  const [goal, setGoal] = useState(draft.goal);
  const [date, setDate] = useState(draft.date);
  const [quota, setQuota] = useState(draft.quota);

  const dateMatch = /^(\d{1,2})\/(\d{4})$/.exec(date.trim());
  const goalN = toNum(goal || '0');
  const quotaN = toNum(quota || '0');
  const invalid = !name.trim() || !(goalN > 0) || !(quotaN >= 0) || !dateMatch || +dateMatch[1] < 1 || +dateMatch[1] > 12;

  const title = draft.id ? 'Modifica salvadanaio' : 'Nuovo salvadanaio';

  const save = () => {
    if (invalid || !dateMatch) return;
    onSave({ name: name.trim(), goal: goalN, tm: +dateMatch[1], ty: +dateMatch[2], quota: quotaN });
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
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Vacanze" />
      </div>

      <div className="sheet-form-row">
        <div className="field">
          <label>Obiettivo (€)</label>
          <input
            className="input"
            inputMode="decimal"
            value={goal}
            onChange={(e) => setGoal(e.target.value.replace(/[^\d,.]/g, ''))}
            placeholder="0"
          />
        </div>
        <div className="field">
          <label>Entro (MM/AAAA)</label>
          <input
            className="input"
            inputMode="numeric"
            value={date}
            onChange={(e) => setDate(e.target.value.replace(/[^\d/]/g, '').slice(0, 7))}
            placeholder="06/2027"
          />
        </div>
      </div>

      <div className="field">
        <label>Quota mensile (€)</label>
        <input
          className="input"
          inputMode="decimal"
          value={quota}
          onChange={(e) => setQuota(e.target.value.replace(/[^\d,.]/g, ''))}
          placeholder="0"
        />
      </div>

      <span className="sheet-form-hint">La quota viene tolta in automatico dallo spendibile ogni mese.</span>

      <Blueprint as="button" type="button" className="btn btn-primary sheet-form-save" disabled={invalid} onClick={save}>
        Salva
      </Blueprint>

      {draft.id && (
        <button type="button" className="btn btn-secondary sheet-form-delete" onClick={onDelete}>
          Elimina salvadanaio
        </button>
      )}
    </SheetOverlay>
  );
}
