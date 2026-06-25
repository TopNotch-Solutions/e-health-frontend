import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/Home';
import RequireAuth from './components/RequireAuth';
import FrontOfficeLayout from './pages/front_office/FrontOfficeLayout';
import FrontOfficeSupervisorPage from './pages/front_office_supervisor';
import FrontOfficeDashboardPage from './pages/front_office/FrontOfficeDashboardPage';
import PatientRegistrationStep1Page from './pages/front_office/PatientRegistrationStep1Page';
import PatientRegistrationStep2Page from './pages/front_office/PatientRegistrationStep2Page';
import PatientRegistrationStep3Page from './pages/front_office/PatientRegistrationStep3Page';
import PatientRegistrationStep4Page from './pages/front_office/PatientRegistrationStep4Page';
import PatientEhrPage from './pages/front_office/PatientEhrPage';
import TodaysRegistrationsPage from './pages/front_office/TodaysRegistrationsPage';
import NursePage from './pages/nurse';
import ParameterNursePage from './pages/parameter_nurse';
import ScreeningNursePage from './pages/screening_nurse';
import HivTesterPage from './pages/hiv_tester';
import ArtNursePage from './pages/art_nurse';
import EmergencyUnitNursePage from './pages/emergency_unit_nurse';
import EmergencyUnitDoctorPage from './pages/emergency_unit_doctor';
import BookingRoomPage from './pages/booking_room';
import HospitalOutpatientPage from './pages/hospital_outpatient';
import ClinicStationPlaceholderPage from './pages/clinic_station/ClinicStationPlaceholderPage';
import PrepSuitePage from './pages/prep_suite';
import DermatologistPage from './pages/dermatologist';
import PapSmearSuitePage from './pages/pap_smear_suite';
import ClinicDoctorPage from './pages/clinic_doctor';
import NurseSupervisorPage from './pages/nurse_supervisor';
import DoctorPage from './pages/doctor';
import DoctorSupervisorPage from './pages/doctor_supervisor';
import PharmacistPage from './pages/pharmacist';
import PharmacySupervisorPage from './pages/pharmacy_supervisor';
import LabTechnicianPage from './pages/lab_technician';
import LaboratorySupervisorPage from './pages/laboratory_supervisor';
import RadiologistPage from './pages/radiologist';
import RadiologistSupervisorPage from './pages/radiologist_supervisor';
import WardSupervisorPage from './pages/ward_supervisor';
import WardStaffPage from './pages/ward_staff';
import PorterPage from './pages/porter';
import KitchenStaffPage from './pages/kitchen_staff';
import KitchenManagerPage from './pages/kitchen_manager';
import BillingClerkPage from './pages/billing_clerk';
import RevenueOfficerPage from './pages/revenue_officer';
import MortuaryStaffPage from './pages/mortuary_staff';
import SocialWorkerPage from './pages/social_worker';
import FamilyPlanningSuitePage from './pages/family_planner';
import PediatricCornerPage from './pages/pediatric_corner';
import DataAnalystPage from './pages/data_analyst';
import SystemAdminPage from './pages/system_admin';
import ExecutivePage from './pages/executive';
import MaternityFrontOfficerLayout from './pages/maternity_front_officer';
import MaternityFrontOfficeDashboardPage from './pages/maternity_front_officer/MaternityFrontOfficeDashboardPage';
import MaternityRegistrationStep1Page from './pages/maternity_front_officer/MaternityRegistrationStep1Page';
import MaternityRegistrationStep2Page from './pages/maternity_front_officer/MaternityRegistrationStep2Page';
import MaternityRegistrationStep3Page from './pages/maternity_front_officer/MaternityRegistrationStep3Page';
import MaternityRegistrationStep4Page from './pages/maternity_front_officer/MaternityRegistrationStep4Page';
import MaternityTodaysRegistrationsPage from './pages/maternity_front_officer/MaternityTodaysRegistrationsPage';
import MaternityAncStaffPage from './pages/maternity_anc_staff';
import MaternityAnwStaffPage from './pages/maternity_anw_staff';
import MaternityPnwStaffPage from './pages/maternity_pnw_staff';
import MaternityIcuStaffPage from './pages/maternity_icu_staff';
import MaternityNicuStaffPage from './pages/maternity_nicu_staff';

