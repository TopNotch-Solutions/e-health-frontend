/**
 * Ensures all *Topbar*.jsx files use TopbarSignOutButton (no useConfirmSignOut).
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

const LABELS = {
  ArtNurseTopbar: 'ART Nurse',
  BillingTopbar: 'Billing',
  BookingRoomTopbar: 'Booking Room',
  ClinicDoctorTopbar: 'Master Doctor',
  DermatologistTopbar: 'Dermatologist',
  DoctorTopbar: 'Doctor',
  EmergencyUnitDoctorTopbar: 'Emergency Unit Doctor',
  EmergencyUnitNurseTopbar: 'Emergency Unit',
  ExecutiveTopbar: 'Executive',
  FrontOfficeTopbar: 'Front Office',
  FrontOfficeSupervisorTopbar: 'Front Office Supervisor',
  HivTesterTopbar: 'HIV Testing Room',
  KitchenTopbar: 'Kitchen',
  LabTechnicianTopbar: 'Laboratory',
  PapSmearSuiteTopbar: 'Pap Smear Suite',
  ParameterNurseTopbar: 'Parameter Nurse',
  PediatricCornerTopbar: 'Pediatric Corner',
  PharmacistTopbar: 'Pharmacist',
  PharmacySupervisorTopbar: 'Pharmacy Supervisor',
  PorterTopbar: 'Porter',
  PrepSuiteTopbar: 'PrEP Suite',
  RadiologistTopbar: 'Ultrasound (sonar)',
  RevenueTopbar: 'Revenue office',
  ScreeningNurseTopbar: 'Screening Nurse',
  SocialWorkerSuiteTopbar: 'Social Worker Suite',
  AdminTopbar: 'System Admin',
  WardStaffTopbar: 'Ward staff',
  WardSupervisorTopbar: 'Ward Supervisor',
  SupervisorTopbar: null,
  NurseTopbar: 'Nurse · Vitals intake',
  FamilyPlanningTopbar: 'Family Planning Suite',
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('Topbar.jsx')) out.push(p);
  }
  return out;
}

function relImport(fromFile, target) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, target).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel.replace(/\.jsx$/, '');
}

function fixFile(filePath) {
  const base = path.basename(filePath, '.jsx');
  let content = fs.readFileSync(filePath, 'utf8');
  const changed = content.includes('useConfirmSignOut')
    || content.includes('performSignOut(navigate')
    || /onClick=\{handleSignOut\}/.test(content);

  if (!changed && content.includes('TopbarSignOutButton')) return false;

  const signOutImport = relImport(filePath, path.join(SRC, 'components', 'TopbarSignOutButton.jsx'));
  const label = LABELS[base];
  const signOutLabel = base === 'SupervisorTopbar'
    ? '{moduleLabel || \'Supervisor\'}'
    : `'${label || 'Module'}'`;

  content = content.replace(/import \{ useConfirmSignOut \} from '[^']+';\r?\n/g, '');
  content = content.replace(/import \{ performSignOut \} from '[^']+';\r?\n/g, '');
  content = content.replace(/import \{ useNavigate(?:, ([^}]+))? \} from 'react-router-dom';\r?\n/g, (m, rest) => {
    if (rest && !rest.includes('useNavigate')) {
      return `import { ${rest.trim()} } from 'react-router-dom';\n`;
    }
    if (rest && rest.includes('NavLink')) {
      return `import { NavLink${rest.replace('NavLink', '').replace(/^,\s*/, ', ')} } from 'react-router-dom';\n`;
    }
    return '';
  });
  content = content.replace(/\n\s*const navigate = useNavigate\(\);\r?\n/g, '\n');
  content = content.replace(
    /\n\s*const handleSignOut = \(\) => performSignOut\(navigate, [^)]+\);\r?\n/g,
    '\n'
  );
  content = content.replace(
    /\n\s*const handleSignOut = useConfirmSignOut\([^)]+\);\r?\n/g,
    '\n'
  );

  if (!content.includes('TopbarSignOutButton')) {
    const firstImportEnd = content.indexOf('\n', content.indexOf('import '));
    content = `${content.slice(0, firstImportEnd + 1)}import TopbarSignOutButton from '${signOutImport}';\n${content.slice(firstImportEnd + 1)}`;
  }

  content = content.replace(
    /<button type="button" className=\{([^}]+)\} onClick=\{handleSignOut\}>\s*Sign Out\s*<\/button>/,
    `<TopbarSignOutButton moduleLabel=${signOutLabel} className={$1} />`
  );

  if (content.includes('useConfirmSignOut') || content.includes('handleSignOut')) {
    console.error('Could not fully fix', filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

const files = walk(SRC);
let n = 0;
for (const f of files) {
  if (fixFile(f)) {
    n += 1;
    console.log('Fixed', path.relative(SRC, f));
  }
}
console.log(`Done. ${n} file(s) updated.`);
