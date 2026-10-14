import { ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Blueprint } from '../components/Blueprint';
import { FullScreenOverlay } from '../components/FullScreenOverlay';
import { computeAssetDetail } from '../lib/assetDetail';
import { useMarketTick } from '../lib/marketData';
import { useAppState } from '../state/AppStateContext';
import './AssetDetailScreen.css';

interface AssetDetailScreenProps {
  sym: string;
  onBack: () => void;
  onBuy: () => void;
}

function cleanDecimal(v: string): string {
  return v.replace(/[^\d,.]/g, '');
}

export function AssetDetailScreen({ sym, onBack, onBuy }: AssetDetailScreenProps) {
  const { data, setData } = useAppState();
  const marketTick = useMarketTick([sym], { withYield: true });
  const asset = useMemo(() => computeAssetDetail(data, sym), [data, sym, marketTick]);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  if (!asset) return null;

  const saveManualPrice = () => {
    const n = parseFloat(priceInput.replace(',', '.'));
    if (!(n > 0)) return;
    setData((prev) => ({ ...prev, manualPrices: { ...prev.manualPrices, [sym]: n } }));
    setEditingPrice(false);
  };

  const manualPriceForm = (
    <div className="asset-manual-form">
      <div className="field">
        <label>Prezzo attuale (€)</label>
        <input
          className="input"
          inputMode="decimal"
          autoFocus
          value={priceInput}
          onChange={(e) => setPriceInput(cleanDecimal(e.target.value))}
          placeholder="0,00"
        />
      </div>
      <Blueprint as="button" type="button" className="btn btn-primary asset-manual-save" onClick={saveManualPrice}>
        Salva prezzo
      </Blueprint>
    </div>
  );

  if (!asset.ready) {
    return (
      <FullScreenOverlay zIndex={11}>
        <div className="asset-top">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            <ChevronLeft size={18} strokeWidth={1.5} />
            Indietro
          </button>
        </div>
        {asset.isManual ? (
          <div className="asset-manual-setup">
            <span className="asset-meta">
              {asset.sym} · {asset.type} · {asset.ex}
            </span>
            <h3>{asset.name}</h3>
            <p className="asset-manual-hint">
              Nessun dato di mercato gratuito disponibile per questo titolo: imposta tu il prezzo attuale, potrai
              aggiornarlo in qualsiasi momento.
            </p>
            {manualPriceForm}
          </div>
        ) : (
          <div className="asset-loading">
            {asset.errored
              ? 'Impossibile recuperare i dati di mercato in questo momento. Riprova più tardi.'
              : 'Caricamento dati di mercato…'}
          </div>
        )}
      </FullScreenOverlay>
    );
  }

  return (
    <FullScreenOverlay zIndex={11}>
      <div className="asset-top">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ChevronLeft size={18} strokeWidth={1.5} />
          Indietro
        </button>
      </div>

      <div className="asset-body">
        <div className="asset-head">
          <span className="asset-meta">
            {asset.sym} · {asset.type} · {asset.ex}
          </span>
          <h3>{asset.name}</h3>
          <div className="asset-price-row">
            <span className="asset-price">{asset.priceF}</span>
            {!asset.isManual && (
              <span className="asset-r1y" style={{ color: asset.color }}>
                {asset.r1yF} in 1 anno
              </span>
            )}
          </div>
          {asset.isUsd && <span className="asset-eur-approx">≈ € {asset.priceEurF} al cambio 1,08</span>}
          {asset.isManual &&
            (editingPrice ? (
              manualPriceForm
            ) : (
              <button
                type="button"
                className="btn btn-ghost asset-manual-edit"
                onClick={() => {
                  setPriceInput(String(asset.priceF.replace(/[^\d,]/g, '')));
                  setEditingPrice(true);
                }}
              >
                Modifica prezzo
              </button>
            ))}
        </div>

        {!asset.isManual && (
          <Blueprint className="asset-chart">
            <svg viewBox="0 0 320 120" preserveAspectRatio="none" className="asset-chart-svg">
              <line x1="0" y1="8" x2="320" y2="8" stroke="var(--color-divider)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="60" x2="320" y2="60" stroke="var(--color-divider)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="112" x2="320" y2="112" stroke="var(--color-divider)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <polygon points={asset.chartArea} fill="var(--color-accent-100)" />
              <polyline
                points={asset.chartPts}
                fill="none"
                stroke="var(--color-accent-700)"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="asset-chart-foot">
              <span>{asset.chartStartF}</span>
              <span>
                min {asset.minF} · max {asset.maxF}
              </span>
              <span>oggi</span>
            </div>
          </Blueprint>
        )}

        <div className="asset-grid">
          <div className="asset-cell">
            <div className="card-kicker asset-kicker">Rendimento 1 anno</div>
            <div className="asset-cell-value">{asset.r1yF}</div>
          </div>
          <div className="asset-cell">
            <div className="card-kicker asset-kicker">Da inizio anno</div>
            <div className="asset-cell-value">{asset.ytdF}</div>
          </div>
          <div className="asset-cell">
            <div className="card-kicker asset-kicker">{asset.yldLabel}</div>
            <div className="asset-cell-value">{asset.yldF}</div>
          </div>
          <div className="asset-cell">
            <div className="card-kicker asset-kicker">Tasse sul guadagno</div>
            <div className="asset-cell-value">{asset.trF}</div>
          </div>
        </div>

        {asset.position && (
          <>
            <Blueprint className="asset-position">
              <span className="card-kicker asset-position-kicker">La tua posizione</span>
              <div className="asset-position-value-row">
                <span className="asset-position-value">€ {asset.position.valueF}</span>
                <span className="asset-position-gainpct" style={{ color: asset.position.color }}>
                  {asset.position.gainPctF}
                </span>
              </div>
              <div className="asset-position-row">
                <span>Quote</span>
                <span>{asset.position.qtyF}</span>
              </div>
              <div className="asset-position-row">
                <span>Prezzo medio di carico</span>
                <span>{asset.position.avgF}</span>
              </div>
              <div className="asset-position-row">
                <span>Investito (commissioni € {asset.position.feeF})</span>
                <span>€ {asset.position.costF}</span>
              </div>
              <div className="asset-position-row">
                <span>Guadagno/perdita</span>
                <span style={{ color: asset.position.color, fontWeight: 500 }}>{asset.position.gainF}</span>
              </div>
              <div className="asset-position-row">
                <span>Tasse se vendi ({asset.trF})</span>
                <span>− € {asset.position.taxF}</span>
              </div>
              <div className="asset-position-row">
                <span>{asset.position.divLabel}</span>
                <span>
                  € {asset.position.divF} → netti € {asset.position.divNetF}
                </span>
              </div>
              <div className="asset-position-net">
                <span>Netto se vendi oggi</span>
                <span>€ {asset.position.netF}</span>
              </div>
            </Blueprint>

            <div className="asset-lots">
              <h5>Acquisti</h5>
              {asset.position.lots.map((l) => (
                <div key={l.id} className="asset-lot-row">
                  <div className="asset-lot-text">
                    <span className="asset-lot-main">
                      {l.qtyF} quote a {l.priceF}
                    </span>
                    <span className="asset-lot-sub">
                      {l.date} · commissioni € {l.feeF}
                    </span>
                  </div>
                  <span className="asset-lot-tot">€ {l.totF}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {asset.pacNote && <span className="asset-pac-note">{asset.pacNote}</span>}
      </div>

      <div className="asset-footer">
        <Blueprint as="button" type="button" className="btn btn-primary asset-buy-btn" onClick={onBuy}>
          Compra {asset.sym}
        </Blueprint>
      </div>
    </FullScreenOverlay>
  );
}
