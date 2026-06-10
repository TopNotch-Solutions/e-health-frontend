import { useParams } from 'react-router-dom';
import PatientMedicalHistoryContent from '../../components/patient/PatientMedicalHistoryContent';
import { ehr } from './styles/ehrClasses';

export default function PatientEhrPage() {
  const { patientId } = useParams();

  return (
    <div className={ehr.page}>
      <PatientMedicalHistoryContent patientId={patientId} />
    </div>
  );
}
