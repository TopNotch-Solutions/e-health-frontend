import { Link } from 'react-router-dom';

const ROLE_PATHS = [
  ['front_office', 'Front office'],
  ['nurse', 'Nurse'],
  ['doctor', 'Doctor'],
  ['pharmacist', 'Pharmacist'],
  ['lab_technician', 'Lab technician'],
  ['radiologist', 'Radiologist'],
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
    <main style={{ padding: '1.5rem', maxWidth: '40rem' }}>
      <h1 style={{ marginTop: 0 }}>E-Health</h1>
      <p style={{ color: '#4b5563' }}>Open a role workspace (dev navigation). Sign in is at the app root.</p>
      <p>
        <Link to="/">Sign in</Link>
      </p>
      <h2 style={{ fontSize: '1rem', marginTop: '1.5rem' }}>Role routes</h2>
      <ul style={{ lineHeight: 1.8, paddingLeft: '1.25rem' }}>
        {ROLE_PATHS.map(([path, label]) => (
          <li key={path}>
            <Link to={`/${path}`}>{label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
