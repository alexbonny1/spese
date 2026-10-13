import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { Blueprint } from '../components/Blueprint';
import { computeInvestments } from '../lib/investments';
import { useAppState } from '../state/AppStateContext';
import './FixedScreen.css';
import './InvestmentsPanel.css';

export function InvestmentsPanel() {
  const { data, setData } = useAppState();
  const v = useMemo(() => computeInvestments(data), [data]);

  const removePac = (id: string) => {
    setData((prev) => ({ ...prev, pacs: prev.pacs.filter((p) => p.id !== id) }));
  };

  return (
    <>
      <div className="fixed-body">
        <Blueprint className="inv-summary">
          <span className="card-kicker inv-summary-kicker">Valore attuale</span>
          <div className="inv-summary-value-row">
            <span className="inv-summary-value">€ {v.pfValueF}</span>
            <span className="inv-summary-gainpct" style={{ color: v.pfGainColor }}>
              {v.pfGainPctF}
            </span>
          </div>
          <div className="inv-summary-row">
            <span>Investito (con commissioni)</span>
            <span>€ {v.pfCostF}</span>
          </div>
          <div className="inv-summary-row">
            <span>Guadagno/perdita</span>
            <span style={{ color: v.pfGainColor, fontWeight: 500 }}>{v.pfGainF}</span>
          </div>
          <div className="inv-summary-row">
            <span>Tasse se vendi oggi</span>
            <span>− € {v.pfTaxF}</span>
          </div>
          <div className="inv-summary-row">
            <span>Dividendi annui stimati (netti)</span>
            <span>€ {v.pfDivF}</span>
          </div>
          <div className="inv-summary-net">
            <span>Netto se vendi oggi</span>
            <span>€ {v.pfNetF}</span>
          </div>
        </Blueprint>

        <div className="inv-section">
          <h5>Titoli</h5>
          {v.holdRows.map((h) => (
            <div key={h.sym} className="inv-hold-row">
              <div className="inv-hold-ticker">{h.sym}</div>
              <div className="inv-hold-text">
                <span className="inv-hold-name">{h.name}</span>
                <span className="inv-hold-sub">{h.sub}</span>
              </div>
              <div className="inv-hold-amounts">
                <span className="inv-hold-value">€ {h.valueF}</span>
                <span className="inv-hold-gain" style={{ color: h.color }}>
                  {h.gainPctF}
                </span>
              </div>
            </div>
          ))}
        </div>

        {v.hasPacs && (
          <div className="inv-section">
            <h5>Piani di accumulo (PAC)</h5>
            {v.pacRows.map((p) => (
              <div key={p.id} className="inv-pac-row">
                <div className="inv-pac-text">
                  <span className="inv-pac-label">{p.label}</span>
                  <span className="inv-pac-sub">{p.sub}</span>
                </div>
                <span className="inv-pac-amt">€ {p.amtF}</span>
                <button type="button" className="btn btn-ghost inv-pac-stop" onClick={() => removePac(p.id)}>
                  Ferma
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="inv-footer">
        <Blueprint as="button" type="button" className="btn btn-primary inv-search-btn" disabled>
          <Search size={18} strokeWidth={1.5} />
          Cerca e compra
        </Blueprint>
      </div>
    </>
  );
}
