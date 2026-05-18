import { Link } from 'react-router-dom';
import { formatDob, maskId, patientName } from '../../patientUtils';
import { ehr, statusBadgeClass } from '../../styles/ehrClasses';
import { patientAge, patientCategoryTone, patientInitials } from '../../utils/ehrUtils';

export default function EhrPatientHeader({ patient }) {
  const age = patientAge(patient.date_of_birth);
  const category = patient.category || 'known';

  return (
    <>
      <Link to="/front_office" className={ehr.backLink}>
        <span aria-hidden>←</span> Back to lookup
      </Link>

      <header className={ehr.hero}>
        <div className={ehr.heroInner}>
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
            <div className={ehr.avatar} aria-hidden>
              {patientInitials(patient)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-200/90">
                Electronic health record
              </p>
              <h1 className={ehr.heroTitle}>{patientName(patient)}</h1>
              <p className={ehr.heroMeta}>
                <span className="font-mono">{patient.patient_number}</span>
                {patient.id_number ? (
                  <>
                    {' '}
                    · ID {maskId(patient.id_number)}
                  </>
                ) : null}
                {patient.date_of_birth ? (
                  <>
                    {' '}
                    · DOB {formatDob(patient.date_of_birth)}
                    {age != null ? ` (${age} yrs)` : ''}
                  </>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={statusBadgeClass(patientCategoryTone(category))}>
                  {category.replace('_', ' ')}
                </span>
                {patient.is_emergency ? (
                  <span className={statusBadgeClass('danger')}>Emergency</span>
                ) : null}
                {patient.payment_type ? (
                  <span className={statusBadgeClass('neutral')}>{patient.payment_type} payer</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
