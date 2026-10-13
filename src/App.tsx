import { useState } from 'react';
import { AddMovementSheet, type MovementType, type SavedMovement } from './components/AddMovementSheet';
import { TabBar } from './components/TabBar';
import { uid } from './lib/id';
import type { FixTabId, TabId } from './lib/nav';
import { FixedScreen } from './screens/FixedScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MovementsScreen } from './screens/MovementsScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { AppStateProvider, useAppState } from './state/AppStateContext';
import './App.css';

function Shell() {
  const [tab, setTab] = useState<TabId>('home');
  const [fsTab, setFsTab] = useState<FixTabId>('spese');
  const [sheet, setSheet] = useState<MovementType | null>(null);
  const { setData } = useAppState();

  const goTab = (t: TabId, fs?: FixTabId) => {
    setTab(t);
    if (fs) setFsTab(fs);
  };

  const saveMovement = ({ type, amt, cat, rec }: SavedMovement) => {
    if (type === 'out' && cat === 'Investimento') {
      // La ricerca titoli non è ancora implementata: per ora lo sheet si chiude soltanto.
      setSheet(null);
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

  return (
    <div className="app-shell">
      <div className="app-content">
        {tab === 'home' && <HomeScreen onNavigate={goTab} onOpenSheet={setSheet} />}
        {tab === 'mov' && <MovementsScreen onAdd={() => setSheet('out')} />}
        {tab === 'fix' && <FixedScreen fsTab={fsTab} onFsTabChange={setFsTab} />}
        {tab === 'set' && <PlaceholderScreen title="Impostazioni" />}
      </div>
      <TabBar active={tab} onChange={(t) => goTab(t)} />
      {sheet && (
        <AddMovementSheet initialType={sheet} onSave={saveMovement} onClose={() => setSheet(null)} />
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
