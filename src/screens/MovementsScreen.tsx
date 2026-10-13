import { useMemo, useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { computeMovements, type MovementFilter } from '../lib/movements';
import { useAppState } from '../state/AppStateContext';
import './MovementsScreen.css';

const FILTERS: { id: MovementFilter; label: string }[] = [
  { id: 'all', label: 'Tutti' },
  { id: 'in', label: 'Entrate' },
  { id: 'out', label: 'Uscite' },
];

interface MovementsScreenProps {
  onAdd: () => void;
}

export function MovementsScreen({ onAdd }: MovementsScreenProps) {
  const { data, setData } = useAppState();
  const [filter, setFilter] = useState<MovementFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const v = useMemo(() => computeMovements(data, new Date(), filter), [data, filter]);

  const pickFilter = (f: MovementFilter) => {
    setFilter(f);
    setOpenId(null);
  };

  const remove = (id: string) => {
    setData((prev) => {
      const t = prev.tx.find((x) => x.id === id);
      return {
        ...prev,
        tx: prev.tx.filter((x) => x.id !== id),
        lots: t?.lotId ? prev.lots.filter((l) => l.id !== t.lotId) : prev.lots,
      };
    });
    setOpenId(null);
  };

  return (
    <div className="mov-screen">
      <div className="mov-header">
        <h3>Movimenti</h3>
        <div className="mov-filters">
          {FILTERS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className="mov-filter-btn"
              style={{
                borderLeft: i ? '1px solid var(--color-divider)' : '0',
                background: filter === f.id ? 'var(--color-accent)' : 'transparent',
                color: filter === f.id ? 'var(--color-bg)' : 'var(--color-text)',
              }}
              onClick={() => pickFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mov-totals">
          <span>
            Entrate <b style={{ color: 'var(--color-accent-700)' }}>+ {v.movInF}</b>
          </span>
          <span>
            Uscite <b>− {v.movOutF}</b>
          </span>
        </div>
      </div>

      <div className="mov-list">
        {v.groups.map((g) => (
          <div key={g.label} className="mov-group">
            <div className="mov-group-header">
              <span>{g.label}</span>
              <span>{g.totF}</span>
            </div>
            {g.items.map((t) => {
              const open = openId === t.id;
              return (
                <div key={t.id} className="mov-row">
                  <button type="button" className="mov-row-main" onClick={() => setOpenId(open ? null : t.id)}>
                    <div className="mov-row-text">
                      <span className="mov-row-name">{t.name}</span>
                      <span className="mov-row-cat">{t.cat}</span>
                    </div>
                    <span className="mov-row-amt" style={{ color: t.color }}>
                      {t.amtF}
                    </span>
                  </button>
                  {open && (
                    <div className="mov-row-actions">
                      {t.isInv && (
                        <span className="mov-row-note">Eliminandolo togli anche l'acquisto dal portafoglio.</span>
                      )}
                      <div className="mov-row-actions-buttons">
                        <button type="button" className="btn btn-secondary" onClick={() => setOpenId(null)}>
                          Chiudi
                        </button>
                        <button type="button" className="btn btn-secondary mov-row-delete" onClick={() => remove(t.id)}>
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {v.empty && <p className="mov-empty">Nessun movimento.</p>}
      </div>

      <div className="mov-footer">
        <Blueprint as="button" type="button" className="btn btn-primary mov-add-btn" onClick={onAdd}>
          + Aggiungi movimento
        </Blueprint>
      </div>
    </div>
  );
}
