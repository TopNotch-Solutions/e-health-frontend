import { Link, useNavigate } from 'react-router-dom';
import { performSignOut } from '../utils/performSignOut';
import { topbar } from '../pages/front_office/styles/frontOfficeClasses';

export default function TopbarSignOutButton({
  moduleLabel,
  className,
  children = 'Sign Out',
  showReporting = true,
}) {
  const navigate = useNavigate();

  return (
    <>
      {showReporting ? (
        <Link to="/reporting" className={topbar.reportingLink}>
          Reporting
        </Link>
      ) : null}
      <button
        type="button"
        className={className}
        onClick={() => performSignOut(navigate, moduleLabel)}
      >
        {children}
      </button>
    </>
  );
}
