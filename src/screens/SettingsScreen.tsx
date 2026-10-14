import { useState } from 'react';
import { fmt, fq } from '../lib/format';
import { getPeriod } from '../lib/period';
import { useAppState } from '../state/AppStateContext';
import './SettingsScreen.css';

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
function cleanDecimal(v: string): string {
  return v.replace(/[^\d,.]/g, '');
}

interface SettingsScreenProps {
  onOpenRisparmi: () => void;
}

/** Riga Contanti/Conto: valore + link "Modifica" che apre un campo inline. */
function EditableAmountRow({
  label,
  hint,
  value,
  onSave,
}: {
  label: string;
  hint: string;
  value: number;
  onSave: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const save = () => {
    const n = parseFloat(input.replace(',', '.'));
    if (!(n >= 0)) return;
    onSave(n);
    setEditing(false);
  };

  return (
    <div className="settings-row settings-row-amount">
      <div className="settings-text">
        <span>{label}</span>
        <span className="settings-hint">{hint}</span>
      </div>
      {editing ? (
        <div className="settings-amount-edit">
          <input
            className="input settings-amount-input"
            inputMode="decimal"
            autoFocus
            value={input}
            onChange={(e) => setInput(cleanDecimal(e.target.value))}
            placeholder="0,00"
          />
          <button type="button" className="btn btn-primary settings-amount-save" onClick={save}>
            Salva
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="settings-value settings-amount-trigger"
          onClick={() => {
            setInput(String(value).replace('.', ','));
            setEditing(true);
          }}
        >
          € {fmt(value)} ›
        </button>
      )}
    </div>
  );
}

export function SettingsScreen({ onOpenRisparmi }: SettingsScreenProps) {
  const { data, setData, resetData } = useAppState();
  const period = getPeriod(new Date(), data.payday);
  const quotaTot = data.piggies.reduce((x, p) => x + p.quota, 0);

  const setPayday = (d: number) => setData((prev) => ({ ...prev, payday: clamp(prev.payday + d, 1, 28) }));
  const setAlert = (d: number) => setData((prev) => ({ ...prev, alert: clamp(prev.alert + d, 0, 200) }));
  const toggleExtra = () => setData((prev) => ({ ...prev, extra: !prev.extra }));
  const togglePerDay = () => setData((prev) => ({ ...prev, perDay: !prev.perDay }));

  return (
    <div className="settings-screen">
      <div className="settings-top">
        <h3>Impostazioni</h3>
      </div>
      <div className="settings-body">
        <h6 className="settings-section">Patrimonio</h6>

        <EditableAmountRow
          label="Contanti"
          hint="Quanto hai in contanti oggi"
          value={data.initialCash}
          onSave={(n) => setData((prev) => ({ ...prev, initialCash: n }))}
        />
        <EditableAmountRow
          label="Conto / carta"
          hint="Saldo sul conto o sulla carta digitale"
          value={data.initialBank}
          onSave={(n) => setData((prev) => ({ ...prev, initialBank: n }))}
        />
        <div className="settings-row">
          <span className="settings-label-flex">Totale contanti + conto</span>
          <span className="settings-value-static">€ {fmt(data.initialCash + data.initialBank)}</span>
        </div>

        <h6 className="settings-section">Calcolo dello spendibile</h6>

        <div className="settings-row">
          <div className="settings-text">
            <span>Giorno dello stipendio</span>
            <span className="settings-hint">Il periodo va da qui al giorno prima del prossimo: {period.label}</span>
          </div>
          <div className="settings-stepper">
            <button type="button" className="btn btn-icon settings-stepper-btn" onClick={() => setPayday(-1)}>
              −
            </button>
            <span className="settings-stepper-val">{data.payday}</span>
            <button type="button" className="btn btn-icon settings-stepper-btn" onClick={() => setPayday(1)}>
              +
            </button>
          </div>
        </div>

        <button type="button" className="settings-row settings-row-btn" onClick={toggleExtra}>
          <div className="settings-text">
            <span>Conta le entrate extra</span>
            <span className="settings-hint">Le entrate una tantum aumentano lo spendibile</span>
          </div>
          <span className="settings-toggle-track" style={{ background: data.extra ? 'var(--color-accent-100)' : 'transparent' }}>
            <span
              className="settings-toggle-knob"
              style={{ left: data.extra ? '20px' : '2px', background: data.extra ? 'var(--color-accent)' : 'var(--color-neutral-400)' }}
            />
          </span>
        </button>

        <button type="button" className="settings-row settings-row-btn" onClick={onOpenRisparmi}>
          <div className="settings-text">
            <span>Quote di risparmio</span>
            <span className="settings-hint">Si impostano per ogni salvadanaio in Fisse › Risparmi</span>
          </div>
          <span className="settings-value">€ {fq(quotaTot)}/mese ›</span>
        </button>

        <h6 className="settings-section">Home</h6>

        <button type="button" className="settings-row settings-row-btn" onClick={togglePerDay}>
          <div className="settings-text">
            <span>Mostra quanto puoi spendere al giorno</span>
          </div>
          <span className="settings-toggle-track" style={{ background: data.perDay ? 'var(--color-accent-100)' : 'transparent' }}>
            <span
              className="settings-toggle-knob"
              style={{ left: data.perDay ? '20px' : '2px', background: data.perDay ? 'var(--color-accent)' : 'var(--color-neutral-400)' }}
            />
          </span>
        </button>

        <div className="settings-row">
          <div className="settings-text">
            <span>Avviso sotto i … al giorno</span>
            <span className="settings-hint">{data.alert ? 'Mostra un avviso in home' : 'Nessun avviso'}</span>
          </div>
          <div className="settings-stepper">
            <button type="button" className="btn btn-icon settings-stepper-btn" onClick={() => setAlert(-5)}>
              −
            </button>
            <span className="settings-stepper-val settings-stepper-val-wide">{data.alert ? `€ ${data.alert}` : 'No'}</span>
            <button type="button" className="btn btn-icon settings-stepper-btn" onClick={() => setAlert(5)}>
              +
            </button>
          </div>
        </div>

        <h6 className="settings-section">Investimenti</h6>

        <div className="settings-row">
          <div className="settings-text">
            <span>Tasse sul guadagno</span>
            <span className="settings-hint">26% sulle plusvalenze</span>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label-flex">Cambio USD/EUR</span>
          <span className="settings-value-static">1,08 (esempio)</span>
        </div>

        <h6 className="settings-section">Dati</h6>

        <div className="settings-row">
          <span className="settings-label-flex">Valuta</span>
          <span className="settings-value-static">Euro (€)</span>
        </div>
        <button type="button" className="btn btn-secondary settings-reset" onClick={resetData}>
          Ripristina dati di esempio
        </button>
      </div>
    </div>
  );
}
