import { Outlet } from 'react-router-dom';
import AppShellFooter from '../../components/brand/AppShellFooter';
import { ToastProvider } from '../front_office/context/ToastContext';
import { shell } from '../front_office/styles/frontOfficeClasses';
import MaternityFrontOfficeTopbar from './components/MaternityFrontOfficeTopbar';
import { MaternityRegistrationProvider } from './MaternityRegistrationContext';

export default function MaternityFrontOfficeLayout() {
  return (
    <ToastProvider>
      <MaternityRegistrationProvider>
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100/80">
          <MaternityFrontOfficeTopbar />

          <main className={shell.main}>
            <Outlet />
          </main>

          <AppShellFooter className={shell.footer} />
        </div>
      </MaternityRegistrationProvider>
    </ToastProvider>
  );
}