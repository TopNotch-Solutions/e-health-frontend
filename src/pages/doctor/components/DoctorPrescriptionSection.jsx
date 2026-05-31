import { IntakeInput } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { lineStockStatus, prescriptionListSummary, statusBadgeClass } from '../../../utils/pharmacyStockDisplay';

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
  onSendToPharmacy,
  hideSubmitButton = false,
}) {
  const hasPrescription = prescriptionLines.length > 0;
  const summary = prescriptionListSummary(prescriptionLines);

  return (
    <section className={c.sectionPanel} aria-labelledby="doc-rx-heading">
      <h3 id="doc-rx-heading" className={c.sectionTitle}>
        Prescribe medication
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Optional. You may prescribe any medication — pharmacy will see stock status. Out-of-stock
        items are still sent to the pharmacy queue.
      </p>

      {summary.total > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {summary.outOfStock > 0 ? (
            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-900">
              {summary.outOfStock} out of stock on list
            </span>
          ) : null}
          {summary.lowStock > 0 ? (
            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
              {summary.lowStock} low stock on list
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
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              liveStock?.stock_status === 'out_of_stock'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : liveStock?.stock_status === 'low_stock'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-teal-200 bg-teal-50 text-teal-900'
            }`}
            role="status"
          >
            {stockChecking ? (
              <span>Checking stock…</span>
            ) : liveStock ? (
              <>
                <span className="font-bold">{liveStock.stock_label}</span>
                <span className="ml-2 text-xs">
                  {liveStock.quantity_in_stock} on hand
                  {liveStock.required_quantity != null
                    ? ` · need ${liveStock.required_quantity} for this order`
                    : ''}
                  {liveStock.reorder_level != null ? ` · reorder at ${liveStock.reorder_level}` : ''}
                </span>
                {liveStock.stock_status === 'out_of_stock' ? (
                  <p className="mt-1 text-xs">
                    You can still add and send this prescription — the pharmacist will be notified.
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
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

        <button type="button" className={c.btnSecondary} onClick={onAddMedToList}>
          + Add to prescription list
        </button>

        {prescriptionLines.length > 0 ? (
          <ul className="space-y-2">
            {prescriptionLines.map((line, i) => {
              const status = lineStockStatus(line);
              return (
                <li
                  key={`${line.medication_name}-${i}`}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                    line.stock_status === 'out_of_stock'
                      ? 'border-rose-200 bg-rose-50/80'
                      : line.stock_status === 'low_stock'
                        ? 'border-amber-200 bg-amber-50/80'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <span>
                      <strong>{line.medication_name}</strong>
                      {line.generic_name ? (
                        <span className="text-slate-600"> ({line.generic_name})</span>
                      ) : null}
                      {' '}
                      — {line.dosage}
                      {line.frequency ? ` (${line.frequency})` : ''} ×{line.quantity}
                    </span>
                    {line.quantity_in_stock != null ? (
                      <p className="mt-0.5 text-xs text-slate-600">
                        Pharmacy stock now: {line.quantity_in_stock}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
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
                </li>
              );
            })}
          </ul>
        ) : null}

        {hasPrescription && !hideSubmitButton ? (
          <button
            type="button"
            className={`${c.btnAction} ${c.btnPharmacy}`}
            disabled={actionLoading}
            onClick={onSendToPharmacy}
          >
            Send to pharmacy
          </button>
        ) : null}
      </div>
    </section>
  );
}
