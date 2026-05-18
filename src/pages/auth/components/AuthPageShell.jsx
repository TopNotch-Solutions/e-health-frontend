import { auth } from '../styles/authClasses';

/**
 * Auth layout: full-height content area (no top bar or footer).
 */
export default function AuthPageShell({ children }) {
  return (
    <div className={auth.shell}>
      <main className={auth.main}>{children}</main>
    </div>
  );
}
