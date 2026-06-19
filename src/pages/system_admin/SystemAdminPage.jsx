import { useCallback, useEffect, useState } from 'react';
import { confirmAction } from '../../utils/confirmAction';
import { getStoredUser } from '../../api/authSession';
import {
  createAdminFacility,
  createAdminSystemAdmin,
  createAdminUser,
  getAdminAuditLogs,
  getAdminDashboard,
  getAdminFacilities,
  getAdminRoles,
  getAdminUsers,
  transferAdminEmployee,
  updateAdminUser,
} from '../../api/admin';
import {
  createIcd10Code,
  getIcd10AuditLogs,
  listAdminIcd10Codes,
  updateIcd10Status,
  uploadIcd10Xlsx,
} from '../../api/icd10';
import AddIcd10Modal from './components/AddIcd10Modal';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import CreateFacilityModal from './components/CreateFacilityModal';
import RegisterEmployeeModal from './components/RegisterEmployeeModal';
import RegisterSystemAdminModal from './components/RegisterSystemAdminModal';
import TransferEmployeeModal from './components/TransferEmployeeModal';
import { admin as c } from './styles/adminClasses';
import AdminDashboardView from './views/AdminDashboardView';
import EmployeeManagementView from './views/EmployeeManagementView';
import FacilityManagementView from './views/FacilityManagementView';
import SystemAdminManagementView from './views/SystemAdminManagementView';
import Icd10ManagementView from './views/Icd10ManagementView';
import PatientRecordsView from './views/PatientRecordsView';
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
  const [systemAdmins, setSystemAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [dashboardFacilityFilter, setDashboardFacilityFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEmployee, setTransferEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [icd10Rows, setIcd10Rows] = useState([]);
  const [icd10Total, setIcd10Total] = useState(0);
  const [icd10TotalActive, setIcd10TotalActive] = useState(0);
  const [icd10TotalInactive, setIcd10TotalInactive] = useState(0);
  const [icd10Loading, setIcd10Loading] = useState(false);
  const [icd10Search, setIcd10Search] = useState('');
  const [icd10StatusFilter, setIcd10StatusFilter] = useState('');
  const [icd10ModalOpen, setIcd10ModalOpen] = useState(false);
  const [icd10Uploading, setIcd10Uploading] = useState(false);
  const [icd10TogglingId, setIcd10TogglingId] = useState(null);
  const [icd10AuditLogs, setIcd10AuditLogs] = useState([]);
  const [icd10AuditLoading, setIcd10AuditLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const dash = await getAdminDashboard({
        facility_id: dashboardFacilityFilter || undefined,
      });
      setDashboard(dash);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setDashboardLoading(false);
    }
  }, [dashboardFacilityFilter]);

  const loadCore = useCallback(async () => {
    setError('');
    try {
      const [facs, roleList] = await Promise.all([
        getAdminFacilities(),
        getAdminRoles(),
      ]);
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
        exclude_role: 'system_admin',
      });
      setEmployees(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setEmployeesLoading(false);
    }
  }, [search, statusFilter, facilityFilter, roleFilter]);

  const loadSystemAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const { rows } = await getAdminUsers({
        limit: 100,
        search: adminSearch.trim() || undefined,
        status: adminStatusFilter || undefined,
        role_only: 'system_admin',
      });
      setSystemAdmins(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load system administrators');
    } finally {
      setAdminsLoading(false);
    }
  }, [adminSearch, adminStatusFilter]);

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

  const loadIcd10 = useCallback(async () => {
    setIcd10Loading(true);
    try {
      const data = await listAdminIcd10Codes({
        search: icd10Search.trim() || undefined,
        status: icd10StatusFilter || undefined,
        limit: 100,
      });
      setIcd10Rows(data?.rows || []);
      setIcd10Total(data?.total ?? 0);
      setIcd10TotalActive(data?.total_active ?? 0);
      setIcd10TotalInactive(data?.total_inactive ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load ICD-10 catalog');
    } finally {
      setIcd10Loading(false);
    }
  }, [icd10Search, icd10StatusFilter]);

  const loadIcd10Audit = useCallback(async () => {
    setIcd10AuditLoading(true);
    try {
      const { rows } = await getIcd10AuditLogs({ limit: 50 });
      setIcd10AuditLogs(rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load ICD-10 audit logs');
    } finally {
      setIcd10AuditLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (section === 'employees') loadEmployees();
  }, [section, loadEmployees]);

  useEffect(() => {
    if (section === 'admins') loadSystemAdmins();
  }, [section, loadSystemAdmins]);

  useEffect(() => {
    if (section === 'settings') loadAudit();
  }, [section, loadAudit]);

  useEffect(() => {
    if (section === 'icd10') {
      loadIcd10();
      loadIcd10Audit();
    }
  }, [section, loadIcd10, loadIcd10Audit]);

  useEffect(() => {
    if (section !== 'icd10') return undefined;
    const t = setTimeout(() => loadIcd10(), 300);
    return () => clearTimeout(t);
  }, [icd10Search, section, loadIcd10]);

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

  useEffect(() => {
    if (section !== 'admins') return undefined;
    const t = setTimeout(() => loadSystemAdmins(), 300);
    return () => clearTimeout(t);
  }, [adminSearch, section, loadSystemAdmins]);

  const handleCreateFacility = async (form) => {
    setSubmitting(true);
    try {
      await createAdminFacility(form);
      setFacilityModalOpen(false);
      setToast('Facility created successfully.');
      const facs = await getAdminFacilities();
      setFacilities(facs || []);
      await loadDashboard();
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
      await loadDashboard();
      const facs = await getAdminFacilities();
      setFacilities(facs || []);
    } catch (err) {
      setToast(err.message || 'Could not register employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSystemAdmin = async (form) => {
    setSubmitting(true);
    try {
      const created = await createAdminSystemAdmin(form);
      setAdminModalOpen(false);
      let msg = `${created.first_name} ${created.last_name} added as system administrator.`;
      if (created.temporary_password) {
        msg += ` Temporary password: ${created.temporary_password}`;
      }
      setToast(msg);
      await loadSystemAdmins();
      await loadDashboard();
    } catch (err) {
      setToast(err.message || 'Could not add system administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferEmployee = async (payload) => {
    if (!transferEmployee) return;
    setSubmitting(true);
    try {
      const updated = await transferAdminEmployee(transferEmployee.id, payload);
      setTransferModalOpen(false);
      setTransferEmployee(null);
      setToast(
        `${updated.first_name} ${updated.last_name} transferred to ${updated.facility?.name || 'new facility'}. Login credentials unchanged.`
      );
      await loadEmployees();
      await loadDashboard();
      const facs = await getAdminFacilities();
      setFacilities(facs || []);
    } catch (err) {
      setToast(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (row, activate) => {
    const confirmed = await confirmAction({
      title: activate ? 'Activate account?' : 'Inactivate account?',
      text: activate
        ? `Activate ${row.first_name} ${row.last_name}?`
        : `Inactivate ${row.first_name} ${row.last_name}? They will remain in audit logs.`,
      icon: 'question',
      confirmButtonText: activate ? 'Activate' : 'Inactivate',
    });
    if (!confirmed) return;
    setTogglingId(row.id);
    try {
      await updateAdminUser(row.id, { is_active: activate });
      setToast(activate ? 'Account activated.' : 'Account inactivated.');
      if (section === 'admins') {
        await loadSystemAdmins();
      } else {
        await loadEmployees();
      }
      await loadDashboard();
    } catch (err) {
      setToast(err.message || 'Status update failed');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateIcd10 = async (form) => {
    setSubmitting(true);
    try {
      await createIcd10Code({ code: form.code.trim(), description: form.description.trim() });
      setIcd10ModalOpen(false);
      setToast(`ICD-10 code ${form.code.trim().toUpperCase()} added.`);
      await Promise.all([loadIcd10(), loadIcd10Audit()]);
    } catch (err) {
      setToast(err.message || 'Could not add ICD-10 code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleIcd10 = async (row, activate) => {
    const confirmed = await confirmAction({
      title: activate ? 'Activate ICD-10 code?' : 'Inactivate ICD-10 code?',
      text: activate
        ? `Activate ${row.code} for clinical use?`
        : `Inactivate ${row.code}? Doctors will no longer see it in diagnosis lookup.`,
      icon: 'question',
      confirmButtonText: activate ? 'Activate' : 'Inactivate',
    });
    if (!confirmed) return;
    setIcd10TogglingId(row.id);
    try {
      await updateIcd10Status(row.id, { is_active: activate });
      setToast(activate ? 'ICD-10 code activated.' : 'ICD-10 code inactivated.');
      await Promise.all([loadIcd10(), loadIcd10Audit()]);
    } catch (err) {
      setToast(err.message || 'ICD-10 status update failed');
    } finally {
      setIcd10TogglingId(null);
    }
  };

  const handleUploadIcd10 = async (file) => {
    setIcd10Uploading(true);
    try {
      const result = await uploadIcd10Xlsx(file);
      const parts = [
        `${result.created || 0} added`,
        `${result.updated || 0} updated`,
      ];
      if (result.errors?.length) {
        parts.push(`${result.errors.length} row issue(s)`);
      }
      setToast(`Import complete: ${parts.join(', ')}.`);
      await Promise.all([loadIcd10(), loadIcd10Audit()]);
    } catch (err) {
      setToast(err.message || 'ICD-10 upload failed');
    } finally {
      setIcd10Uploading(false);
    }
  };

  let content = null;
  if (section === 'dashboard') {
    content = (
      <AdminDashboardView
        dashboard={dashboard}
        loading={dashboardLoading}
        facilities={facilities}
        facilityFilter={dashboardFacilityFilter}
        onFacilityFilterChange={setDashboardFacilityFilter}
        onSelectFacility={(id) => setDashboardFacilityFilter(String(id))}
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
        onTransferClick={(row) => {
          setTransferEmployee(row);
          setTransferModalOpen(true);
        }}
        togglingId={togglingId}
      />
    );
  } else if (section === 'admins') {
    content = (
      <SystemAdminManagementView
        admins={systemAdmins}
        loading={adminsLoading}
        search={adminSearch}
        onSearchChange={setAdminSearch}
        statusFilter={adminStatusFilter}
        onStatusFilterChange={setAdminStatusFilter}
        onRegisterClick={() => setAdminModalOpen(true)}
        onToggleActive={handleToggleActive}
        togglingId={togglingId}
        currentUserId={user?.id}
      />
    );
  } else if (section === 'patient-records') {
    content = <PatientRecordsView />;
  } else if (section === 'icd10') {
    content = (
      <Icd10ManagementView
        rows={icd10Rows}
        total={icd10Total}
        totalActive={icd10TotalActive}
        totalInactive={icd10TotalInactive}
        loading={icd10Loading}
        search={icd10Search}
        onSearchChange={setIcd10Search}
        statusFilter={icd10StatusFilter}
        onStatusFilterChange={setIcd10StatusFilter}
        onAddClick={() => setIcd10ModalOpen(true)}
        onToggleActive={handleToggleIcd10}
        onUpload={handleUploadIcd10}
        uploading={icd10Uploading}
        togglingId={icd10TogglingId}
        auditLogs={icd10AuditLogs}
        auditLoading={icd10AuditLoading}
        onRefreshAudit={loadIcd10Audit}
      />
    );
  } else if (section === 'settings') {
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
        facilities={facilities}
      />
      <RegisterSystemAdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSubmit={handleRegisterSystemAdmin}
        submitting={submitting}
      />
      <TransferEmployeeModal
        open={transferModalOpen}
        employee={transferEmployee}
        onClose={() => {
          setTransferModalOpen(false);
          setTransferEmployee(null);
        }}
        onSubmit={handleTransferEmployee}
        submitting={submitting}
        facilities={facilities}
      />
      <AddIcd10Modal
        open={icd10ModalOpen}
        onClose={() => setIcd10ModalOpen(false)}
        onSubmit={handleCreateIcd10}
        submitting={submitting}
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
