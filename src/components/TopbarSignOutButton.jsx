import { useNavigate } from 'react-router-dom';
import { performSignOut } from '../utils/performSignOut';

export default function TopbarSignOutButton({ moduleLabel, className, children = 'Sign Out' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={className}
      onClick={() => performSignOut(navigate, moduleLabel)}
    >
      {children}
    </button>
  );
}
