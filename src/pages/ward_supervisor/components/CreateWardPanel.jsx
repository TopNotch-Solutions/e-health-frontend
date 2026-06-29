import { IntakeInput, IntakeSelect } from '../../nurse/components/IntakeField';
import { ws } from '../styles/wardSupervisorClasses';

const WARD_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'pediatric', label: 'Pediatric' },
  { value: 'icu', label: 'ICU' },
  { value: 'surgical_complex', label: 'Surgical complex' },
  { value: 'specialized_inpatient', label: 'Specialized inpatient' },
  { value: 'outpatient_specialist', label: 'Outpatient specialist' },
  { value: 'psychiatric', label: 'Psychiatric' },
];

export default function CreateWardPanel({
  name,
  onNameChange,
  wardNumber,
  onWardNumberChange,
  wardType,
  onWardTypeChange,
  roomCount,
  onRoomCountChange,
  error,
  creating,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={ws.bedMapPanel}>
      <div className={ws.bedMapHeader}>
        <div>
          <h2 className={ws.chartTitle}>New ward</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            One bed per room. All beds start as active — open the ward after creation and click beds to
            mark any as inactive.
          </p>
        </div>
        <button type="button" className={ws.btnGhost} onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="mt-6 grid gap-5 lg:grid-cols-2" onSubmit={onSubmit}>
        <IntakeInput
          id="ws-ward-name"
          label="Ward name"
          required
          className={ws.input}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <IntakeInput
          id="ws-ward-number"
          label="Ward code"
          required
          className={ws.input}
          value={wardNumber}
          onChange={(e) => onWardNumberChange(e.target.value)}
          placeholder="e.g. GW-10"
        />
        <IntakeSelect
          id="ws-ward-type"
          label="Ward type"
          required
          className={ws.select}
          value={wardType}
          onChange={(e) => onWardTypeChange(e.target.value)}
        >
          {WARD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </IntakeSelect>
        <IntakeInput
          id="ws-room-count"
          label="Number of rooms (and beds)"
          required
          type="number"
          min={1}
          max={200}
          className={ws.input}
          value={roomCount}
          onChange={(e) => onRoomCountChange(e.target.value)}
        />

        {error ? (
          <p className="lg:col-span-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button type="submit" className={ws.btnPrimary} disabled={creating}>
            {creating ? 'Creating ward…' : 'Create ward & beds'}
          </button>
          <button
            type="button"
            className={ws.btnGhost}
            onClick={() => onRoomCountChange('10')}
          >
            Quick preset: 10 rooms
          </button>
        </div>
      </form>
    </div>
  );
}
