import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../../api/authSession';
import { topbar } from '../styles/frontOfficeClasses';

/**
 * Full-width top navigation: branding left, sign out right.
 */
export default function FrontOfficeTopbar() {
  const navigate = useNavigate();

  function handleSignOut() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className={topbar.root}>
      <span className={topbar.brand}>E-Health Management system</span>
      <button type="button" className={topbar.signOut} onClick={handleSignOut}>
        Sign Out
      </button>
    </header>
  );
}
