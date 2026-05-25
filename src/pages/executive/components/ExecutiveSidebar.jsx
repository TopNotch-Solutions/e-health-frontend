import { ex, EXECUTIVE_SECTIONS } from '../styles/executiveClasses';

export default function ExecutiveSidebar({ activeSection, onSectionChange }) {
  return (
    <aside className={ex.sidebar} aria-label="Executive analytics modules">
      <h2 className={ex.sidebarTitle}>Analytics</h2>
      <p className={ex.sidebarSub}>All modules · view only</p>
      <nav className={ex.navList}>
        {EXECUTIVE_SECTIONS.map((group) => (
          <div key={group.group}>
            <p className={ex.sidebarGroup}>{group.group}</p>
            {group.items.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${ex.navItem} ${active ? ex.navItemActive : ''}`}
                  onClick={() => onSectionChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