function RoleRoute({ role, children }) {
  return <RequireAuth role={role}>{children}</RequireAuth>;
}

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
            <RoleRoute role="front_office">
              <FrontOfficeLayout />
            </RoleRoute>
          }
        >
          <Route index element={<FrontOfficeDashboardPage />} />
          <Route path="today" element={<TodaysRegistrationsPage />} />
          <Route path="registration/step-1" element={<PatientRegistrationStep1Page />} />
          <Route path="registration/step-2" element={<PatientRegistrationStep2Page />} />
          <Route path="registration/step-3" element={<PatientRegistrationStep3Page />} />
          <Route path="registration/step-4" element={<PatientRegistrationStep4Page />} />
          <Route path="patient/:patientId" element={<PatientEhrPage />} />
        </Route>
        <Route
          path="/front_office_supervisor"
          element={
            <RoleRoute role="front_office_supervisor">
              <FrontOfficeSupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/nurse"
          element={
            <RoleRoute role="nurse">
              <NursePage />
            </RoleRoute>
          }
        />
        <Route
          path="/parameter_nurse"
          element={
            <RoleRoute role="parameter_nurse">
              <ParameterNursePage />
            </RoleRoute>
          }
        />
        <Route
          path="/screening_nurse"
          element={
            <RoleRoute role="screening_nurse">
              <ScreeningNursePage />
            </RoleRoute>
          }
        />
        <Route
          path="/anc_nurse"
          element={
            <RoleRoute role="anc_nurse">
              <ClinicStationPlaceholderPage subtitle="Antenatal care" />
            </RoleRoute>
          }
        />
        <Route
          path="/pediatric_corner"
          element={
            <RoleRoute role="pediatric_corner">
              <PediatricCornerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/prep_suite"
          element={
            <RoleRoute role="prep_suite">
              <PrepSuitePage />
            </RoleRoute>
          }
        />
        <Route
          path="/pap_smear_suite"
          element={
            <RoleRoute role="pap_smear_suite">
              <PapSmearSuitePage />
            </RoleRoute>
          }
        />
        <Route
          path="/family_planner"
          element={
            <RoleRoute role="family_planner">
              <FamilyPlanningSuitePage />
            </RoleRoute>
          }
        />
        <Route
          path="/hiv_tester"
          element={
            <RoleRoute role="hiv_tester">
              <HivTesterPage />
            </RoleRoute>
          }
        />
        <Route
          path="/art_nurse"
          element={
            <RoleRoute role="art_nurse">
              <ArtNursePage />
            </RoleRoute>
          }
        />
        <Route
          path="/emergency_unit_nurse"
          element={
            <RoleRoute role="emergency_unit_nurse">
              <EmergencyUnitNursePage />
            </RoleRoute>
          }
        />
        <Route
          path="/emergency_unit_doctor"
          element={
            <RoleRoute role="emergency_unit_doctor">
              <EmergencyUnitDoctorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/booking_room"
          element={
            <RoleRoute role="booking_room">
              <BookingRoomPage />
            </RoleRoute>
          }
        />
        {[
          'pediatric_outpatient_nurse',
          'ent_nurse',
          'hospital_emergency_nurse',
          'eye_nurse',
          'orthopedic_outpatient_nurse',
          'adult_outpatient_nurse',
          'physiotherapy_nurse',
          'big_room_specialist_nurse',
          'urology_nurse',
          'mental_health_nurse',
        ].map((role) => (
          <Route
            key={role}
            path={`/${role}`}
            element={
              <RoleRoute role={role}>
                <HospitalOutpatientPage />
              </RoleRoute>
            }
          />
        ))}
        <Route
          path="/clinic_doctor"
          element={
            <RoleRoute role="master_doctor">
              <ClinicDoctorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/dermatologist"
          element={
            <RoleRoute role="dermatologist">
              <DermatologistPage />
            </RoleRoute>
          }
        />
        <Route
          path="/maternity_front_officer"
          element={
            <RoleRoute role="maternity_front_officer">
              <MaternityFrontOfficerLayout />
            </RoleRoute>
          }
        >
          <Route index element={<MaternityFrontOfficeDashboardPage />} />
          <Route path="today" element={<MaternityTodaysRegistrationsPage />} />
          <Route path="registration/step-1" element={<MaternityRegistrationStep1Page />} />
          <Route path="registration/step-2" element={<MaternityRegistrationStep2Page />} />
          <Route path="registration/step-3" element={<MaternityRegistrationStep3Page />} />
          <Route path="registration/step-4" element={<MaternityRegistrationStep4Page />} />
        </Route>
        <Route
          path="/maternity_anc_staff"
          element={
            <RoleRoute role="maternity_anc_staff">
              <MaternityAncStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/maternity_anw_staff"
          element={
            <RoleRoute role="maternity_anw_staff">
              <MaternityAnwStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/maternity_pnw_staff"
          element={
            <RoleRoute role="maternity_pnw_staff">
              <MaternityPnwStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/maternity_icu_staff"
          element={
            <RoleRoute role="maternity_icu_staff">
              <MaternityIcuStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/maternity_nicu_staff"
          element={
            <RoleRoute role="maternity_nicu_staff">
              <MaternityNicuStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/nurse_supervisor"
          element={
            <RoleRoute role="nurse_supervisor">
              <NurseSupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <RoleRoute role="doctor">
              <DoctorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/doctor_supervisor"
          element={
            <RoleRoute role="doctor_supervisor">
              <DoctorSupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/pharmacist"
          element={
            <RoleRoute role="pharmacist">
              <PharmacistPage />
            </RoleRoute>
          }
        />
        <Route
          path="/pharmacy_supervisor"
          element={
            <RoleRoute role="pharmacy_supervisor">
              <PharmacySupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/lab_technician"
          element={
            <RoleRoute role="lab_technician">
              <LabTechnicianPage />
            </RoleRoute>
          }
        />
        <Route
          path="/laboratory_supervisor"
          element={
            <RoleRoute role="laboratory_supervisor">
              <LaboratorySupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/radiologist"
          element={
            <RoleRoute role="radiologist">
              <RadiologistPage />
            </RoleRoute>
          }
        />
        <Route
          path="/radiologist_supervisor"
          element={
            <RoleRoute role="radiologist_supervisor">
              <RadiologistSupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/ward_supervisor"
          element={
            <RoleRoute role="ward_supervisor">
              <WardSupervisorPage />
            </RoleRoute>
          }
        />
        <Route
          path="/ward_staff"
          element={
            <RoleRoute role="ward_staff">
              <WardStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/porter"
          element={
            <RoleRoute role="porter">
              <PorterPage />
            </RoleRoute>
          }
        />
        <Route
          path="/internal_porter"
          element={
            <RoleRoute role="internal_porter">
              <PorterPage />
            </RoleRoute>
          }
        />
        <Route
          path="/external_porter"
          element={
            <RoleRoute role="external_porter">
              <PorterPage />
            </RoleRoute>
          }
        />
        <Route
          path="/kitchen_staff"
          element={
            <RoleRoute role="kitchen_staff">
              <KitchenStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/kitchen_manager"
          element={
            <RoleRoute role="kitchen_manager">
              <KitchenManagerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/billing_clerk"
          element={
            <RoleRoute role="billing_clerk">
              <BillingClerkPage />
            </RoleRoute>
          }
        />
        <Route
          path="/revenue_officer"
          element={
            <RoleRoute role="revenue_officer">
              <RevenueOfficerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/mortuary_staff"
          element={
            <RoleRoute role="mortuary_staff">
              <MortuaryStaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="/social_worker"
          element={
            <RoleRoute role="social_worker">
              <SocialWorkerPage />
            </RoleRoute>
          }
        />
        <Route
          path="/data_analyst"
          element={
            <RoleRoute role="data_analyst">
              <DataAnalystPage />
            </RoleRoute>
          }
        />
        <Route
          path="/system_admin"
          element={
            <RoleRoute role="system_admin">
              <SystemAdminPage />
            </RoleRoute>
          }
        />
        <Route
          path="/executive"
          element={
            <RequireAuth roles={['executive', 'system_admin']}>
              <ExecutivePage />
            </RequireAuth>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
