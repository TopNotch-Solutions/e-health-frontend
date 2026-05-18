import { Outlet } from 'react-router-dom';
import { RegistrationProvider } from './RegistrationContext';
import FrontOfficeTopbar from './components/FrontOfficeTopbar';
import { ToastProvider } from './context/ToastContext';

const KOPANO = 'https://kopanovertex.com/';

export default function FrontOfficeLayout() {
  return (
    <RegistrationProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <FrontOfficeTopbar />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>

          <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 sm:px-6">
            Health Management System | A digital solution by{' '}
            <a href={KOPANO} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
              Kopano-Vertex
            </a>{' '}
            | (c) 2026 All rights reserved
          </footer>
        </div>
      </ToastProvider>
    </RegistrationProvider>
  );
}
