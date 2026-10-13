import { useState } from 'react';
import { Blueprint } from './Blueprint';
import { SheetOverlay } from './SheetOverlay';
import './FixedEditSheet.css';

export interface FixedEditDraft {
  kind: 'inc' | 'fix';
  id: string | null;
  name: string;
  /** stringa decimale con virgola, es. "12,99" */
  amt: string;
  day: string;
}

interface FixedEditSheetProps {
  draft: FixedEditDraft;
  onSave: (item: { name: string; amt: number; day: number }) => void;
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

  const amtN = toNum(amt || '0');
  const dayN = parseInt(day, 10);
  const invalid = !name.trim() || !(amtN > 0) || !(dayN >= 1 && dayN <= 31);

  const title = `${draft.id ? 'Modifica' : 'Nuova'} ${draft.kind === 'inc' ? 'entrata fissa' : 'spesa fissa'}`;

  const save = () => {
    if (invalid) return;
    onSave({ name: name.trim(), amt: amtN, day: dayN });
  };

  return (
    <SheetOverlay onClose={onClose}>
      <div className="fixed-edit-top">
        <h4>{title}</h4>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annulla
        </button>
      </div>

      <div className="field">
        <label>Nome</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Affitto" />
      </div>

      <div className="fixed-edit-row">
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
          <label>Giorno del mese</label>
          <input
            className="input"
            inputMode="numeric"
            value={day}
            onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="1–31"
          />
        </div>
      </div>

      <Blueprint as="button" type="button" className="btn btn-primary fixed-edit-save" disabled={invalid} onClick={save}>
        Salva
      </Blueprint>

      {draft.id && (
        <button type="button" className="btn btn-secondary fixed-edit-delete" onClick={onDelete}>
          Elimina
        </button>
      )}
    </SheetOverlay>
  );
}
