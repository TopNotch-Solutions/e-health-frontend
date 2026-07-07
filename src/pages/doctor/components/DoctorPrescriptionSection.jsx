import { useState } from 'react';
import { IntakeInput } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  doctorLineStockStatus,
  doctorStockDisplayStatus,
  doctorStockLabel,
  formatAvailabilityElsewhere,
  prescriptionListSummary,
  statusBadgeClass,
  allPrescriptionLinesOutOfStock,
} from '../../../utils/pharmacyStockDisplay';
import {
  SCHEDULE_TYPES,
  SCHEDULE_TYPE_OPTIONS,
  formatPrescriptionScheduleLabel,
  formatRecurringDateLabel,
  normalizeRecurringDates,
  todayIsoDate,
} from '../../../utils/prescriptionSchedule';

function DoctorStockStatusPanel({ stock, checking }) {
  if (checking) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" role="status">
        Checking stock…
      </div>
    );
  }
  if (!stock) return null;

  const isOut = doctorStockDisplayStatus(stock) === 'out_of_stock';
  const elsewhere = formatAvailabilityElsewhere(stock.availability_elsewhere);

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isOut
          ? 'border-rose-200 bg-rose-50 text-rose-900'
          : 'border-teal-200 bg-teal-50 text-teal-900'
      }`}
      role="status"
    >
      <p>
        <span className="font-bold">{doctorStockLabel(stock)}</span>
      </p>
      {isOut ? (
        <>
          <p className="mt-1 text-xs">
            You can still add and send this prescription — the pharmacist will be notified.
          </p>
          {elsewhere?.length ? (
            <div className="mt-2 rounded-md border border-rose-200/80 bg-white/60 px-2.5 py-2 text-xs">
              <p className="font-semibold text-rose-900">Where to find this medication</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-rose-800">
                {elsewhere.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-xs text-rose-800">
              Not available at other facilities on the network — contact pharmacy to procure.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}

export default function DoctorPrescriptionSection({
  catalog,
  catalogLoading,
  catalogError = '',
  medLine,
  medFieldErrors,
  onMedFieldChange,
  onMedicationSelect,
  liveStock,
  stockChecking,
  prescriptionLines,
  onAddMedToList,
  onRemoveMedLine,
  actionLoading,
  onSendToPharmacy = () => {},
  hideSubmitButton = false,
}) {
  const hasPrescription = prescriptionLines.length > 0;
  const summary = prescriptionListSummary(prescriptionLines);
  const allOutOfStock = allPrescriptionLinesOutOfStock(prescriptionLines);
  const [dateDraft, setDateDraft] = useState(todayIsoDate());
  const selectedDates = normalizeRecurringDates(medLine.recurring_dates);

  function addRecurringDate(isoDate) {
    const next = normalizeRecurringDates([...selectedDates, isoDate]);
    onMedFieldChange('recurring_dates', next);
  }

  function removeRecurringDate(isoDate) {
    onMedFieldChange(
      'recurring_dates',
      selectedDates.filter((d) => d !== isoDate)
    );
  }

  return (
    <section className={c.sectionPanel} aria-labelledby="doc-rx-heading">
      <h3 id="doc-rx-heading" className={c.sectionTitle}>
        Prescribe medication
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Stock is shown as in stock or out of stock at your facility. Out-of-stock items can still
        be prescribed — the pharmacist will be notified.
      </p>

      {summary.total > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {summary.outOfStock > 0 ? (
            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-900">
              {summary.outOfStock} out of stock on list
            </span>
          ) : null}
          {summary.inStock > 0 ? (
            <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800">
              {summary.inStock} in stock on list
            </span>
          ) : null}
        </div>
      ) : null}

      {catalogError ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
          {catalogError}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <div className={c.vitalsGrid}>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Medication *</span>
            <select
              className={`${c.input} mt-1 w-full`}
              value={medLine.medication_name}
              disabled={catalogLoading || !(catalog || []).length}
              onChange={(e) => onMedicationSelect(e.target.value)}
            >
              <option value="">
                {catalogLoading
                  ? 'Loading medications…'
                  : (catalog || []).length
                    ? 'Select medication…'
                    : 'No medications available'}
              </option>
              {(catalog || []).map((item) => {
                const label = item.name || item.medication_name;
                return (
                  <option key={item.id || label} value={label}>
                    {label}
                    {item.generic || item.generic_name
                      ? ` (${item.generic || item.generic_name})`
                      : ''}
                  </option>
                );
              })}
            </select>
            {medFieldErrors.medication_name ? (
              <p className="mt-1 text-xs text-red-600">{medFieldErrors.medication_name}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Generic name</span>
            <select
              className={`${c.input} mt-1 w-full disabled:bg-slate-50 disabled:text-slate-400`}
              value={medLine.generic_name || ''}
              disabled={!medLine.medication_name}
              onChange={(e) => onMedFieldChange('generic_name', e.target.value)}
            >
              <option value="">
                {medLine.medication_name ? 'Generic (auto-filled)' : 'Select medication first'}
              </option>
              {medLine.generic_name ? (
                <option value={medLine.generic_name}>{medLine.generic_name}</option>
              ) : null}
            </select>
          </label>

          <IntakeInput
            id="doc-med-dose"
            label="Dosage"
            required={false}
            error={medFieldErrors.dosage}
            className={c.input}
            placeholder="e.g. 500mg TDS"
            value={medLine.dosage}
            onChange={(e) => onMedFieldChange('dosage', e.target.value)}
          />
          <IntakeInput
            id="doc-med-freq"
            label="Frequency"
            required={false}
            error={null}
            className={c.input}
            placeholder="e.g. Three times daily"
            value={medLine.frequency}
            onChange={(e) => onMedFieldChange('frequency', e.target.value)}
          />
          <IntakeInput
            id="doc-med-qty"
            label="Quantity"
            required={false}
            error={null}
            className={c.input}
            inputMode="numeric"
            value={medLine.quantity}
            onChange={(e) => onMedFieldChange('quantity', e.target.value)}
          />
        </div>

        {medLine.medication_name ? (
          <DoctorStockStatusPanel stock={liveStock} checking={stockChecking} />
        ) : null}

        <IntakeInput
          id="doc-med-inst"
          label="Instructions"
          required={false}
          error={null}
          className={c.input}
          placeholder="Optional instructions"
          value={medLine.instructions}
          onChange={(e) => onMedFieldChange('instructions', e.target.value)}
        />

        <fieldset className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
            Dispensing schedule
          </legend>
          <p className="mt-1 text-xs text-slate-500">
            Choose whether this medication is given once or on a recurring schedule for future pharmacy visits.
          </p>
          <div className="mt-3 space-y-2">
            {SCHEDULE_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="med-schedule-type"
                  className="mt-0.5"
                  checked={(medLine.schedule_type || SCHEDULE_TYPES.ONCE_OFF) === opt.value}
                  onChange={() => onMedFieldChange('schedule_type', opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {(medLine.schedule_type || SCHEDULE_TYPES.ONCE_OFF) === SCHEDULE_TYPES.MONTHLY_DAY ? (
            <div className="mt-3">
              <label className="block">
                <span className="text-xs font-semibold text-slate-700">Day of month *</span>
                <select
                  className={`${c.input} mt-1 w-full max-w-xs`}
                  value={medLine.recurring_day_of_month || ''}
                  onChange={(e) => onMedFieldChange('recurring_day_of_month', e.target.value)}
                >
                  <option value="">Select day…</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={String(day)}>
                      {day}
                    </option>
                  ))}
                </select>
                {medFieldErrors.recurring_day_of_month ? (
                  <p className="mt-1 text-xs text-red-600">{medFieldErrors.recurring_day_of_month}</p>
                ) : null}
              </label>
            </div>
          ) : null}

          {(medLine.schedule_type || SCHEDULE_TYPES.ONCE_OFF) === SCHEDULE_TYPES.RECURRING_DATES ? (
            <div className="mt-3">
              <span className="text-xs font-semibold text-slate-700">Collection dates *</span>
              <p className="mt-1 text-xs text-slate-500">
                Pick specific days the patient should return for this medication — e.g. today, next
                Sunday, then Wednesday the week after. Continues until you mark the patient as better.
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="block min-w-[10rem] flex-1">
                  <span className="sr-only">Date</span>
                  <input
                    type="date"
                    className={`${c.input} mt-0 w-full`}
                    value={dateDraft}
                    onChange={(e) => setDateDraft(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className={c.btnSecondary}
                  onClick={() => {
                    if (!dateDraft) return;
                    addRecurringDate(dateDraft);
                  }}
                >
                  Add date
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                  onClick={() => {
                    const today = todayIsoDate();
                    setDateDraft(today);
                    addRecurringDate(today);
                  }}
                >
                  Add today
                </button>
              </div>
              {selectedDates.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {selectedDates.map((isoDate) => (
                    <li
                      key={isoDate}
                      className="flex items-center justify-between gap-2 rounded-lg border border-teal-200 bg-white px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {formatRecurringDateLabel(isoDate)}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-700 hover:underline"
                        onClick={() => removeRecurringDate(isoDate)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {medFieldErrors.recurring_dates ? (
                <p className="mt-1 text-xs text-red-600">{medFieldErrors.recurring_dates}</p>
              ) : null}
            </div>
          ) : null}
        </fieldset>

        <button type="button" className={c.btnSecondary} onClick={onAddMedToList}>
          + Add to prescription list
        </button>

        {prescriptionLines.length > 0 ? (
          <ul className="space-y-2">
            {prescriptionLines.map((line, i) => {
              const status = doctorLineStockStatus(line);
              const isOut = status.tone === 'outOfStock';
              const elsewhere = formatAvailabilityElsewhere(line.availability_elsewhere);
              return (
                <li
                  key={`${line.medication_name}-${i}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isOut
                      ? 'border-rose-200 bg-rose-50/80'
                      : 'border-teal-200 bg-teal-50/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span>
                        <strong>{line.medication_name}</strong>
                        {line.generic_name ? (
                          <span className="text-slate-600"> ({line.generic_name})</span>
                        ) : null}
                        {' '}
                        — {line.dosage}
                        {line.frequency ? ` (${line.frequency})` : ''} ×{line.quantity}
                      </span>
                      <p className="mt-1 text-xs font-medium text-indigo-800">
                        {formatPrescriptionScheduleLabel(line)}
                      </p>
                      {isOut && elsewhere?.length ? (
                        <p className="mt-1 text-xs text-rose-800">
                          <span className="font-semibold">Where to find: </span>
                          {elsewhere.join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${statusBadgeClass(status.tone)}`}
                      >
                        {status.label}
                      </span>
                      <button
                        type="button"
                        className="text-slate-500 hover:text-red-600"
                        onClick={() => onRemoveMedLine(i)}
                        aria-label="Remove medication"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {hasPrescription && allOutOfStock ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            All medications on this list are out of stock — the patient will not be sent to pharmacy.
            Prescription is still recorded for when stock is available.
          </p>
        ) : null}

        {hasPrescription && !hideSubmitButton ? (
          <button
            type="button"
            className={`${c.btnAction} ${c.btnPharmacy}`}
            disabled={actionLoading}
            onClick={onSendToPharmacy}
          >
            {allOutOfStock ? 'Save prescription (pharmacy skipped)' : 'Send to pharmacy'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
