import { useEffect, useState } from 'react';
import type { PaymentMethod } from '../lib/types';
import { Blueprint } from './Blueprint';
import { SheetOverlay } from './SheetOverlay';
import './AddMovementSheet.css';

export type MovementType = 'in' | 'out';

export interface SavedMovement {
  type: MovementType;
  amt: number;
  cat: string;
  rec: boolean;
  method: PaymentMethod;
}

const OUT_CATS = ['Spesa', 'Ristoranti', 'Trasporti', 'Svago', 'Casa', 'Investimento', 'Altro'];
const IN_CATS = ['Stipendio', 'Extra', 'Rimborso', 'Regalo'];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'];

/** Max 2 decimali e 7 cifre, come da spec. */
function pressKey(amount: string, key: string): string {
  if (key === '⌫') return amount.slice(0, -1);
  if (key === ',') return amount.includes(',') ? amount : (amount || '0') + ',';
  if (amount.includes(',') && amount.split(',')[1].length >= 2) return amount;
  if (amount.replace(',', '').length >= 7) return amount;
  return amount === '0' ? key : amount + key;
}

interface AddMovementSheetProps {
  initialType: MovementType;
  onSave: (m: SavedMovement) => void;
  onClose: () => void;
}

export function AddMovementSheet({ initialType, onSave, onClose }: AddMovementSheetProps) {
  const [type, setType] = useState<MovementType>(initialType);
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [rec, setRec] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('card');

  useEffect(() => {
    setType(initialType);
    setAmount('');
    setCat(null);
    setRec(false);
    setMethod('card');
  }, [initialType]);

  const out = type === 'out';
  const list = out ? OUT_CATS : IN_CATS;
  const activeCat = cat && list.includes(cat) ? cat : list[0];
  const val = parseFloat((amount || '0').replace(',', '.'));
  const isInv = out && activeCat === 'Investimento';
  const showRec = !isInv;
  const showMethod = !isInv && !rec;
  const cantSave = !(val > 0);
  const saveLabel = !(val > 0)
    ? 'Inserisci un importo'
    : isInv
      ? 'Continua: scegli il titolo'
      : `Salva ${out ? 'uscita' : 'entrata'}`;

  const selectType = (t: MovementType) => {
    setType(t);
    setCat(null);
  };

  const save = () => {
    if (!(val > 0)) return;
    onSave({ type, amt: val, cat: activeCat, rec: isInv ? false : rec, method });
  };

  return (
    <SheetOverlay onClose={onClose}>
        <div className="add-sheet-top">
          <div className="add-sheet-seg">
            <button
              type="button"
              className="add-sheet-seg-btn"
              style={{ background: out ? 'var(--color-accent)' : 'transparent', color: out ? 'var(--color-bg)' : 'var(--color-text)' }}
              onClick={() => selectType('out')}
            >
              − Uscita
            </button>
            <button
              type="button"
              className="add-sheet-seg-btn add-sheet-seg-btn-second"
              style={{ background: !out ? 'var(--color-accent)' : 'transparent', color: !out ? 'var(--color-bg)' : 'var(--color-text)' }}
              onClick={() => selectType('in')}
            >
              + Entrata
            </button>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annulla
          </button>
        </div>

        <div className="add-sheet-amount">
          <span className="add-sheet-sign">{out ? '−' : '+'} €</span>
          <span className="add-sheet-value">{amount || '0'}</span>
        </div>

        <div className="add-sheet-cats">
          {list.map((name) => {
            const active = name === activeCat;
            return (
              <button
                key={name}
                type="button"
                className="add-sheet-cat"
                style={{
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-divider)',
                  background: active ? 'var(--color-accent-100)' : 'transparent',
                  color: active ? 'var(--color-accent-800)' : 'var(--color-text)',
                }}
                onClick={() => setCat(name)}
              >
                {name}
              </button>
            );
          })}
        </div>

        {showMethod && (
          <div className="add-sheet-method">
            <button
              type="button"
              className="add-sheet-method-btn"
              style={{
                background: method === 'card' ? 'var(--color-accent-100)' : 'transparent',
                borderColor: method === 'card' ? 'var(--color-accent)' : 'var(--color-divider)',
                color: method === 'card' ? 'var(--color-accent-800)' : 'var(--color-text)',
              }}
              onClick={() => setMethod('card')}
            >
              Carta / conto
            </button>
            <button
              type="button"
              className="add-sheet-method-btn"
              style={{
                background: method === 'cash' ? 'var(--color-accent-100)' : 'transparent',
                borderColor: method === 'cash' ? 'var(--color-accent)' : 'var(--color-divider)',
                color: method === 'cash' ? 'var(--color-accent-800)' : 'var(--color-text)',
              }}
              onClick={() => setMethod('cash')}
            >
              Contanti
            </button>
          </div>
        )}

        {showRec && (
          <button type="button" className="add-sheet-rec" onClick={() => setRec((r) => !r)}>
            <span className="add-sheet-rec-text">
              <span>{out ? 'Spesa fissa mensile' : 'Entrata fissa mensile'}</span>
              <span className="add-sheet-rec-hint">
                {rec ? 'Si ripete ogni mese e conta nel calcolo dello spendibile' : 'Una tantum, solo oggi'}
              </span>
            </span>
            <span className="add-sheet-toggle-track" style={{ background: rec ? 'var(--color-accent-100)' : 'transparent' }}>
              <span
                className="add-sheet-toggle-knob"
                style={{ left: rec ? '20px' : '2px', background: rec ? 'var(--color-accent)' : 'var(--color-neutral-400)' }}
              />
            </span>
          </button>
        )}

        <div className="add-sheet-keypad">
          {KEYS.map((k) => (
            <button key={k} type="button" className="add-sheet-key" onClick={() => setAmount((a) => pressKey(a, k))}>
              {k}
            </button>
          ))}
        </div>

        <Blueprint as="button" type="button" className="btn btn-primary add-sheet-save" disabled={cantSave} onClick={save}>
          {saveLabel}
        </Blueprint>
    </SheetOverlay>
  );
}
