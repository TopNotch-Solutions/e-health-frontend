import { Outlet } from 'react-router-dom';
import AppShellFooter from '../../components/brand/AppShellFooter';
import { RegistrationProvider } from './RegistrationContext';
import FrontOfficeTopbar from './components/FrontOfficeTopbar';
import { ToastProvider } from './context/ToastContext';
import { shell } from './styles/frontOfficeClasses';

export default function FrontOfficeLayout() {
  return (
    <RegistrationProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100/80">
          <FrontOfficeTopbar />

          <main className={shell.main}>
            <Outlet />
          </main>

          <AppShellFooter className={shell.footer} />
        </div>
      </ToastProvider>
    </RegistrationProvider>
  );
}
