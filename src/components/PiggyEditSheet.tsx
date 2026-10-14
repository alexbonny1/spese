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
  /** già risparmiato finora (0 per un salvadanaio nuovo), serve per il calcolo quota↔data */
  saved: number;
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

/** Mesi da oggi al MM/AAAA indicato (può essere negativo se già passato). */
function monthsFromNow(tm: number, ty: number): number {
  const now = new Date();
  return (ty - now.getFullYear()) * 12 + (tm - (now.getMonth() + 1));
}
function dateFromMonthsAhead(months: number): { tm: number; ty: number } {
  const now = new Date();
  const total = now.getMonth() + months;
  return { ty: now.getFullYear() + Math.floor(total / 12), tm: (((total % 12) + 12) % 12) + 1 };
}
/** Quota mensile necessaria per arrivare all'obiettivo entro la data data, dato quanto già risparmiato. */
function quotaFromDate(goalN: number, savedN: number, dateStr: string): string | null {
  const m = /^(\d{1,2})\/(\d{4})$/.exec(dateStr.trim());
  if (!m) return null;
  const tm = +m[1];
  if (tm < 1 || tm > 12) return null;
  const months = monthsFromNow(tm, +m[2]);
  if (months <= 0) return null;
  const left = Math.max(0, goalN - savedN);
  return String(Math.round((left / months) * 100) / 100).replace('.', ',');
}
/** Data stimata di raggiungimento obiettivo data la quota mensile, dato quanto già risparmiato. */
function dateFromQuota(goalN: number, savedN: number, quotaN: number): string | null {
  if (!(quotaN > 0)) return null;
  const left = Math.max(0, goalN - savedN);
  const months = Math.max(1, Math.ceil(left / quotaN));
  const { tm, ty } = dateFromMonthsAhead(months);
  return `${String(tm).padStart(2, '0')}/${ty}`;
}

export function PiggyEditSheet({ draft, onSave, onDelete, onClose }: PiggyEditSheetProps) {
  const [name, setName] = useState(draft.name);
  const [goal, setGoal] = useState(draft.goal);
  const [date, setDate] = useState(draft.date);
  const [quota, setQuota] = useState(draft.quota);
  const [lastEdited, setLastEdited] = useState<'quota' | 'date'>('date');

  const dateMatch = /^(\d{1,2})\/(\d{4})$/.exec(date.trim());
  const goalN = toNum(goal || '0');
  const quotaN = toNum(quota || '0');
  const invalid = !name.trim() || !(goalN > 0) || !(quotaN >= 0) || !dateMatch || +dateMatch[1] < 1 || +dateMatch[1] > 12;

  const onGoalChange = (v: string) => {
    const g = v.replace(/[^\d,.]/g, '');
    setGoal(g);
    const gN = toNum(g || '0');
    if (lastEdited === 'date') {
      const q = quotaFromDate(gN, draft.saved, date);
      if (q != null) setQuota(q);
    } else {
      const d = dateFromQuota(gN, draft.saved, quotaN);
      if (d != null) setDate(d);
    }
  };
  const onDateChange = (v: string) => {
    const d = v.replace(/[^\d/]/g, '').slice(0, 7);
    setDate(d);
    setLastEdited('date');
    const q = quotaFromDate(goalN, draft.saved, d);
    if (q != null) setQuota(q);
  };
  const onQuotaChange = (v: string) => {
    const q = v.replace(/[^\d,.]/g, '');
    setQuota(q);
    setLastEdited('quota');
    const d = dateFromQuota(goalN, draft.saved, toNum(q || '0'));
    if (d != null) setDate(d);
  };

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
          <input className="input" inputMode="decimal" value={goal} onChange={(e) => onGoalChange(e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>Entro (MM/AAAA)</label>
          <input
            className="input"
            inputMode="numeric"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            placeholder="06/2027"
          />
        </div>
      </div>

      <div className="field">
        <label>Quota mensile (€)</label>
        <input className="input" inputMode="decimal" value={quota} onChange={(e) => onQuotaChange(e.target.value)} placeholder="0" />
      </div>

      <span className="sheet-form-hint">
        Obiettivo, data e quota sono collegati: cambiandone uno ricalcolo gli altri due. La quota viene tolta in automatico
        dallo spendibile ogni mese.
      </span>

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
