import { useEffect, useState } from 'react';
import { getMedicationCatalog, checkMedicationStock } from '../../../api/inventory';
import { submitEmergencyNurseRoute } from '../../../api/emergencyUnit';
import { IntakeSelect, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import DoctorPrescriptionSection from '../../doctor/components/DoctorPrescriptionSection';
import { emptyMedLine } from '../../doctor/doctorConsultForm';
import ClinicalTimelinePanel from '../../clinic_doctor/components/ClinicalTimelinePanel';
import {
  emptyEmergencyNurseForm,
  NURSE_ROUTING_DESTINATIONS,
  routeButtonClass,
  routeButtonLabel,
  validateEmergencyNurseForm,
} from '../emergencyUnitNurseForm';

export default function EmergencyUnitNurseWorkspace({
  patient,
  timeline,
  timelineLoading,
  actionLoading,
  setActionLoading,
  onToast,
  onActionError,
  onDone,
}) {
  const [form, setForm] = useState(emptyEmergencyNurseForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [medLine, setMedLine] = useState(emptyMedLine);
  const [prescriptionLines, setPrescriptionLines] = useState([]);
  const [medFieldErrors, setMedFieldErrors] = useState({});
  const [medCatalog, setMedCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [liveStock, setLiveStock] = useState(null);
  const [stockChecking, setStockChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMedicationCatalog()
      .then((rows) => { if (!cancelled) setMedCatalog(Array.isArray(rows) ? rows : []); })
      .catch((err) => { if (!cancelled) setCatalogError(err.message || 'Could not load catalog'); })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setForm(emptyEmergencyNurseForm());
    setPrescriptionLines([]);
    setMedLine(emptyMedLine());
    setFieldErrors({});
  }, [patient?.entryId]);

  useEffect(() => {
    const name = medLine.medication_name?.trim();
    if (!name) { setLiveStock(null); return undefined; }
    let cancelled = false;
    setStockChecking(true);
    const timer = setTimeout(() => {
      checkMedicationStock(name, Number(medLine.quantity) || 1)
        .then((data) => { if (!cancelled) setLiveStock(data); })
        .finally(() => { if (!cancelled) setStockChecking(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [medLine.medication_name, medLine.quantity]);

  const hasPrescription = prescriptionLines.length > 0;
  const showRx = form.routing_destination === 'pharmacy';

  async function handleSubmit() {
    if (!patient || actionLoading) return;
    const validation = validateEmergencyNurseForm(form, hasPrescription);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }

    setActionLoading(true);
    onActionError('');
    setFieldErrors({});
    try {
      const items = hasPrescription
        ? prescriptionLines.map((item) => ({
          medication_name: item.medication_name,
          dosage: item.dosage,
          frequency: item.frequency || null,
          quantity: item.quantity || 1,
          instructions: item.instructions || null,
        }))
        : undefined;

      await submitEmergencyNurseRoute({
        visit_id: patient.visitId,
        queue_entry_id: patient.entryId,
        next_department: form.routing_destination,
        interventions: form.interventions.trim(),
        notes: form.notes.trim() || null,
        items,
      });

      const dest = NURSE_ROUTING_DESTINATIONS.find((d) => d.value === form.routing_destination)?.label;
      onToast(`${patient.name} routed to ${dest || form.routing_destination}`);
      onDone();
    } catch (err) {
      onActionError(err.message || 'Failed to submit');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <ClinicalTimelinePanel timeline={timeline} loading={timelineLoading} />

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Clinical interventions</h3>
        <p className="mt-1 text-sm text-slate-500">Document immediate emergency care provided.</p>
        <div className="mt-4">
          <IntakeTextarea
            id="eu-interventions"
            label="Interventions performed"
            error={fieldErrors.interventions}
            className={c.textarea}
            rows={4}
            value={form.interventions}
            onChange={(e) => setForm((prev) => ({ ...prev, interventions: e.target.value }))}
          />
          <IntakeTextarea
            id="eu-notes"
            label="Notes (optional)"
            className={`${c.textarea} mt-4`}
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </section>

      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Route patient</h3>
        <IntakeSelect
          id="eu-route"
          label="Destination"
          error={fieldErrors.routing_destination}
          className={`${c.select} mt-4`}
          value={form.routing_destination}
          onChange={(e) => setForm((prev) => ({ ...prev, routing_destination: e.target.value }))}
        >
          <option value="">Select destination…</option>
          {NURSE_ROUTING_DESTINATIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </IntakeSelect>

        {showRx ? (
          <div className="mt-4">
            <DoctorPrescriptionSection
              catalog={medCatalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              medLine={medLine}
              medFieldErrors={medFieldErrors}
              onMedFieldChange={(key, value) => {
                setMedLine((prev) => ({ ...prev, [key]: value }));
                setMedFieldErrors((prev) => {
                  if (!prev[key]) return prev;
                  const next = { ...prev };
                  delete next[key];
                  return next;
                });
              }}
              onMedicationSelect={(name) => setMedLine((prev) => ({ ...prev, medication_name: name }))}
              liveStock={liveStock}
              stockChecking={stockChecking}
              prescriptionLines={prescriptionLines}
              onAddMedToList={() => {
                if (!medLine.medication_name?.trim()) {
                  setMedFieldErrors({ medication_name: 'Required' });
                  return;
                }
                setPrescriptionLines((lines) => [...lines, { ...medLine, id: Date.now() }]);
                setMedLine(emptyMedLine());
              }}
              onRemoveMedLine={(i) => setPrescriptionLines((lines) => lines.filter((_, idx) => idx !== i))}
              actionLoading={actionLoading}
              onSendToPharmacy={() => {}}
              hideSubmitButton
            />
            {fieldErrors.prescription ? (
              <p className={c.fieldError} role="alert">{fieldErrors.prescription}</p>
            ) : null}
          </div>
        ) : null}

        {form.routing_destination ? (
          <button
            type="button"
            className={`${routeButtonClass(form)} mt-6`}
            disabled={
              actionLoading
              || (form.routing_destination === 'pharmacy' && !hasPrescription)
            }
            onClick={handleSubmit}
          >
            {routeButtonLabel(form, actionLoading, hasPrescription)}
          </button>
        ) : (
          <p className={`${c.hint} mt-4`}>Choose a destination to enable routing.</p>
        )}
      </section>
    </div>
  );
}
