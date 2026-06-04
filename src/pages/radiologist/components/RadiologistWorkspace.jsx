import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { submitSonarResults } from '../../../api/sonar';
import NurseReadOnlyIntakeCards from '../../doctor/components/NurseReadOnlyIntakeCards';
import { vitalsToIntakeForm } from '../../doctor/doctorConsultForm';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { SonarImagingStep, SonarReportStep } from './SonarModernField';

export default function RadiologistWorkspace({
  request,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const intakeForm = useMemo(
    () => vitalsToIntakeForm(request?.visit?.vitals),
    [request?.visit?.vitals, request?.id]
  );

  const allergy = request?.visit?.vitals?.allergies || '';

  const [imagingNotes, setImagingNotes] = useState('');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [report, setReport] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setImagingNotes(request?.imaging_notes || '');
    setFindings(request?.result?.findings || '');
    setImpression(request?.result?.impression || '');
    setReport(request?.result?.report || '');
    setFieldErrors({});
  }, [request?.id]);

  const doctorName = request?.requestedBy
    ? `Dr. ${[request.requestedBy.first_name, request.requestedBy.last_name].filter(Boolean).join(' ')}`
    : 'Referring physician';

  function clearError(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const errs = {};
    if (!imagingNotes.trim()) errs.imaging = 'Document imaging capture notes';
    if (!findings.trim() && !report.trim()) {
      errs.report = 'Enter findings or a formal diagnostic report';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmitToDoctor() {
    if (!request?.id) return;
    if (!validate()) {
      onActionError('Complete imaging notes and the diagnostic report before sending to the doctor.');
      return;
    }

    if (!(await confirmAction({
      title: 'Submit report?',
      text: 'Send the diagnostic report to the ordering doctor and return the patient for follow-up?',
      icon: 'question',
      confirmButtonText: 'Submit report',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await submitSonarResults(request.id, {
        imaging_notes: imagingNotes.trim(),
        findings: findings.trim() || null,
        impression: impression.trim() || null,
        report: report.trim() || null,
      });
      onToast('Diagnostic report sent — patient returned to doctor for follow-up');
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to submit ultrasound report');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-6 pb-6">
      {allergy ? (
        <section className={c.sectionPanel} aria-label="Allergy alert">
          <p className="rounded-xl border border-red-200/80 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm">
            Allergy: {allergy}
          </p>
        </section>
      ) : null}

      <section className={`${c.sectionPanel} border-violet-100/80`} aria-labelledby="sonar-referral-heading">
        <h3 id="sonar-referral-heading" className={c.sectionTitle}>
          Clinical referral from {doctorName}
        </h3>
        <p className="mt-1 text-sm font-semibold text-violet-900">{request?.scan_type}</p>
        {request?.is_emergency ? (
          <span className="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-red-800">
            Emergency imaging
          </span>
        ) : null}
        {request?.symptoms ? (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
              Symptoms / suspicion
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {request.symptoms}
            </p>
          </div>
        ) : null}
        {request?.diagnostic_questions ? (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
              Diagnostic questions
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {request.diagnostic_questions}
            </p>
          </div>
        ) : null}
        {request?.prep_instructions ? (
          <div className="mt-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-50/50 px-4 py-3 shadow-sm">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-900">
              Patient preparation
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-950">{request.prep_instructions}</p>
          </div>
        ) : null}
        {request?.clinical_notes ? (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
              Additional notes
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {request.clinical_notes}
            </p>
          </div>
        ) : null}
      </section>

      <NurseReadOnlyIntakeCards form={intakeForm} idPrefix="sonar" />

      <SonarImagingStep
        imagingNotes={imagingNotes}
        error={fieldErrors.imaging}
        onImagingChange={(e) => {
          setImagingNotes(e.target.value);
          if (e.target.value.trim()) clearError('imaging');
        }}
      />

      <SonarReportStep
        findings={findings}
        impression={impression}
        report={report}
        reportError={fieldErrors.report}
        actionLoading={actionLoading}
        onFindingsChange={(e) => {
          const v = e.target.value;
          setFindings(v);
          if (v.trim() || report.trim()) clearError('report');
        }}
        onImpressionChange={(e) => setImpression(e.target.value)}
        onReportChange={(e) => {
          const v = e.target.value;
          setReport(v);
          if (v.trim() || findings.trim()) clearError('report');
        }}
        onSubmit={handleSubmitToDoctor}
      />
    </div>
  );
}
