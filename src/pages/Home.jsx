import { Link } from 'react-router-dom';
import AppBrand from '../components/brand/AppBrand';

const ROLE_PATHS = [
  ['front_office', 'Front office'],
  ['front_office_supervisor', 'Front office supervisor'],
  ['nurse', 'Nurse'],
  ['nurse_supervisor', 'Nurse supervisor'],
  ['doctor', 'Doctor'],
  ['doctor_supervisor', 'Doctor supervisor'],
  ['pharmacist', 'Pharmacist'],
  ['pharmacy_supervisor', 'Pharmacy supervisor'],
  ['lab_technician', 'Lab technician'],
  ['laboratory_supervisor', 'Laboratory supervisor'],
  ['radiologist', 'Radiologist'],
  ['radiologist_supervisor', 'Radiologist supervisor'],
  ['ward_supervisor', 'Ward supervisor'],
  ['ward_staff', 'Ward staff'],
  ['porter', 'Porter'],
  ['kitchen_staff', 'Kitchen staff'],
  ['kitchen_manager', 'Kitchen manager'],
  ['billing_clerk', 'Billing clerk'],
  ['revenue_officer', 'Revenue officer'],
  ['mortuary_staff', 'Mortuary staff'],
  ['social_worker', 'Social worker'],
  ['data_analyst', 'Data analyst'],
  ['system_admin', 'System admin'],
  ['executive', 'Executive'],
];

export default function HomePage() {
  return (
    <main className="max-w-xl p-6 font-sans">
      <AppBrand className="mb-4" />
      <p className="text-gray-600">Open a role workspace (dev navigation). Sign in is at the app root.</p>
      <p>
        <Link to="/" className="font-semibold text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
      <h2 className="mt-6 text-base font-semibold text-slate-800">Role routes</h2>
      <ul className="list-disc space-y-1 pl-5 leading-relaxed">
        {ROLE_PATHS.map(([path, label]) => (
          <li key={path}>
            <Link to={`/${path}`} className="text-blue-600 hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
