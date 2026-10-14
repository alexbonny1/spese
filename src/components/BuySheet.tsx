import { useState } from 'react';
import { computeBuy, type BuyMode } from '../lib/buy';
import { fmt, fq } from '../lib/format';
import type { Security } from '../lib/types';
import { Blueprint } from './Blueprint';
import './BuySheet.css';
import { SheetOverlay } from './SheetOverlay';

export interface BuyResult {
  qty: number;
  price: number;
  fee: number;
  pac: boolean;
  pacDay: number | null;
  /** totale in € */
  total: number;
}

interface BuySheetProps {
  security: Security;
  /** importo pre-compilato (dallo sheet Aggiungi movimento, categoria Investimento) */
  prefillAmount: number | null;
  /** giorno del mese corrente, per precompilare "Giorno del mese" del PAC */
  today: number;
  onConfirm: (result: BuyResult) => void;
  onClose: () => void;
}

function cleanDecimal(v: string): string {
  return v.replace(/[^\d,.]/g, '');
}

export function BuySheet({ security, prefillAmount, today, onConfirm, onClose }: BuySheetProps) {
  const [mode, setMode] = useState<BuyMode>(prefillAmount != null ? 'amt' : 'qty');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(String(security.price).replace('.', ','));
  const [amt, setAmt] = useState(prefillAmount != null ? String(prefillAmount).replace('.', ',') : '');
  const [fee, setFee] = useState('');
  const [pac, setPac] = useState(false);
  const [pacDay, setPacDay] = useState(String(today));

  const bv = computeBuy(security, mode, qty, price, amt, fee, pac, pacDay);
  const curSym = security.cur === 'USD' ? '$' : '€';

  const confirm = () => {
    if (bv.invalid) return;
    onConfirm({ qty: bv.qty, price: bv.price, fee: bv.fee, pac, pacDay: pac ? bv.pacDay : null, total: bv.tot });
  };

  return (
    <SheetOverlay onClose={onClose}>
      <div className="sheet-form-top">
        <h4>Compra {security.sym}</h4>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Annulla
        </button>
      </div>

      <div className="buy-mode-seg">
        <button
          type="button"
          className="buy-mode-btn"
          style={{
            background: mode === 'qty' ? 'var(--color-accent)' : 'transparent',
            color: mode === 'qty' ? 'var(--color-bg)' : 'var(--color-text)',
          }}
          onClick={() => setMode('qty')}
        >
          Quote e prezzo
        </button>
        <button
          type="button"
          className="buy-mode-btn buy-mode-btn-second"
          style={{
            background: mode === 'amt' ? 'var(--color-accent)' : 'transparent',
            color: mode === 'amt' ? 'var(--color-bg)' : 'var(--color-text)',
          }}
          onClick={() => setMode('amt')}
        >
          Importo totale
        </button>
      </div>

      {mode === 'qty' ? (
        <div className="sheet-form-row">
          <div className="field">
            <label>Quote</label>
            <input className="input" inputMode="decimal" value={qty} onChange={(e) => setQty(cleanDecimal(e.target.value))} placeholder="0" />
          </div>
          <div className="field">
            <label>Prezzo ({curSym})</label>
            <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(cleanDecimal(e.target.value))} />
          </div>
        </div>
      ) : (
        <div className="field">
          <label>Importo da investire (€, commissioni incluse)</label>
          <input className="input" inputMode="decimal" value={amt} onChange={(e) => setAmt(cleanDecimal(e.target.value))} placeholder="0,00" />
        </div>
      )}

      <div className="field">
        <label>Commissioni (€)</label>
        <input className="input" inputMode="decimal" value={fee} onChange={(e) => setFee(cleanDecimal(e.target.value))} placeholder="0,00" />
      </div>

      <button type="button" className="buy-pac-toggle" onClick={() => setPac((p) => !p)}>
        <span className="buy-pac-text">
          <span>Ripeti ogni mese (PAC)</span>
          <span className="sheet-form-hint">Stesso importo, conteggiato nelle spese fisse</span>
        </span>
        <span className="buy-toggle-track" style={{ background: pac ? 'var(--color-accent-100)' : 'transparent' }}>
          <span
            className="buy-toggle-knob"
            style={{ left: pac ? '20px' : '2px', background: pac ? 'var(--color-accent)' : 'var(--color-neutral-400)' }}
          />
        </span>
      </button>

      {pac && (
        <div className="field">
          <label>Giorno del mese</label>
          <input
            className="input"
            inputMode="numeric"
            value={pacDay}
            onChange={(e) => setPacDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="1–28"
          />
        </div>
      )}

      <div className="buy-summary">
        <div className="buy-summary-row">
          <span>{fq(bv.qty || 0)} quote</span>
          <span>€ {fmt(bv.tot || 0)}</span>
        </div>
        <span className="sheet-form-hint">
          {pac
            ? `Poi € ${fmt(bv.tot || 0)} ogni mese il giorno ${pacDay || '…'}, conteggiati nelle spese fisse.`
            : 'Tolto dallo spendibile di questo mese.'}
        </span>
      </div>

      <Blueprint as="button" type="button" className="btn btn-primary sheet-form-save" disabled={bv.invalid} onClick={confirm}>
        Conferma acquisto
      </Blueprint>
    </SheetOverlay>
  );
}
