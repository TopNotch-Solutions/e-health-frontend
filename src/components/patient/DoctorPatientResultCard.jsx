import { formatDob, maskId, patientName } from '../../pages/front_office/patientUtils';
import { patientAge } from '../../pages/front_office/utils/ehrUtils';
import { lookup } from '../../pages/front_office/styles/lookupClasses';

export default function DoctorPatientResultCard({
  patient,
  selected,
  loading,
  onOpen,
}) {
  const age = patientAge(patient.date_of_birth);
  const busy = loading && selected;

  return (
    <article
      className={`${lookup.returningCard} transition-shadow ${
        selected ? 'ring-2 ring-teal-500 ring-offset-2' : 'hover:shadow-md'
      }`}
    >
      <span className={lookup.returningBadge}>Patient record</span>
      <h3 className={`mt-3 text-xl ${lookup.resultsTitle}`}>{patientName(patient)}</h3>
      <p className={`mt-1 ${lookup.resultsSubtitle}`}>
        <span className="font-mono font-semibold">{patient.patient_number || '—'}</span>
        {patient.id_number ? (
          <>
            {' '}
            · ID <span className="font-mono">{maskId(patient.id_number)}</span>
          </>
        ) : null}
      </p>
      <p className={`mt-1 ${lookup.resultsSubtitle}`}>
        {patient.sex ? `${patient.sex.charAt(0).toUpperCase()}${patient.sex.slice(1)}` : '—'}
        {patient.date_of_birth ? ` · DOB ${formatDob(patient.date_of_birth)}` : ''}
        {age != null ? ` · Age ${age}` : ''}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={lookup.btnPrimary}
          disabled={busy}
          onClick={() => onOpen(patient)}
        >
          {busy ? 'Opening record…' : 'Open medical record book'}
        </button>
      </div>
    </article>
  );
}
