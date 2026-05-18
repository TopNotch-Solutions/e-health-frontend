import { useState } from 'react';
import { Link } from 'react-router-dom';
import IntakeDetailsForm from '../IntakeDetailsForm';
import { useToast } from '../../context/ToastContext';
import { formatDob, maskId, patientName } from '../../patientUtils';
import { lookup } from '../../styles/lookupClasses';

export default function ReturningPatientCard({
  patient,
  onCheckIn,
  checkInLoading,
  checkInPatientId,
}) {
  const { showToast } = useToast();
  const [modeOfArrival, setModeOfArrival] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const busy = checkInLoading && checkInPatientId === patient.id;

  async function handleCheckIn() {
    if (!modeOfArrival) {
      showToast('Select mode of arrival before check-in.', 'error');
      return;
    }
    if (!accompaniedBy) {
      showToast('Select who accompanied the patient before check-in.', 'error');
      return;
    }
    await onCheckIn(patient, {
      mode_of_arrival: modeOfArrival,
      accompanied_by: accompaniedBy,
    });
  }

  return (
    <article className={lookup.returningCard}>
      <span className={lookup.returningBadge}>Returning user</span>
      <h3 className="mt-3 text-xl font-bold text-slate-900">{patientName(patient)}</h3>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-mono font-semibold">{patient.patient_number}</span>
        {patient.id_number ? (
          <>
            {' '}
            · ID <span className="font-mono">{maskId(patient.id_number)}</span>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        DOB {formatDob(patient.date_of_birth)}
        {patient.phone ? ` · ${patient.phone}` : ''}
      </p>
      <p className="mt-3 text-sm text-teal-900">
        Full profile on file — duplicate registration prevented.
      </p>

      <IntakeDetailsForm
        modeOfArrival={modeOfArrival}
        accompaniedBy={accompaniedBy}
        onModeChange={setModeOfArrival}
        onAccompaniedChange={setAccompaniedBy}
        disabled={checkInLoading}
        classNames={lookup}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={lookup.btnPrimary}
          disabled={checkInLoading}
          onClick={handleCheckIn}
        >
          {busy ? 'Checking in…' : 'Check-in patient'}
        </button>
        <Link
          to={`/front_office/patient/${patient.id}`}
          className={lookup.btnSecondary}
        >
          View EHR
        </Link>
      </div>
    </article>
  );
}
