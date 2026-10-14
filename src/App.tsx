import { useState } from 'react';
import { AddMovementSheet, type MovementType, type SavedMovement } from './components/AddMovementSheet';
import { BuySheet, type BuyResult } from './components/BuySheet';
import { TabBar } from './components/TabBar';
import { CATALOG_BY_SYM } from './data/catalog';
import { fq, MESI } from './lib/format';
import { uid } from './lib/id';
import type { FixTabId, TabId } from './lib/nav';
import { AssetDetailScreen } from './screens/AssetDetailScreen';
import { FixedScreen } from './screens/FixedScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MovementsScreen } from './screens/MovementsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { SearchScreen } from './screens/SearchScreen';
import { AppStateProvider, useAppState } from './state/AppStateContext';
import './App.css';

function Shell() {
  const [tab, setTab] = useState<TabId>('home');
  const [fsTab, setFsTab] = useState<FixTabId>('spese');
  const [sheet, setSheet] = useState<MovementType | null>(null);
  const [search, setSearch] = useState<{ prefill: number | null } | null>(null);
  const [assetSym, setAssetSym] = useState<string | null>(null);
  const [buySym, setBuySym] = useState<string | null>(null);
  const { data, setData, completeOnboarding } = useAppState();

  const goTab = (t: TabId, fs?: FixTabId) => {
    setTab(t);
    if (fs) setFsTab(fs);
  };

  const saveMovement = ({ type, amt, cat, rec }: SavedMovement) => {
    if (type === 'out' && cat === 'Investimento') {
      setSheet(null);
      setSearch({ prefill: amt });
      return;
    }
    const today = new Date().getDate();
    const id = uid();
    setData((prev) => {
      if (rec) {
        return type === 'in'
          ? { ...prev, incomes: [...prev.incomes, { id, name: cat, amt, day: today }] }
          : { ...prev, fixed: [...prev.fixed, { id, name: cat, amt, day: today }] };
      }
      return { ...prev, tx: [...prev.tx, { id, name: cat, cat, amt: type === 'in' ? amt : -amt, day: today }] };
    });
    setSheet(null);
  };

  const confirmBuy = (sym: string, result: BuyResult) => {
    const now = new Date();
    const today = now.getDate();
    const lotId = uid();
    setData((prev) => {
      const lot = { id: lotId, sym, qty: result.qty, price: result.price, fee: result.fee, date: `${today} ${MESI[now.getMonth()]} ${now.getFullYear()}` };
      const next = { ...prev, lots: [...prev.lots, lot] };
      if (result.pac && result.pacDay != null) {
        return {
          ...next,
          pacs: [...prev.pacs.filter((p) => p.sym !== sym), { id: uid(), sym, amt: Math.round(result.total * 100) / 100, day: result.pacDay }],
        };
      }
      return {
        ...next,
        tx: [...prev.tx, { id: uid(), name: `${sym} · ${fq(result.qty)} quote`, cat: 'Investimento', amt: -Math.round(result.total * 100) / 100, day: today, lotId }],
      };
    });
    setBuySym(null);
    setSearch(null);
    setTab('fix');
    setFsTab('inv');
  };

  if (!data.onboarded) {
    return (
      <div className="app-shell">
        <div className="app-content">
          <OnboardingScreen onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        {tab === 'home' && <HomeScreen onNavigate={goTab} onOpenSheet={setSheet} />}
        {tab === 'mov' && <MovementsScreen onAdd={() => setSheet('out')} />}
        {tab === 'fix' && (
          <FixedScreen
            fsTab={fsTab}
            onFsTabChange={setFsTab}
            onSearch={() => setSearch({ prefill: null })}
            onOpenAsset={setAssetSym}
          />
        )}
        {tab === 'set' && <PlaceholderScreen title="Impostazioni" />}
      </div>
      <TabBar active={tab} onChange={(t) => goTab(t)} />
      {sheet && (
        <AddMovementSheet initialType={sheet} onSave={saveMovement} onClose={() => setSheet(null)} />
      )}
      {search && (
        <SearchScreen
          prefill={search.prefill}
          onBack={() => setSearch(null)}
          onOpenAsset={(sym) => setAssetSym(sym)}
        />
      )}
      {assetSym && (
        <AssetDetailScreen sym={assetSym} onBack={() => setAssetSym(null)} onBuy={() => setBuySym(assetSym)} />
      )}
      {buySym && CATALOG_BY_SYM[buySym] && (
        <BuySheet
          security={CATALOG_BY_SYM[buySym]}
          prefillAmount={search?.prefill ?? null}
          today={new Date().getDate()}
          onConfirm={(result) => confirmBuy(buySym, result)}
          onClose={() => setBuySym(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}

export default App;
