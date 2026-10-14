import { useMemo, useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { PiggyEditSheet, type PiggyEditDraft, type PiggySaveItem } from '../components/PiggyEditSheet';
import { MESI } from '../lib/format';
import { uid } from '../lib/id';
import { computePiggyDetail, computeRisparmi } from '../lib/piggies';
import { useAppState } from '../state/AppStateContext';
import './FixedScreen.css';
import { PiggyDetailScreen } from './PiggyDetailScreen';
import './RisparmiPanel.css';

export function RisparmiPanel() {
  const { data, setData } = useAppState();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [edit, setEdit] = useState<PiggyEditDraft | null>(null);

  const today = new Date();
  const v = useMemo(() => computeRisparmi(data, today), [data]);
  const detail = useMemo(() => (detailId ? computePiggyDetail(data, today, detailId) : null), [data, detailId]);

  const newPiggy = () => setEdit({ id: null, name: '', goal: '', date: '', quota: '', saved: 0 });

  const editPiggy = () => {
    if (!detail) return;
    setEdit({
      id: detail.piggy.id,
      name: detail.piggy.name,
      goal: String(detail.piggy.goal),
      date: `${String(detail.piggy.tm).padStart(2, '0')}/${detail.piggy.ty}`,
      quota: String(detail.piggy.quota),
      saved: detail.saved,
    });
  };

  const saveEdit = (item: PiggySaveItem) => {
    if (!edit) return;
    setData((prev) => {
      if (edit.id) {
        return {
          ...prev,
          piggies: prev.piggies.map((p) =>
            p.id === edit.id
              ? { ...p, name: item.name, goal: item.goal, tm: item.tm, ty: item.ty, quota: item.quota, base: p.base + item.quota - p.quota }
              : p,
          ),
        };
      }
      return {
        ...prev,
        piggies: [...prev.piggies, { id: uid(), name: item.name, goal: item.goal, tm: item.tm, ty: item.ty, quota: item.quota, base: item.quota, hist: [] }],
      };
    });
    setEdit(null);
  };

  const deleteEdit = () => {
    if (!edit?.id) return;
    setData((prev) => ({ ...prev, piggies: prev.piggies.filter((p) => p.id !== edit.id) }));
    setEdit(null);
    setDetailId(null);
  };

  const contribute = (amt: number, mode: 'in' | 'out') => {
    if (!detailId) return;
    const now = new Date();
    const entry = {
      id: uid(),
      date: `${now.getDate()} ${MESI[now.getMonth()]}`,
      label: mode === 'out' ? 'Prelievo' : 'Versamento',
      amt: mode === 'out' ? -amt : amt,
      cur: true,
    };
    setData((prev) => ({
      ...prev,
      piggies: prev.piggies.map((p) => (p.id === detailId ? { ...p, hist: [...(p.hist ?? []), entry] } : p)),
    }));
  };

  return (
    <div className="fixed-body">
      <div className="risp-grid">
        <div className="risp-cell">
          <div className="card-kicker risp-kicker">Nei salvadanai</div>
          <div className="risp-value">{v.pgTotalF}</div>
        </div>
        <div className="risp-cell">
          <div className="card-kicker risp-kicker">Tolti questo mese</div>
          <div className="risp-value">{v.saveMonthF}</div>
        </div>
      </div>

      <p className="fixed-intro">
        Non sono spendibili. La quota mensile di ogni salvadanaio viene tolta in automatico dallo spendibile; versamenti e
        prelievi lo modificano subito.
      </p>

      {v.rows.map((p) => (
        <Blueprint as="button" key={p.id} type="button" className="risp-card" onClick={() => setDetailId(p.id)}>
          <div className="risp-card-top">
            <span className="risp-card-name">{p.name}</span>
            <span className="risp-card-pct">{p.pctF}</span>
          </div>
          <div className="risp-card-amount">
            <span className="risp-card-saved">€ {p.savedF}</span>
            <span className="risp-card-goal">di € {p.goalF}</span>
          </div>
          <div className="risp-card-bar">
            <div className="risp-card-bar-fill" style={{ width: p.w }} />
          </div>
          <span className="risp-card-quota">€ {p.quotaF}/mese · entro {p.dateF}</span>
          <span className="risp-card-hint" style={{ color: p.hintColor }}>
            {p.hint}
          </span>
        </Blueprint>
      ))}

      <Blueprint as="button" type="button" className="btn btn-secondary risp-new-btn" onClick={newPiggy}>
        + Nuovo salvadanaio
      </Blueprint>

      {detail && (
        <PiggyDetailScreen piggy={detail} onBack={() => setDetailId(null)} onEdit={editPiggy} onContribute={contribute} />
      )}

      {edit && <PiggyEditSheet draft={edit} onSave={saveEdit} onDelete={deleteEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}
