import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/Home';
import RequireAuth from './components/RequireAuth';
import FrontOfficeLayout from './pages/front_office/FrontOfficeLayout';
import FrontOfficeDashboardPage from './pages/front_office/FrontOfficeDashboardPage';
import PatientRegistrationStep1Page from './pages/front_office/PatientRegistrationStep1Page';
import PatientRegistrationStep2Page from './pages/front_office/PatientRegistrationStep2Page';
import PatientRegistrationStep3Page from './pages/front_office/PatientRegistrationStep3Page';
import PatientRegistrationStep4Page from './pages/front_office/PatientRegistrationStep4Page';
import PatientEhrPage from './pages/front_office/PatientEhrPage';
import NursePage from './pages/nurse';
import DoctorPage from './pages/doctor';
import PharmacistPage from './pages/pharmacist';
import LabTechnicianPage from './pages/lab_technician';
import RadiologistPage from './pages/radiologist';
import WardSupervisorPage from './pages/ward_supervisor';
import WardStaffPage from './pages/ward_staff';
import PorterPage from './pages/porter';
import KitchenStaffPage from './pages/kitchen_staff';
import KitchenManagerPage from './pages/kitchen_manager';
import BillingClerkPage from './pages/billing_clerk';
import RevenueOfficerPage from './pages/revenue_officer';
import MortuaryStaffPage from './pages/mortuary_staff';
import SocialWorkerPage from './pages/social_worker';
import DataAnalystPage from './pages/data_analyst';
import SystemAdminPage from './pages/system_admin';
import ExecutivePage from './pages/executive';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dev" element={<HomePage />} />
        <Route
          path="/front_office"
          element={
            <RequireAuth>
              <FrontOfficeLayout />
            </RequireAuth>
          }
        >
          <Route index element={<FrontOfficeDashboardPage />} />
          <Route path="registration/step-1" element={<PatientRegistrationStep1Page />} />
          <Route path="registration/step-2" element={<PatientRegistrationStep2Page />} />
          <Route path="registration/step-3" element={<PatientRegistrationStep3Page />} />
          <Route path="registration/step-4" element={<PatientRegistrationStep4Page />} />
          <Route path="patient/:patientId" element={<PatientEhrPage />} />
        </Route>
        <Route
          path="/nurse"
          element={
            <RequireAuth>
              <NursePage />
            </RequireAuth>
          }
        />
        <Route
          path="/doctor"
          element={
            <RequireAuth>
              <DoctorPage />
            </RequireAuth>
          }
        />
        <Route path="/pharmacist" element={<PharmacistPage />} />
        <Route path="/lab_technician" element={<LabTechnicianPage />} />
        <Route path="/radiologist" element={<RadiologistPage />} />
        <Route path="/ward_supervisor" element={<WardSupervisorPage />} />
        <Route path="/ward_staff" element={<WardStaffPage />} />
        <Route path="/porter" element={<PorterPage />} />
        <Route path="/kitchen_staff" element={<KitchenStaffPage />} />
        <Route path="/kitchen_manager" element={<KitchenManagerPage />} />
        <Route path="/billing_clerk" element={<BillingClerkPage />} />
        <Route path="/revenue_officer" element={<RevenueOfficerPage />} />
        <Route path="/mortuary_staff" element={<MortuaryStaffPage />} />
        <Route path="/social_worker" element={<SocialWorkerPage />} />
        <Route path="/data_analyst" element={<DataAnalystPage />} />
        <Route path="/system_admin" element={<SystemAdminPage />} />
        <Route path="/executive" element={<ExecutivePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
