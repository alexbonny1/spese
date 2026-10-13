import { useState } from 'react';
import { TabBar } from './components/TabBar';
import type { FixTabId, TabId } from './lib/nav';
import { HomeScreen } from './screens/HomeScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { AppStateProvider } from './state/AppStateContext';
import './App.css';

function Shell() {
  const [tab, setTab] = useState<TabId>('home');
  const [, setFsTab] = useState<FixTabId>('spese');

  const goTab = (t: TabId, fs?: FixTabId) => {
    setTab(t);
    if (fs) setFsTab(fs);
  };

  return (
    <div className="app-shell">
      <div className="app-content">
        {tab === 'home' && <HomeScreen onNavigate={goTab} />}
        {tab === 'mov' && <PlaceholderScreen title="Movimenti" />}
        {tab === 'fix' && <PlaceholderScreen title="Fisse" />}
        {tab === 'set' && <PlaceholderScreen title="Impostazioni" />}
      </div>
      <TabBar active={tab} onChange={(t) => goTab(t)} />
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
