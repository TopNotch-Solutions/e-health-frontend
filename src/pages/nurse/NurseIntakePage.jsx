import { useEffect, useMemo, useState } from 'react';

const KOPANO = 'https://kopanovertex.com/';

const QUEUE = [
  {
    id: '8829',
    name: 'Eleanor Vance',
    status: 'in_progress',
    time: '10:45 AM',
    age: 34,
    sex: 'Female',
    bloodGroup: 'O Negative',
    allergies: ['Penicillin', 'Peanuts'],
    allergyShort: 'Penicillin',
  },
  {
    id: '9012',
    name: 'Julian Blackwood',
    status: 'waiting',
    time: '11:05 AM',
    age: 52,
    sex: 'Male',
    bloodGroup: 'A+',
    allergies: [],
    allergyShort: '',
  },
  {
    id: '9155',
    name: 'Theodora Crain',
    status: 'waiting',
    time: '11:15 AM',
    age: 29,
    sex: 'Female',
    bloodGroup: 'B+',
    allergies: ['Latex'],
    allergyShort: 'Latex',
  },
  { id: '9201', name: 'Arthur Pym', status: 'waiting', time: '11:18 AM', age: 41, sex: 'Male', bloodGroup: 'O+', allergies: [], allergyShort: '' },
  { id: '9202', name: 'Lenore Usher', status: 'waiting', time: '11:22 AM', age: 67, sex: 'Female', bloodGroup: 'AB-', allergies: ['Sulfa'], allergyShort: 'Sulfa' },
  { id: '9203', name: 'Roderick Usher', status: 'waiting', time: '11:24 AM', age: 45, sex: 'Male', bloodGroup: 'A-', allergies: [], allergyShort: '' },
  { id: '9204', name: 'Madeline Usher', status: 'waiting', time: '11:26 AM', age: 43, sex: 'Female', bloodGroup: 'O-', allergies: [], allergyShort: '' },
  { id: '9205', name: 'William Wilson', status: 'waiting', time: '11:30 AM', age: 38, sex: 'Male', bloodGroup: 'B-', allergies: ['Codeine'], allergyShort: 'Codeine' },
];

const INTAKE_MODES = ['Walk-in', 'Ambulance', 'Private', 'Carried'];

const emptyForm = () => ({
  intakeMode: 'Walk-in',
  accompaniedBy: '',
  temperature: '',
  pulse: '',
  rr: '',
  spo2: '',
  bpSys: '',
  bpDia: '',
  gcs: '15',
  weight: '',
  chiefComplaint: '',
  onset: '',
  aggravating: '',
  medications: '',
  immunization: 'Up to date',
  socialHistory: '',
  physicalExam: '',
});

function BuildingIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21V8l8-4 8 4v13M9 21v-6h6v6M4 21h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NurseIntakePage() {
  const [recordSearch, setRecordSearch] = useState('');
  const [selectedId, setSelectedId] = useState(QUEUE[0].id);
  const [form, setForm] = useState(emptyForm);
  const [nurseLabel, setNurseLabel] = useState('Nurse');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      if (name) setNurseLabel(name);
    } catch {
      /* ignore */
    }
  }, []);

  const selected = useMemo(() => QUEUE.find((p) => p.id === selectedId) || QUEUE[0], [selectedId]);

  const filteredQueue = useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    if (!q) return QUEUE;
    return QUEUE.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        `${p.age}`.includes(q)
    );
  }, [recordSearch]);

  useEffect(() => {
    setForm(emptyForm());
  }, [selectedId]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const waitingCount = QUEUE.filter((p) => p.status === 'waiting').length;

  const initials = nurseLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'NR';

  return (
    <div className="nr-app">
      <header className="nr-topbar">
        <div className="nr-brand">
          <BuildingIcon />
          <span>Health Management System</span>
        </div>
        <div className="nr-topbar-right">
          <div className="nr-search">
            <label htmlFor="nr-record-search" className="visually-hidden">
              Search records
            </label>
            <input
              id="nr-record-search"
              type="search"
              placeholder="Search records"
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="nr-user">
            <div className="nr-user-avatar" aria-hidden>
              {initials}
            </div>
            <span className="nr-user-name">{nurseLabel}</span>
          </div>
        </div>
      </header>

      <div className="nr-body">
        <aside className="nr-queue" aria-label="Patient queue">
          <h2 className="nr-queue-title">Patient queue</h2>
          <p className="nr-queue-sub">{waitingCount} patients waiting for vitals</p>
          <div className="nr-queue-list">
            {filteredQueue.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`nr-queue-card ${p.id === selectedId ? 'nr-queue-card-active' : ''}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="nr-queue-meta">
                  <span className={`nr-badge ${p.status === 'in_progress' ? 'nr-badge-progress' : 'nr-badge-waiting'}`}>
                    {p.status === 'in_progress' ? 'In progress' : 'Waiting'}
                  </span>
                  <span className="nr-queue-time">{p.time}</span>
                </div>
                <p className="nr-queue-name">{p.name}</p>
                <p className="nr-queue-line">
                  {p.age}Y • {p.sex} • ID: #{p.id}
                </p>
                {p.allergyShort ? (
                  <p className="nr-queue-alert">
                    <span aria-hidden>⚠</span> Allergies: {p.allergyShort}
                    {p.allergies.length > 1 ? ' +' : ''}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
          {filteredQueue.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>No patients match your search.</p>
          ) : null}
        </aside>

        <div className="nr-main">
          <div className="nr-patient-banner">
            <div className="nr-patient-photo" aria-hidden />
            <div className="nr-patient-grid">
              <div>
                <span className="nr-patient-label">Full name</span>
                <span className="nr-patient-value">{selected.name}</span>
              </div>
              <div>
                <span className="nr-patient-label">Age / sex</span>
                <span className="nr-patient-value">
                  {selected.age} years / {selected.sex}
                </span>
              </div>
              <div>
                <span className="nr-patient-label">Blood group</span>
                <span className="nr-patient-value">{selected.bloodGroup}</span>
              </div>
              <div>
                <span className="nr-patient-label">Known allergies</span>
                {selected.allergies.length ? (
                  <div className="nr-allergy-box">{selected.allergies.join(', ')}</div>
                ) : (
                  <span className="nr-patient-value" style={{ color: '#64748b', fontWeight: 600 }}>
                    None recorded
                  </span>
                )}
              </div>
            </div>
            <div className="nr-banner-actions">
              <button type="button" className="nr-icon-btn" title="History" aria-label="View history">
                ↺
              </button>
              <button type="button" className="nr-icon-btn" title="Print" aria-label="Print record">
                ⎙
              </button>
            </div>
          </div>

          <section className="nr-section">
            <div className="nr-section-head">1. Intake details</div>
            <div className="nr-section-body">
              <div className="nr-field">
                <label>Intake mode</label>
                <div className="nr-segment" role="group" aria-label="Intake mode">
                  {INTAKE_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={form.intakeMode === mode ? 'nr-segment-active' : ''}
                      onClick={() => setField('intakeMode', mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="nr-field">
                <label htmlFor="nr-accompanied">Accompanied by</label>
                <input
                  id="nr-accompanied"
                  placeholder="e.g. Spouse, Guardian, Self"
                  value={form.accompaniedBy}
                  onChange={(e) => setField('accompaniedBy', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="nr-section">
            <div className="nr-section-head">2. Vital signs</div>
            <div className="nr-section-body">
              <div className="nr-field-row">
                <div className="nr-field">
                  <label htmlFor="nr-temp">Temperature (°C)</label>
                  <input id="nr-temp" inputMode="decimal" value={form.temperature} onChange={(e) => setField('temperature', e.target.value)} />
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-pulse">Pulse (BPM)</label>
                  <input id="nr-pulse" inputMode="numeric" value={form.pulse} onChange={(e) => setField('pulse', e.target.value)} />
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-rr">RR (breaths/min)</label>
                  <input id="nr-rr" inputMode="numeric" value={form.rr} onChange={(e) => setField('rr', e.target.value)} />
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-spo2">SpO2 (%)</label>
                  <input id="nr-spo2" inputMode="numeric" value={form.spo2} onChange={(e) => setField('spo2', e.target.value)} />
                </div>
              </div>
              <div className="nr-field-row">
                <div className="nr-field">
                  <label>BP (mmHg)</label>
                  <div className="nr-bp">
                    <input
                      placeholder="Sys"
                      aria-label="Systolic BP"
                      inputMode="numeric"
                      value={form.bpSys}
                      onChange={(e) => setField('bpSys', e.target.value)}
                    />
                    <input
                      placeholder="Dia"
                      aria-label="Diastolic BP"
                      inputMode="numeric"
                      value={form.bpDia}
                      onChange={(e) => setField('bpDia', e.target.value)}
                    />
                  </div>
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-gcs">GCS score</label>
                  <select id="nr-gcs" value={form.gcs} onChange={(e) => setField('gcs', e.target.value)}>
                    <option value="15">15 (Normal)</option>
                    <option value="14">14</option>
                    <option value="13">13</option>
                    <option value="12">12</option>
                    <option value="11">11 or below</option>
                  </select>
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-weight">Weight (kg)</label>
                  <input id="nr-weight" inputMode="decimal" value={form.weight} onChange={(e) => setField('weight', e.target.value)} />
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-bmi">BMI (calc)</label>
                  <input id="nr-bmi" className="nr-bmi-readonly" readOnly value="—" title="Calculated when height is available" />
                </div>
              </div>
            </div>
          </section>

          <section className="nr-section">
            <div className="nr-section-head">3. Main complaint</div>
            <div className="nr-section-body">
              <div className="nr-field">
                <label htmlFor="nr-chief">Chief complaint</label>
                <textarea id="nr-chief" value={form.chiefComplaint} onChange={(e) => setField('chiefComplaint', e.target.value)} />
              </div>
              <div className="nr-field">
                <label htmlFor="nr-onset">Onset &amp; duration</label>
                <input
                  id="nr-onset"
                  placeholder="When did it start? For how long?"
                  value={form.onset}
                  onChange={(e) => setField('onset', e.target.value)}
                />
              </div>
              <div className="nr-field">
                <label htmlFor="nr-aggravating">Aggravating / alleviating factors</label>
                <input
                  id="nr-aggravating"
                  placeholder="What makes it better or worse?"
                  value={form.aggravating}
                  onChange={(e) => setField('aggravating', e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="nr-section">
            <div className="nr-section-head">4. Medical history</div>
            <div className="nr-section-body">
              <div className="nr-field">
                <label htmlFor="nr-meds">Current medications</label>
                <textarea
                  id="nr-meds"
                  placeholder="List medications and dosages..."
                  value={form.medications}
                  onChange={(e) => setField('medications', e.target.value)}
                />
              </div>
              <div className="nr-field-row">
                <div className="nr-field">
                  <label htmlFor="nr-imm">Immunization status</label>
                  <select id="nr-imm" value={form.immunization} onChange={(e) => setField('immunization', e.target.value)}>
                    <option>Up to date</option>
                    <option>Partial / unknown</option>
                    <option>Declined</option>
                  </select>
                </div>
                <div className="nr-field">
                  <label htmlFor="nr-social">Social history (smoking, alcohol)</label>
                  <input
                    id="nr-social"
                    placeholder="Notes on lifestyle habits..."
                    value={form.socialHistory}
                    onChange={(e) => setField('socialHistory', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="nr-section">
            <div className="nr-section-head">5. Physical examination notes</div>
            <div className="nr-section-body">
              <div className="nr-field">
                <label htmlFor="nr-pe">Examination</label>
                <textarea
                  id="nr-pe"
                  placeholder="General appearance, localized findings, etc..."
                  value={form.physicalExam}
                  onChange={(e) => setField('physicalExam', e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="nr-footer">
        <div className="nr-footer-left">
          A digital solution by{' '}
          <a href={KOPANO} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
            Kopano-Vertex
          </a>
          <br />
          HMS Nurse module v2.4.1
        </div>
        <div className="nr-footer-center">
          <button type="button" className="nr-btn-link" onClick={() => window.alert('Draft saved locally (wire to API).')}>
            Save as draft
          </button>
          <button
            type="button"
            className="nr-btn-primary"
            onClick={() => window.alert('Intake marked complete — next: send to doctor queue (API).')}
          >
            Complete &amp; send to doctor ✈
          </button>
        </div>
        <div className="nr-footer-right">
          <a href={KOPANO} target="_blank" rel="noopener noreferrer">
            Website
          </a>
          <a href={`${KOPANO}#support`}>Help center</a>
        </div>
      </footer>
    </div>
  );
}
