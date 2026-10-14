import { useMemo } from 'react';
import { Blueprint } from '../components/Blueprint';
import { PromoPopup } from '../components/PromoPopup';
import { computeHome } from '../lib/home';
import { useMarketTick } from '../lib/marketData';
import type { FixTabId, TabId } from '../lib/nav';
import { useAppState } from '../state/AppStateContext';
import './HomeScreen.css';

const LEGEND = [
  { label: 'Fisse', color: 'var(--color-accent-800)' },
  { label: 'Speso', color: 'var(--color-accent-500)' },
  { label: 'Risparmi', color: 'var(--color-neutral-500)' },
  { label: 'Investito', color: 'var(--color-neutral-300)' },
] as const;

interface HomeScreenProps {
  onNavigate: (tab: TabId, fsTab?: FixTabId) => void;
  onOpenSheet: (type: 'in' | 'out') => void;
}

export function HomeScreen({ onNavigate, onOpenSheet }: HomeScreenProps) {
  const { data } = useAppState();
  const heldSyms = useMemo(() => [...new Set(data.lots.map((l) => l.sym))], [data.lots]);
  const marketTick = useMarketTick(heldSyms, { withYield: true });
  const v = useMemo(() => computeHome(data, new Date()), [data, marketTick]);

  return (
    <div className="home-screen">
      <header className="home-header">
        <span className="home-period">{v.periodLabel}</span>
        <span className="tag tag-outline">{v.daysLeftLabel}</span>
      </header>

      <div className="home-body">
        <div className="home-hero">
          <span className="home-hero-label">Puoi ancora spendere</span>
          <span className="home-amount">€ {v.spendableF}</span>
          {v.showPerDay && <span className="home-perday">circa € {v.perDayF} al giorno</span>}
          <button type="button" className="home-networth" onClick={() => onNavigate('fix', 'inv')}>
            Patrimonio totale € {v.netWorthF} ›
          </button>
          <span className="home-networth home-networth-static">Contanti e conto € {v.cashBankF}</span>
        </div>

        {v.alertOn && (
          <Blueprint className="home-alert">
            {v.alertText}
          </Blueprint>
        )}

        <div className="home-monthbar-wrap">
          <Blueprint className="home-monthbar">
            <div style={{ width: `${v.wFixed}%`, background: 'var(--color-accent-800)' }} />
            <div style={{ width: `${v.wSpent}%`, background: 'var(--color-accent-500)' }} />
            <div style={{ width: `${v.wSave}%`, background: 'var(--color-neutral-500)' }} />
            <div style={{ width: `${v.wInv}%`, background: 'var(--color-neutral-300)' }} />
            <div className="home-monthbar-avail" />
          </Blueprint>
          <div className="home-legend">
            {LEGEND.map((l) => (
              <span key={l.label} className="home-legend-item">
                <i style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
            <span className="home-legend-item">
              <i className="home-legend-avail-dot" />
              Disponibile {v.pAvail}%
            </span>
          </div>
        </div>

        <div className="home-grid">
          <button type="button" className="home-grid-cell" onClick={() => onNavigate('mov')}>
            <div className="card-kicker home-grid-kicker">Entrate</div>
            <div className="home-grid-value">{v.incomeF}</div>
          </button>
          <button type="button" className="home-grid-cell" onClick={() => onNavigate('fix', 'spese')}>
            <div className="card-kicker home-grid-kicker">Fisse</div>
            <div className="home-grid-value">{v.fixedF}</div>
          </button>
          <button type="button" className="home-grid-cell" onClick={() => onNavigate('mov')}>
            <div className="card-kicker home-grid-kicker">Speso</div>
            <div className="home-grid-value">{v.spentF}</div>
          </button>
          <button type="button" className="home-grid-cell" onClick={() => onNavigate('fix', 'risp')}>
            <div className="card-kicker home-grid-kicker">Risparmi + investiti</div>
            <div className="home-grid-value">{v.setAsideF}</div>
          </button>
        </div>

        <div className="home-recent">
          <div className="home-recent-header">
            <h5>Ultimi movimenti</h5>
            <button type="button" className="btn btn-ghost" onClick={() => onNavigate('mov')}>
              Tutti
            </button>
          </div>
          {v.recent.map((t) => (
            <div key={t.id} className="home-recent-row">
              <div className="home-recent-main">
                <span className="home-recent-name">{t.name}</span>
                <span className="home-recent-sub">{t.sub}</span>
              </div>
              <span className="home-recent-amt" style={{ color: t.color }}>
                {t.amtF}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-footer">
        <Blueprint as="button" type="button" className="btn btn-secondary home-footer-btn" onClick={() => onOpenSheet('in')}>
          + Entrata
        </Blueprint>
        <Blueprint as="button" type="button" className="btn btn-primary home-footer-btn" onClick={() => onOpenSheet('out')}>
          − Uscita
        </Blueprint>
      </div>

      {v.netWorth === 0 && data.tx.length === 0 && <PromoPopup onAddMovement={() => onOpenSheet('in')} />}
    </div>
  );
}
