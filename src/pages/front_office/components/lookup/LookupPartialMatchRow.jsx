import { Link } from 'react-router-dom';
import { patientName } from '../../patientUtils';
import { lookup } from '../../styles/lookupClasses';

export default function LookupPartialMatchRow({ patient, onCompleteRegistration }) {
  return (
    <article className={lookup.partialRow}>
      <div>
        <p className="font-semibold text-slate-900">{patientName(patient)}</p>
        <p className="text-sm text-slate-600">
          {patient.patient_number} — record missing phone or national ID
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={lookup.btnSecondary} onClick={() => onCompleteRegistration(patient)}>
          Complete registration
        </button>
        <Link to={`/front_office/patient/${patient.id}`} className={lookup.btnGhost}>
          View EHR
        </Link>
      </div>
    </article>
  );
}
