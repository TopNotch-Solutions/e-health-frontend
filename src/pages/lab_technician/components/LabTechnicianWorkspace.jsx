import { useEffect, useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { submitLabResults } from '../../../api/lab';
import NurseReadOnlyIntakeCards from '../../doctor/components/NurseReadOnlyIntakeCards';
import { vitalsToIntakeForm } from '../../doctor/doctorConsultForm';
import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

const FLAG_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function emptyResultLine(test) {
  return {
    test_id: test.id,
    value: '',
    unit: '',
    flag: 'normal',
    reference_range: '',
  };
}

export default function LabTechnicianWorkspace({
  request,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const tests = useMemo(
    () => (Array.isArray(request?.tests) ? request.tests : []),
    [request?.tests, request?.id]
  );

  const intakeForm = useMemo(
    () => vitalsToIntakeForm(request?.visit?.vitals),
    [request?.visit?.vitals, request?.id]
  );

  const allergy = request?.visit?.vitals?.allergies || '';

  const [resultLines, setResultLines] = useState([]);
  const [summary, setSummary] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setResultLines(tests.map(emptyResultLine));
    setSummary('');
    setLabNotes(request?.clinical_notes || '');
    setFieldErrors({});
  }, [request?.id, tests]);

  function updateLine(index, key, value) {
    setResultLines((lines) =>
      lines.map((line, i) => (i === index ? { ...line, [key]: value } : line))
    );
    setFieldErrors((prev) => {
      if (!prev[`value-${index}`]) return prev;
      const next = { ...prev };
      delete next[`value-${index}`];
      return next;
    });
  }

  function validateResults() {
    const errs = {};
    resultLines.forEach((line, i) => {
      if (!String(line.value ?? '').trim()) errs[`value-${i}`] = 'Enter result value';
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmitToDoctor() {
    if (!request?.id) return;
    if (!validateResults()) {
      onActionError('Enter a value for each ordered test before sending results to the doctor.');
      return;
    }

    if (!(await confirmAction({
      title: 'Submit results?',
      text: 'Send laboratory results to the ordering doctor and return the patient to the doctor queue?',
      icon: 'question',
      confirmButtonText: 'Submit results',
    }))) return;

    setActionLoading(true);
    onActionError('');
    try {
      await submitLabResults(request.id, {
        summary: summary.trim() || `Laboratory results — ${request.test_type}`,
        lab_notes: labNotes.trim() || null,
        test_results: resultLines.map((line) => ({
          test_id: line.test_id,
          value: line.value.trim(),
          unit: line.unit?.trim() || null,
          flag: line.flag || 'normal',
          reference_range: line.reference_range?.trim() || null,
        })),
      });
      onToast('Results submitted — patient returned to doctor queue');
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to submit laboratory results');
    } finally {
      setActionLoading(false);
    }
  }

  const doctorName = request?.requestedBy
    ? `Dr. ${[request.requestedBy.first_name, request.requestedBy.last_name].filter(Boolean).join(' ')}`
    : 'Ordering physician';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {allergy ? (
        <section className={c.sectionPanel} aria-label="Allergy alert">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            Allergy: {allergy}
          </p>
        </section>
      ) : null}

      <NurseReadOnlyIntakeCards form={intakeForm} idPrefix="lab" />

      <section className={c.sectionPanel} aria-labelledby="lab-order-heading">
        <h3 id="lab-order-heading" className={c.sectionTitle}>
          Laboratory order
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Ordered by {doctorName}
          {request?.is_emergency ? (
            <span className="ml-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold uppercase text-red-800">
              Emergency
            </span>
          ) : null}
        </p>
        {request?.clinical_notes ? (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-800">Clinical notes: </span>
            {request.clinical_notes}
          </p>
        ) : null}
        <ul className="mt-3 list-inside list-disc text-sm text-slate-700">
          {tests.map((t) => (
            <li key={t.id}>
              {t.name}
              {t.sampleType ? (
                <span className="text-slate-500"> · {t.sampleType}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className={c.sectionPanel} aria-labelledby="lab-results-heading">
        <h3 id="lab-results-heading" className={c.sectionTitle}>
          Test results
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Record values for each test. When complete, send results back to the doctor.
        </p>

        <div className="mt-4 grid gap-4">
          <IntakeInput
            id="lab-summary"
            label="Results summary (title)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={c.input}
            placeholder="e.g. Haematology panel — within normal limits"
          />
          <IntakeTextarea
            id="lab-notes"
            label="Laboratory notes"
            value={labNotes}
            onChange={(e) => setLabNotes(e.target.value)}
            className={c.textarea}
            rows={3}
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-3 py-2">Test</th>
                <th className="px-3 py-2">Result</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Flag</th>
                <th className="px-3 py-2">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-slate-500">
                    No tests on this request.
                  </td>
                </tr>
              ) : (
                tests.map((test, i) => {
                  const line = resultLines[i] || emptyResultLine(test);
                  const testMeta = tests.find((t) => t.id === test.id) || test;
                  return (
                    <tr key={test.id}>
                      <td className="px-3 py-2 align-top font-medium text-slate-800">
                        {testMeta.name}
                        {testMeta.sampleType ? (
                          <span className="mt-0.5 block text-xs font-normal text-slate-500">
                            {testMeta.sampleType}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          className={c.input}
                          value={line.value}
                          onChange={(e) => updateLine(i, 'value', e.target.value)}
                          aria-invalid={Boolean(fieldErrors[`value-${i}`])}
                        />
                        {fieldErrors[`value-${i}`] ? (
                          <p className="mt-0.5 text-xs text-red-600">{fieldErrors[`value-${i}`]}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          className={c.input}
                          value={line.unit}
                          onChange={(e) => updateLine(i, 'unit', e.target.value)}
                          placeholder="g/L, mmol/L…"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <select
                          className={c.select}
                          value={line.flag}
                          onChange={(e) => updateLine(i, 'flag', e.target.value)}
                        >
                          {FLAG_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <input
                          type="text"
                          className={c.input}
                          value={line.reference_range}
                          onChange={(e) => updateLine(i, 'reference_range', e.target.value)}
                          placeholder="Ref. range"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={`${c.btnAction} ${c.btnLab} w-full sm:w-auto sm:min-w-[280px]`}
            disabled={actionLoading || tests.length === 0}
            onClick={handleSubmitToDoctor}
          >
            Send results to doctor
          </button>
        </div>
      </section>
    </div>
  );
}
