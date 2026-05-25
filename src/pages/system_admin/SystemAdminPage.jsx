import { useCallback, useEffect, useState } from 'react';
import { getStoredUser } from '../../api/authSession';
import {
  createAdminFacility,
  createAdminUser,
  getAdminAuditLogs,
  getAdminDashboard,
  getAdminFacilities,
  getAdminRoles,
  getAdminUsers,
  updateAdminUser,
} from '../../api/admin';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import CreateFacilityModal from './components/CreateFacilityModal';
import RegisterEmployeeModal from './components/RegisterEmployeeModal';
import { admin as c } from './styles/adminClasses';
import AdminDashboardView from './views/AdminDashboardView';
import EmployeeManagementView from './views/EmployeeManagementView';
import FacilityManagementView from './views/FacilityManagementView';
import SystemSettingsView from './views/SystemSettingsView';

const KOPANO = 'https://kopanovertex.com/';

export default function SystemAdminPage() {
  const user = getStoredUser();
  const adminLabel =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'System administrator';
  const initials =
    adminLabel
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'SA';

  const [section, setSection] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadCore = useCallback(async () => {
    setError('');
    try {
      const [dash, facs, roleList] = await Promise.all([
        getAdminDashboard(),
        getAdminFacilities(),
        getAdminRoles(),
      ]);
      setDashboard(dash);
      setFacilities(facs || []);
      setRoles(roleList || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const { rows } = await getAdminUsers({
        limit: 200,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        facility_id: facilityFilter || undefined,
        role: roleFilter || undefined,
      });
      setEmployees(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  }, [search, statusFilter, facilityFilter, roleFilter]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const { rows } = await getAdminAuditLogs({ limit: 80 });
      setAuditLogs(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (section === 'employees') loadEmployees();
  }, [section, loadEmployees]);

  useEffect(() => {
    if (section === 'settings') loadAudit();
  }, [section, loadAudit]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (section !== 'employees') return undefined;
    const t = setTimeout(() => loadEmployees(), 300);
    return () => clearTimeout(t);
  }, [search, section, loadEmployees]);

  const handleCreateFacility = async (form) => {
    setSubmitting(true);
    try {
      await createAdminFacility(form);
      setFacilityModalOpen(false);
      setToast('Facility created successfully.');
      const facs = await getAdminFacilities();
      setFacilities(facs || []);
      const dash = await getAdminDashboard();
      setDashboard(dash);
    } catch (err) {
      setToast(err.message || 'Could not create facility');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterEmployee = async (form) => {
    setSubmitting(true);
    try {
      const created = await createAdminUser(form);
      setEmployeeModalOpen(false);
      let msg = `${created.first_name} ${created.last_name} registered.`;
      if (created.temporary_password) {
        msg += ` Temporary password: ${created.temporary_password}`;
      }
      setToast(msg);
      await loadEmployees();
      const dash = await getAdminDashboard();
      setDashboard(dash);
      const facs = await getAdminFacilities();
      setFacilities(facs || []);
    } catch (err) {
      setToast(err.message || 'Could not register employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (row, activate) => {
    if (!window.confirm(
      activate
        ? `Activate ${row.first_name} ${row.last_name}?`
        : `Inactivate ${row.first_name} ${row.last_name}? They will remain in audit logs.`
    )) {
      return;
    }
    setTogglingId(row.id);
    try {
      await updateAdminUser(row.id, { is_active: activate });
      setToast(activate ? 'Employee activated.' : 'Employee inactivated.');
      await loadEmployees();
      const dash = await getAdminDashboard();
      setDashboard(dash);
    } catch (err) {
      setToast(err.message || 'Status update failed');
    } finally {
      setTogglingId(null);
    }
  };

  let content = null;
  if (section === 'dashboard') {
    content = (
      <AdminDashboardView
        dashboard={dashboard}
        loading={loading}
        onNavigate={setSection}
      />
    );
  } else if (section === 'facilities') {
    content = (
      <FacilityManagementView
        facilities={facilities}
        loading={loading}
        onCreateClick={() => setFacilityModalOpen(true)}
      />
    );
  } else if (section === 'employees') {
    content = (
      <EmployeeManagementView
        employees={employees}
        loading={employeesLoading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        facilityFilter={facilityFilter}
        onFacilityFilterChange={setFacilityFilter}
        facilities={facilities}
        roles={roles}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onRegisterClick={() => setEmployeeModalOpen(true)}
        onToggleActive={handleToggleActive}
        togglingId={togglingId}
      />
    );
  } else {
    content = (
      <SystemSettingsView
        auditLogs={auditLogs}
        loading={auditLoading}
        onRefresh={loadAudit}
      />
    );
  }

  return (
    <div className={c.page}>
      <AdminTopbar adminLabel={adminLabel} initials={initials} />

      {toast ? (
        <div className={c.toast} role="status">
          {toast}
        </div>
      ) : null}

      {error ? (
        <p className={c.alert} role="alert">
          {error}
        </p>
      ) : null}

      <div className={c.body}>
        <AdminSidebar activeSection={section} onSectionChange={setSection} />
        <main className={c.main}>
          <div className={c.mainScroll}>{content}</div>
        </main>
      </div>

      <CreateFacilityModal
        open={facilityModalOpen}
        onClose={() => setFacilityModalOpen(false)}
        onSubmit={handleCreateFacility}
        submitting={submitting}
      />
      <RegisterEmployeeModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSubmit={handleRegisterEmployee}
        submitting={submitting}
        roles={roles}
        facilities={facilities}
      />

      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | System administrator
      </footer>
    </div>
  );
}
