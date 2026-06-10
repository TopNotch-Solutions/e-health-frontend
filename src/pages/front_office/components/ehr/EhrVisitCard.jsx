import { useState } from 'react';
import { ehr, statusBadgeClass } from '../../styles/ehrClasses';
import {
  formatDateTime,
  formatLabel,
  formatVitalsLine,
  visitStatusTone,
  visitSummaryCounts,
  visitTypeTone,
} from '../../utils/ehrUtils';

function DetailBlock({ title, children }) {
  if (!children) return null;
  return (
    <div className={ehr.sectionBlock}>
      <h4 className={ehr.sectionTitle}>{title}</h4>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </div>
  );
}

export default function EhrVisitCard({ visit, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const counts = visitSummaryCounts(visit);
  const vitalsLine = formatVitalsLine(visit.vitals);

  return (
    <article className={`${ehr.visitCard} ${open ? ehr.visitCardOpen : ''}`}>
      <button
        type="button"
        className={ehr.visitHeader}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900">{visit.visit_number}</span>
            <span className={statusBadgeClass(visitTypeTone(visit.visit_type))}>
              {formatLabel(visit.visit_type)}
            </span>
            <span className={statusBadgeClass(visitStatusTone(visit.status))}>
              {formatLabel(visit.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {formatDateTime(visit.created_at)}
            {visit.current_department ? ` · ${formatLabel(visit.current_department)}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {counts.hasVitals ? <span className="rounded-md bg-teal-50 px-2 py-0.5 text-teal-800">Vitals</span> : null}
            {counts.consultations > 0 ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5">
                {counts.consultations} consultation{counts.consultations !== 1 ? 's' : ''}
              </span>
            ) : null}
            {counts.labs > 0 ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5">
                {counts.labs} lab{counts.labs !== 1 ? 's' : ''}
              </span>
            ) : null}
            {counts.prescriptions > 0 ? (
              <span className="rounded-md bg-slate-100 px-2 py-0.5">
                {counts.prescriptions} Rx
              </span>
            ) : null}
            {counts.hasAdmission ? (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-900">Admitted</span>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-teal-700" aria-hidden>
          {open ? 'Hide' : 'Details'}
        </span>
      </button>

      {open ? (
        <div className={ehr.visitBody}>
          <div className="space-y-3">
            <DetailBlock title="Vital signs">
              {vitalsLine ? (
                <p>{vitalsLine}</p>
              ) : (
                <p className="text-slate-500">No vitals recorded for this visit.</p>
              )}
              {visit.vitals?.chief_complaint ? (
                <p className="mt-2">
                  <span className="font-semibold text-slate-800">Chief complaint: </span>
                  {visit.vitals.chief_complaint}
                </p>
              ) : null}
              {visit.vitals?.allergies ? (
                <p className="mt-1 text-amber-900">
                  <span className="font-semibold">Allergies: </span>
                  {visit.vitals.allergies}
                </p>
              ) : null}
            </DetailBlock>

            {visit.vitals?.current_medications ||
            visit.vitals?.immunization_status ||
            visit.vitals?.social_history ? (
              <DetailBlock title="Medical history">
                {visit.vitals?.current_medications ? (
                  <p>
                    <span className="font-semibold text-slate-800">Current medications: </span>
                    {visit.vitals.current_medications}
                  </p>
                ) : null}
                {visit.vitals?.immunization_status ? (
                  <p className={visit.vitals?.current_medications ? 'mt-2' : ''}>
                    <span className="font-semibold text-slate-800">Immunization status: </span>
                    {visit.vitals.immunization_status}
                  </p>
                ) : null}
                {visit.vitals?.social_history ? (
                  <p className={visit.vitals?.current_medications || visit.vitals?.immunization_status ? 'mt-2' : ''}>
                    <span className="font-semibold text-slate-800">Social history: </span>
                    {visit.vitals.social_history}
                  </p>
                ) : null}
              </DetailBlock>
            ) : null}

            {visit.consultations?.length > 0 ? (
              <DetailBlock title="Consultations">
                <ul className="space-y-3">
                  {visit.consultations.map((c) => (
                    <li key={c.id} className="border-l-2 border-teal-200 pl-3">
                      {c.diagnosis ? (
                        <p>
                          <span className="font-semibold text-slate-800">Diagnosis: </span>
                          {c.diagnosis}
                        </p>
                      ) : null}
                      {c.notes ? <p className="mt-1 text-slate-600">{c.notes}</p> : null}
                      {!c.diagnosis && !c.notes ? (
                        <p className="text-slate-500">Consultation recorded — no notes.</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            ) : null}

            {visit.labRequests?.length > 0 ? (
              <DetailBlock title="Laboratory">
                <ul className="list-inside list-disc space-y-1">
                  {visit.labRequests.map((lab) => (
                    <li key={lab.id}>
                      {lab.test_type}
                      {lab.status ? ` (${formatLabel(lab.status)})` : ''}
                    </li>
                  ))}
                </ul>
              </DetailBlock>
            ) : null}

            {visit.sonarRequests?.length > 0 ? (
              <DetailBlock title="Imaging">
                <p>{visit.sonarRequests.length} imaging request(s) on file.</p>
              </DetailBlock>
            ) : null}

            {!counts.hasVitals &&
            counts.consultations === 0 &&
            counts.labs === 0 &&
            counts.prescriptions === 0 &&
            !counts.hasAdmission ? (
              <p className="text-sm text-slate-500">No clinical details recorded for this visit yet.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
