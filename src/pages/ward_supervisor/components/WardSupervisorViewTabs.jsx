import { ws } from '../styles/wardSupervisorClasses';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'wards', label: 'Wards' },
];

export default function WardSupervisorViewTabs({ activeTab, onTabChange }) {
  return (
    <div
      className={ws.tabGroup}
      role="tablist"
      aria-label="Ward supervisor views"
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`ws-panel-${tab.id}`}
            id={`ws-tab-${tab.id}`}
            className={`${ws.tabBtn} ${active ? ws.tabBtnActive : ws.tabBtnIdle}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
