import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession } from '../../../api/authSession';
import { topbar } from '../styles/frontOfficeClasses';

const navLink =
  'rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800';
const navActive = 'bg-teal-50 text-teal-800 ring-1 ring-teal-200';

/**
 * Full-width top navigation: branding, module tabs, sign out.
 */
export default function FrontOfficeTopbar() {
  const navigate = useNavigate();

  function handleSignOut() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={topbar.root}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
        <span className={topbar.brand}>E-Health Management system</span>
        <nav className="flex flex-wrap gap-1" aria-label="Front office">
          <NavLink
            to="/front_office"
            end
            className={({ isActive }) => `${navLink} ${isActive ? navActive : ''}`}
          >
            Patient lookup
          </NavLink>
          <NavLink
            to="/front_office/today"
            className={({ isActive }) => `${navLink} ${isActive ? navActive : ''}`}
          >
            Today&apos;s registrations
          </NavLink>
        </nav>
      </div>
      <button type="button" className={topbar.signOut} onClick={handleSignOut}>
        Sign Out
      </button>
    </header>
  );
}
