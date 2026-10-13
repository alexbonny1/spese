import { ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FixedEditSheet, type FixedEditDraft } from '../components/FixedEditSheet';
import { computeFixedScreen, type FixedRow } from '../lib/fixed';
import { uid } from '../lib/id';
import type { FixTabId } from '../lib/nav';
import { useAppState } from '../state/AppStateContext';
import './FixedScreen.css';
import { InvestmentsPanel } from './InvestmentsPanel';
import { RisparmiPanel } from './RisparmiPanel';

const SUB_TABS: { id: FixTabId; label: string }[] = [
  { id: 'spese', label: 'Spese fisse' },
  { id: 'risp', label: 'Risparmi' },
  { id: 'inv', label: 'Investimenti' },
];

interface FixedScreenProps {
  fsTab: FixTabId;
  onFsTabChange: (t: FixTabId) => void;
}

export function FixedScreen({ fsTab, onFsTabChange }: FixedScreenProps) {
  const { data, setData } = useAppState();
  const [edit, setEdit] = useState<FixedEditDraft | null>(null);

  const v = useMemo(() => computeFixedScreen(data, new Date()), [data]);

  const openRow = (row: FixedRow) => {
    if (row.kind === 'pac') {
      onFsTabChange('inv');
      return;
    }
    setEdit({ kind: row.kind, id: row.id, name: row.name, amt: String(row.amt).replace('.', ','), day: String(row.day) });
  };

  const newEdit = (kind: 'inc' | 'fix') => setEdit({ kind, id: null, name: '', amt: '', day: '' });

  const saveEdit = (item: { name: string; amt: number; day: number }) => {
    if (!edit) return;
    setData((prev) => {
      if (edit.kind === 'inc') {
        const next = edit.id
          ? prev.incomes.map((x) => (x.id === edit.id ? { ...x, ...item } : x))
          : [...prev.incomes, { id: uid(), ...item }];
        return { ...prev, incomes: next };
      }
      const next = edit.id
        ? prev.fixed.map((x) => (x.id === edit.id ? { ...x, ...item } : x))
        : [...prev.fixed, { id: uid(), ...item }];
      return { ...prev, fixed: next };
    });
    setEdit(null);
  };

  const deleteEdit = () => {
    if (!edit?.id) return;
    setData((prev) =>
      edit.kind === 'inc'
        ? { ...prev, incomes: prev.incomes.filter((x) => x.id !== edit.id) }
        : { ...prev, fixed: prev.fixed.filter((x) => x.id !== edit.id) },
    );
    setEdit(null);
  };

  return (
    <div className="fixed-screen">
      <div className="fixed-header">
        <h3>Fisse</h3>
        <div className="fixed-subtabs">
          {SUB_TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="fixed-subtab-btn"
              style={{
                borderLeft: i ? '1px solid var(--color-divider)' : '0',
                background: fsTab === t.id ? 'var(--color-accent)' : 'transparent',
                color: fsTab === t.id ? 'var(--color-bg)' : 'var(--color-text)',
              }}
              onClick={() => onFsTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {fsTab === 'spese' && (
        <div className="fixed-body">
          <p className="fixed-intro">
            Si ripetono ogni mese. Le spese fisse vengono tolte subito dallo spendibile, anche se non sono ancora state
            pagate.
          </p>

          <div className="fixed-section">
            <div className="fixed-section-header">
              <h5>Entrate fisse</h5>
              <span className="fixed-section-total" style={{ color: 'var(--color-accent-700)' }}>
                + {v.incFixedTotF}
              </span>
            </div>
            {v.incRows.map((r) => (
              <button key={r.id} type="button" className="fixed-row" onClick={() => openRow(r)}>
                <div className="fixed-row-day">
                  <div className="fixed-row-day-num">{r.day}</div>
                  <div className="fixed-row-day-label">GIORNO</div>
                </div>
                <span className="fixed-row-name" style={{ flex: 1 }}>{r.name}</span>
                <span className="fixed-row-amt">+ {r.amtF}</span>
                <ChevronRight size={16} strokeWidth={1.5} className="fixed-row-chevron" />
              </button>
            ))}
            <button type="button" className="btn btn-ghost fixed-add" onClick={() => newEdit('inc')}>
              + Aggiungi entrata fissa
            </button>
          </div>

          <div className="fixed-section">
            <div className="fixed-section-header">
              <h5>Spese fisse</h5>
              <span className="fixed-section-total">− {v.fixedTotF}</span>
            </div>
            {v.fixRows.map((r) => (
              <button key={r.id} type="button" className="fixed-row" onClick={() => openRow(r)}>
                <div className="fixed-row-day">
                  <div className="fixed-row-day-num">{r.day}</div>
                  <div className="fixed-row-day-label">GIORNO</div>
                </div>
                <div className="fixed-row-text">
                  <span className="fixed-row-name">{r.name}</span>
                  <span className="fixed-row-status">{r.status}</span>
                </div>
                <span className="fixed-row-amt">− {r.amtF}</span>
                <ChevronRight size={16} strokeWidth={1.5} className="fixed-row-chevron" />
              </button>
            ))}
            <button type="button" className="btn btn-ghost fixed-add" onClick={() => newEdit('fix')}>
              + Aggiungi spesa fissa
            </button>
          </div>
        </div>
      )}

      {fsTab === 'risp' && <RisparmiPanel />}

      {fsTab === 'inv' && <InvestmentsPanel />}

      {edit && <FixedEditSheet draft={edit} onSave={saveEdit} onDelete={deleteEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}
