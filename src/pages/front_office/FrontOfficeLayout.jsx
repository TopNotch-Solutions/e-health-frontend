import { Outlet } from 'react-router-dom';
import { RegistrationProvider } from './RegistrationContext';
import FrontOfficeTopbar from './components/FrontOfficeTopbar';
import { ToastProvider } from './context/ToastContext';
import { layout } from './styles/frontOfficeClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function FrontOfficeLayout() {
  return (
    <RegistrationProvider>
      <ToastProvider>
        <div className={layout.page}>
          <FrontOfficeTopbar />

          <main className={layout.main}>
            <Outlet />
          </main>

          <footer className={layout.footer}>
            Health Management System | A digital solution by{' '}
            <a
              href={KOPANO}
              target="_blank"
              rel="noopener noreferrer"
              className={layout.footerLink}
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
