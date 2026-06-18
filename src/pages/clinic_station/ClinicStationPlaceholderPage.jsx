import { useNavigate } from 'react-router-dom';
import { clearSession, getStoredUser } from '../../api/authSession';
import { disconnectSocket } from '../../api/socket';
import { authRoleSlug, roleDisplayName } from '../../utils/homePathForRole';
import { nurse as c, topbar } from '../nurse/styles/nurseClasses';
import AppBrand from '../../components/brand/AppBrand';

const KOPANO = 'https://kopanovertex.com/';

function initialsFromLabel(label) {
  return label.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('')
    || 'EH';
}

/**
 * Signed-in shell for clinic station roles whose full queue UI is not built yet.
 * Keeps login routing working and gives staff a consistent landing page.
 */
export default function ClinicStationPlaceholderPage({ subtitle }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const roleSlug = authRoleSlug(user);
  const moduleTitle = roleDisplayName(roleSlug);
  const operatorLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || moduleTitle;
  const initials = initialsFromLabel(operatorLabel);

  function handleSignOut() {
    disconnectSocket();
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <div className={c.page}>
      <header className={`${topbar.root} shrink-0`}>
        <div className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <AppBrand className={topbar.brand} />
          <span className="text-sm font-medium text-slate-500">
            {moduleTitle}
            {subtitle ? ` · ${subtitle}` : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white"
              aria-hidden
            >
              {initials}
            </span>
            <span className="max-w-[160px] truncate text-sm font-semibold text-slate-700 sm:max-w-none">
              {operatorLabel}
            </span>
          </div>
          <button type="button" className={topbar.signOut} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className={c.body}>
        <div className={`${c.main} flex flex-1 items-center justify-center p-6`}>
          <div className={`${c.idle} max-w-lg`} role="region" aria-label={`${moduleTitle} workspace`}>
            <h3 className={c.idleTitle}>{moduleTitle} module</h3>
            <p className={c.idleText}>
              You are signed in as <strong>{moduleTitle}</strong> ({roleSlug}). The full queue
              workstation for this clinic station is not available in this app version yet.
              Patients may still be routed here from Front Office — use another channel or contact
              your supervisor until this module is released.
            </p>
          </div>
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | {moduleTitle} module
      </footer>
    </div>
  );
}
