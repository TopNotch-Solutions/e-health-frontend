import {
  ADMIT_TRANSPORT_CHECKLIST_OPTIONS,
  EQUIPMENT_MODES,
} from '../../../constants/admitTransportChecklist';
import { wst } from '../styles/wardStaffClasses';

export function emptyPorterChecklist() {
  return Object.fromEntries(ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((o) => [o.id, false]));
}

export function buildPorterTransportPayload({
  equipmentRequired,
  equipmentNotes,
  criticalNotes,
  checklist,
}) {
  return {
    equipment_required: equipmentRequired || 'stretcher',
    equipment_notes: equipmentNotes?.trim() || null,
    critical_notes: criticalNotes?.trim() || null,
    equipment_checklist: ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((opt) => ({
      id: opt.id,
      checked: Boolean(checklist?.[opt.id]),
    })),
  };
}

const REQUIRED_CHECKLIST_IDS = ['id_band', 'mobility_match', 'rails_bed'];

export default function IcuDispositionPorterFields({
  equipmentRequired,
  onEquipmentRequiredChange,
  equipmentNotes,
  onEquipmentNotesChange,
  criticalNotes,
  onCriticalNotesChange,
  checklist,
  onChecklistToggle,
  idPrefix = 'icu-porter',
  fieldErrors = {},
}) {
  const checklistError = fieldErrors.equipment_checklist;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900">Porter transport</h4>
        <p className="mt-1 text-xs text-slate-600">
          Equipment, notes, and checklist are sent to internal porters with the transport request.
        </p>
      </div>

      <label className="block text-sm" htmlFor={`${idPrefix}-equipment`}>
        <span className={wst.infoLabel}>Equipment / mode of transport</span>
        <select
          id={`${idPrefix}-equipment`}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
            fieldErrors.equipment_required ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'
          }`}
          value={equipmentRequired}
          onChange={(e) => onEquipmentRequiredChange(e.target.value)}
        >
          {EQUIPMENT_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {fieldErrors.equipment_required ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.equipment_required}</p>
        ) : null}
      </label>

      <label className="block text-sm" htmlFor={`${idPrefix}-equipment-notes`}>
        <span className={wst.infoLabel}>
          Equipment notes {equipmentRequired === 'other' ? '(required)' : '(optional)'}
        </span>
        <textarea
          id={`${idPrefix}-equipment-notes`}
          rows={2}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
            fieldErrors.equipment_notes ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'
          }`}
          value={equipmentNotes}
          onChange={(e) => onEquipmentNotesChange(e.target.value)}
          placeholder="e.g. Bariatric chair, two staff required"
        />
        {fieldErrors.equipment_notes ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.equipment_notes}</p>
        ) : null}
      </label>

      <label className="block text-sm" htmlFor={`${idPrefix}-critical-notes`}>
        <span className={wst.infoLabel}>Critical notes for porter (required)</span>
        <textarea
          id={`${idPrefix}-critical-notes`}
          rows={3}
          className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm ${
            fieldErrors.critical_notes ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'
          }`}
          value={criticalNotes}
          onChange={(e) => onCriticalNotesChange(e.target.value)}
          placeholder="Falls risk, oxygen dependency, isolation precautions…"
        />
        {fieldErrors.critical_notes ? (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.critical_notes}</p>
        ) : null}
      </label>

      <fieldset
        className={`rounded-xl border bg-slate-50/80 p-3 ${
          checklistError ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'
        }`}
      >
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Equipment checklist (required items marked *)
        </legend>
        <ul className="mt-2 space-y-2">
          {ADMIT_TRANSPORT_CHECKLIST_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex cursor-pointer gap-2 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600"
                  checked={Boolean(checklist?.[opt.id])}
                  onChange={() => onChecklistToggle(opt.id)}
                />
                {opt.label}
                {REQUIRED_CHECKLIST_IDS.includes(opt.id) ? (
                  <span className="text-red-600">*</span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
        {checklistError ? <p className="mt-2 text-xs text-red-600">{checklistError}</p> : null}
      </fieldset>
    </div>
  );
}
