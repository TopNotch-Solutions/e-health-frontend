import { NavLink } from 'react-router-dom';
import TopbarSignOutButton from '../../../components/TopbarSignOutButton';
import { topbar } from '../../front_office/styles/frontOfficeClasses';
import AppBrand from '../../../components/brand/AppBrand';

const navLink =
  'rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800';
const navActive = 'bg-teal-50 text-teal-800 ring-1 ring-teal-200';

export default function MaternityFrontOfficeTopbar() {
  return (
    <header className={topbar.root}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
        <AppBrand className={topbar.brand} />
        <nav className="flex flex-wrap gap-1" aria-label="Maternity front office">
          <NavLink
            to="/maternity_front_officer"
            end
            className={({ isActive }) => `${navLink} ${isActive ? navActive : ''}`}
          >
            Patient lookup
          </NavLink>
          <NavLink
            to="/maternity_front_officer/today"
            className={({ isActive }) => `${navLink} ${isActive ? navActive : ''}`}
          >
            Today&apos;s registrations
          </NavLink>
        </nav>
      </div>
      <TopbarSignOutButton moduleLabel="Maternity Front Office" className={topbar.signOut} />
    </header>
  );
}
