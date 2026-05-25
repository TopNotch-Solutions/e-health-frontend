import { ps } from '../styles/pharmacySupervisorClasses';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory', label: 'Inventory' },
];

export default function PharmacySupervisorViewTabs({ activeTab, onTabChange }) {
  return (
    <div className={ps.tabGroup} role="tablist" aria-label="Pharmacy supervisor views">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${ps.tabBtn} ${active ? ps.tabBtnActive : ps.tabBtnIdle}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
