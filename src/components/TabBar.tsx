import { House, List, Repeat, SlidersVertical } from 'lucide-react';
import type { TabId } from '../lib/nav';
import './TabBar.css';

const TABS: { id: TabId; label: string; Icon: typeof House }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'mov', label: 'Movimenti', Icon: List },
  { id: 'fix', label: 'Fisse', Icon: Repeat },
  { id: 'set', label: 'Impostazioni', Icon: SlidersVertical },
];

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="tab-bar-btn"
          style={{ color: active === id ? 'var(--color-accent-700)' : 'var(--color-neutral-600)' }}
          onClick={() => onChange(id)}
        >
          <Icon size={22} strokeWidth={1.5} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
