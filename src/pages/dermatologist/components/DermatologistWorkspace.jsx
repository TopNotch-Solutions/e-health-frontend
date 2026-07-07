import { useEffect, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { allPrescriptionLinesOutOfStock, formatSkippedPharmacyPatientToast } from '../../../utils/pharmacyStockDisplay';
import { IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import DoctorPrescriptionSection from '../../doctor/components/DoctorPrescriptionSection';
import { checkMedicationStock, getMedicationCatalog } from '../../../api/inventory';
import { emptyMedLine, commitMedLineToList, buildPrescriptionItemPayload } from '../../doctor/doctorConsultForm';
import {
  completeDermatologistSession,
  routeDermatologistToBooking,
  routeDermatologistToPharmacy,
  saveDermatologistObservations,
} from '../../../api/dermatologist';
import {
  DERMATOLOGIST_DISPOSITIONS,
  dispositionButtonClass,
  dispositionButtonLabel,
  dispositionShowsPrescription,
  emptyObservationForm,
  validateDisposition,
} from '../dermatologistForm';

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10h-1V7a4 4 0 10-8 0v3H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-3 0h-4V7a2 2 0 114 0v3z" />
    </svg>
  );
}

export default function DermatologistWorkspace({
  patient,
  assessment,
  actionLoading,
  setActionLoading,
  onToast,
  onError,
  onDone,
  onAssessmentUpdate,
}) {
  const [form, setForm] = useState(emptyObservationForm(assessment));
  const [fieldErrors, setFieldErrors] = useState({});
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  const observationsSaved = !!assessment?.observations_saved;
  const isFinalized = !!assessment?.is_finalized;
  const routingUnlocked = observationsSaved && !isFinalized;
  const showPrescription = dispositionShowsPrescription(form.disposition);

  useEffect(() => {
    setForm(emptyObservationForm(assessment));
    setFieldErrors({});
    setPrescriptionLines([]);
    setMedLine(emptyMedLine());
  }, [patient?.entryId, assessment?.id]);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    getMedicationCatalog()
      .then((rows) => { if (!cancelled) setMedCatalog(Array.isArray(rows) ? rows : []); })
      .catch((err) => {
        if (!cancelled) setCatalogError(err.message || 'Could not load medication catalog.');
      })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const name = medLine.medication_name?.trim();
    const qty = Number(medLine.quantity) || 1;
    if (!name) {
      setLiveStock(null);
      return undefined;
    }
    let cancelled = false;
    setStockChecking(true);
    const timer = setTimeout(() => {
      checkMedicationStock(name, qty)
        .then((data) => { if (!cancelled) setLiveStock(data); })
        .catch(() => { if (!cancelled) setLiveStock(null); })
        .finally(() => { if (!cancelled) setStockChecking(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [medLine.medication_name, medLine.quantity]);

  function onFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    onError('');
  }

  function buildPayload() {
    return {
      visit_id: patient.visitId,
      queue_entry_id: patient.entryId,
      clinical_observations: form.clinical_observations,
      skin_assessment: form.skin_assessment,
      differential_diagnosis: form.differential_diagnosis,
      treatment_plan: form.treatment_plan,
    };
  }

  function buildPrescriptionItems() {
    return prescriptionLines.map((item) => buildPrescriptionItemPayload(item));
  }

  async function handleSaveOnly() {
    if (!patient || actionLoading || isFinalized) return;
    const errors = validateDisposition(form, prescriptionLines);
    const obsOnly = { ...errors };
    delete obsOnly.disposition;
    delete obsOnly.prescription;
    if (Object.keys(obsOnly).length) {
      setFieldErrors(obsOnly);
      return;
    }

    if (!(await confirmAction({
      title: 'Save observations?',
      text: `Save observations for ${patient.name}?`,
      icon: 'question',
      confirmButtonText: 'Save',
    }))) return;

    setActionLoading(true);
    onError('');
    try {
      const res = await saveDermatologistObservations(buildPayload());
      onAssessmentUpdate(res.assessment);
      onToast(`Observations saved for ${patient.name}`);
    } catch (err) {
      onError(err.message || 'Failed to save observations');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisposition() {
    if (!patient || !form.disposition || actionLoading || isFinalized) return;

    const errors = validateDisposition(form, prescriptionLines);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    const allOutOfStock = allPrescriptionLinesOutOfStock(prescriptionLines);

    const confirmMessages = {
      complete_session: `Save and complete the session for ${patient.name}? The patient will not be routed elsewhere.`,
      pharmacy: allOutOfStock
        ? `All medications are out of stock. Save the prescription for ${patient.name} without sending them to pharmacy?`
        : `Send prescription to pharmacy for ${patient.name}?`,
      booking_room: `Route ${patient.name} to the Booking Room for state hospital referral?`,
    };
    const dispositionTitles = {
      complete_session: 'Complete session?',
      pharmacy: allOutOfStock ? 'Save prescription?' : 'Send to Pharmacy?',
      booking_room: 'Route to Booking Room?',
    };
    if (!(await confirmAction({
      title: dispositionTitles[form.disposition],
      text: confirmMessages[form.disposition],
      icon: 'question',
      confirmButtonText: 'Yes, proceed',
    }))) return;

    setActionLoading(true);
    onError('');
    try {
      const payload = buildPayload();

      if (form.disposition === 'complete_session') {
        await completeDermatologistSession(payload);
        onToast(`${patient.name} — session saved and completed`);
        onDone();
        return;
      }

      if (form.disposition === 'pharmacy') {
        const result = await routeDermatologistToPharmacy({
          ...payload,
          items: buildPrescriptionItems(),
        });
        onToast(
          formatSkippedPharmacyPatientToast(patient.name, result)
            || `${patient.name} — prescribed and routed to Pharmacy`
        );
        onDone();
        return;
      }

      if (form.disposition === 'booking_room') {
        await routeDermatologistToBooking(payload);
        onToast(`${patient.name} — routed to Booking Room`);
        onDone();
      }
    } catch (err) {
      onError(err.message || 'Failed to complete action');
    } finally {
      setActionLoading(false);
    }
  }

  function addMedToList() {
    const ok = commitMedLineToList({
      medLine,
      liveStock,
      setPrescriptionLines,
      setMedFieldErrors,
      setMedLine,
      setLiveStock,
    });
    if (!ok) return;
    setFieldErrors((prev) => {
      if (!prev.prescription) return prev;
      const next = { ...prev };
      delete next.prescription;
      return next;
    });
  }

  const allOutOfStock = allPrescriptionLinesOutOfStock(prescriptionLines);

  const canSubmitDisposition =
    form.disposition === 'pharmacy'
      ? prescriptionLines.length > 0
      : Boolean(form.disposition);

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Clinical observations &amp; skin assessment</h3>
        <p className="mt-1 text-sm text-slate-500">
          Document findings for this visit. You can save without routing, prescribe for pharmacy,
          or refer to the Booking Room.
        </p>

        <div className="mt-4 space-y-4">
          <IntakeTextarea
            id="derm-obs"
            label="Clinical observations"
            required
            className={c.textarea}
            rows={4}
            value={form.clinical_observations}
            onChange={(e) => onFieldChange('clinical_observations', e.target.value)}
            error={fieldErrors.clinical_observations}
            disabled={isFinalized}
          />
          <IntakeTextarea
            id="derm-skin"
            label="Skin assessment"
            required
            className={c.textarea}
            rows={4}
            value={form.skin_assessment}
            onChange={(e) => onFieldChange('skin_assessment', e.target.value)}
            error={fieldErrors.skin_assessment}
            disabled={isFinalized}
          />
          <IntakeTextarea
            id="derm-diff"
            label="Differential diagnosis (optional)"
            className={c.textarea}
            rows={2}
            value={form.differential_diagnosis}
            onChange={(e) => onFieldChange('differential_diagnosis', e.target.value)}
            disabled={isFinalized}
          />
          <IntakeTextarea
            id="derm-plan"
            label="Treatment plan (optional)"
            className={c.textarea}
            rows={2}
            value={form.treatment_plan}
            onChange={(e) => onFieldChange('treatment_plan', e.target.value)}
            disabled={isFinalized}
          />
        </div>

        {!isFinalized ? (
          <div className="mt-4">
            <button
              type="button"
              className={c.btnSecondary}
              disabled={actionLoading}
              onClick={handleSaveOnly}
            >
              {actionLoading ? 'Saving…' : 'Save observations only'}
            </button>
          </div>
        ) : null}

        {observationsSaved && !isFinalized ? (
          <p className="mt-3 text-sm font-medium text-teal-800" role="status">
            Observations on file — choose an action below.
          </p>
        ) : null}
      </section>

      <section className={`${c.sectionPanel} relative`}>
        <h3 className={c.sectionTitle}>Next step</h3>
        {!routingUnlocked ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <LockIcon />
            <span>Save observations above to unlock routing and completion options.</span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            Complete the visit without routing, send to pharmacy with a prescription, or refer to
            the Booking Room.
          </p>
        )}

        <div className={`mt-4 space-y-4 ${routingUnlocked ? '' : 'pointer-events-none opacity-50'}`}>
          <IntakeSelect
            id="derm-disposition"
            label="Action"
            className={c.select}
            value={form.disposition}
            onChange={(e) => onFieldChange('disposition', e.target.value)}
            error={fieldErrors.disposition}
            disabled={isFinalized}
          >
            <option value="">Select action…</option>
            {DERMATOLOGIST_DISPOSITIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </IntakeSelect>

          {showPrescription ? (
            <DoctorPrescriptionSection
              catalog={medCatalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              medLine={medLine}
              medFieldErrors={medFieldErrors}
              onMedFieldChange={(k, v) => {
                setMedLine((prev) => ({ ...prev, [k]: v }));
                setMedFieldErrors((prev) => {
                  if (!prev[k]) return prev;
                  const next = { ...prev };
                  delete next[k];
                  return next;
                });
              }}
              onMedicationSelect={(name) => {
                const entry = medCatalog.find(
                  (c) => c.name === name || c.medication_name === name
                );
                setMedLine((prev) => ({
                  ...prev,
                  medication_name: name,
                  generic_name: entry?.generic || entry?.generic_name || '',
                }));
              }}
              liveStock={liveStock}
              stockChecking={stockChecking}
              prescriptionLines={prescriptionLines}
              onAddMedToList={addMedToList}
              onRemoveMedLine={(index) => setPrescriptionLines((lines) => lines.filter((_, i) => i !== index))}
              actionLoading={actionLoading}
              hideSubmitButton
            />
          ) : null}

          {fieldErrors.prescription ? (
            <p className="text-sm text-red-600" role="alert">{fieldErrors.prescription}</p>
          ) : null}

          <button
            type="button"
            className={dispositionButtonClass(form)}
            disabled={!routingUnlocked || !canSubmitDisposition || actionLoading}
            onClick={handleDisposition}
          >
            {dispositionButtonLabel(form, actionLoading, prescriptionLines.length > 0, allOutOfStock)}
          </button>
        </div>
      </section>
    </div>
  );
}
