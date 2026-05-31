import { Outlet } from 'react-router-dom';
import { RegistrationProvider } from './RegistrationContext';
import FrontOfficeTopbar from './components/FrontOfficeTopbar';
import { ToastProvider } from './context/ToastContext';
import { shell } from './styles/frontOfficeClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function FrontOfficeLayout() {
  return (
    <RegistrationProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <FrontOfficeTopbar />

          <main className={shell.main}>
            <Outlet />
          </main>

          <footer className={shell.footer}>
            Health Management System | A digital solution by{' '}
            <a
              href={KOPANO}
              target="_blank"
              rel="noopener noreferrer"
              className={shell.footerLink}
            >
              Kopano-Vertex
            </a>{' '}
            | (c) 2026 All rights reserved
          </footer>
        </div>
      </ToastProvider>
    </RegistrationProvider>
  );
}
