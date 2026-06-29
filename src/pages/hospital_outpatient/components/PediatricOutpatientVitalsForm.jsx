import { getClinicalDepartmentConfig } from '../hospitalOutpatientClinicalConfig';
import HospitalOutpatientVitalsForm from './HospitalOutpatientVitalsForm';

export default function PediatricOutpatientVitalsForm(props) {
  const config = getClinicalDepartmentConfig('pediatric_outpatient');
  return <HospitalOutpatientVitalsForm {...props} config={config} idPrefix="po" />;
}
