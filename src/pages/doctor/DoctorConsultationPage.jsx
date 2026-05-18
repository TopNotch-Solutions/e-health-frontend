import { useEffect, useMemo, useState } from 'react';

const KOPANO = 'https://kopanovertex.com/';

const DOCTOR_QUEUE = [
  {
    id: 'q1',
    name: 'Johnathan Doe',
    kind: 'priority',
    level: 1,
    waitText: '5m wait',
    reason: 'Chest Pain, Shortness of Breath.',
  },
  {
    id: 'q2',
    name: 'Elena Rodriguez',
    kind: 'priority',
    level: 2,
    waitText: '14m wait',
    reason: null,
  },
  {
    id: 'q3',
    name: 'Marcus Whitmore',
    kind: 'session',
    waitText: '12m elapsed',
    reason: null,
  },
  {
    id: 'q4',
    name: 'Sarah McAllister',
    kind: 'priority',
    level: 3,
    waitText: '42m wait',
    reason: null,
  },
  { id: 'q5', name: 'James Nujoma', kind: 'priority', level: 2, waitText: '8m wait', reason: null },
  { id: 'q6', name: 'Helena Shilongo', kind: 'priority', level: 1, waitText: '3m wait', reason: 'Post-operative fever' },
  { id: 'q7', name: 'Paul Hamutenya', kind: 'priority', level: 3, waitText: '22m wait', reason: null },
  { id: 'q8', name: 'Anna Iipinge', kind: 'priority', level: 2, waitText: '11m wait', reason: null },
  { id: 'q9', name: 'David Amadhila', kind: 'priority', level: 3, waitText: '35m wait', reason: null },
  { id: 'q10', name: 'Rachel Muukwanee', kind: 'priority', level: 2, waitText: '18m wait', reason: null },
  { id: 'q11', name: 'Simon Kavezembi', kind: 'priority', level: 3, waitText: '28m wait', reason: null },
  { id: 'q12', name: 'Grace Shihepo', kind: 'priority', level: 2, waitText: '16m wait', reason: null },
];

const ICD_PRESETS = [
  { code: 'M54.5', label: 'Low back pain' },
  { code: 'M51.26', label: 'Sciatica' },
  { code: 'I10', label: 'Essential hypertension' },
  { code: 'E11.9', label: 'Type 2 diabetes mellitus' },
  { code: 'J06.9', label: 'Acute upper respiratory infection' },
];

const DEFAULT_VISIT = {
  sex: '—',
  age: '—',
  dob: '—',
  bmi: '—',
  allergy: null,
  nurseHandover: 'No handover note on file for this visit.',
  vitals: { bpm: '—', bpSys: '—', bpDia: '—', temp: '—', spo2: '—' },
  physicalExam: {
    headNeck: '',
    chest: '',
    abdomen: '',
    neuro: '',
  },
  clinicalNotesPlaceholder: 'Detail the treatment plan, counseling provided, and clinical reasoning…',
};

const VISIT_BY_ID = {
  q3: {
    sex: 'M',
    age: 45,
    dob: '12/05/1978',
    bmi: 24.2,
    allergy: 'PENICILLIN',
    nurseHandover:
      'Patient reports persistent lower back pain radiating to the left leg for 3 weeks; no fever; ambulatory with mild discomfort.',
    vitals: { bpm: 78, bpSys: 124, bpDia: 82, temp: '36.8°C', spo2: '98%' },
    physicalExam: {
      headNeck: '',
      chest: 'Normal heart sounds, lungs clear on auscultation.',
      abdomen: '',
      neuro: 'Positive straight leg raise on left side; otherwise neurologically intact.',
    },
    clinicalNotesPlaceholder: 'Detail the treatment plan, counseling provided, and clinical reasoning…',
    defaultDiagnoses: [
      { code: 'M54.5', label: 'Low back pain' },
      { code: 'M51.26', label: 'Sciatica' },
    ],
  },
  q1: {
    sex: 'M',
    age: 62,
    dob: '03/11/1963',
    bmi: 27.1,
    allergy: 'SULFA DRUGS',
    nurseHandover: 'Substernal chest pressure since this morning, diaphoretic on arrival; ECG pending review.',
    vitals: { bpm: 96, bpSys: 148, bpDia: 92, temp: '36.9°C', spo2: '94%' },
    physicalExam: {
      headNeck: 'JVP not elevated.',
      chest: 'Regular rhythm; faint bibasilar crackles.',
      abdomen: 'Soft, non-tender.',
      neuro: 'Alert and oriented ×3.',
    },
    defaultDiagnoses: [{ code: 'R07.9', label: 'Chest pain, unspecified' }],
  },
};

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

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 10v9M3 10h18v9M3 19h18M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
    </svg>
  );
}

function ReferIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 7l3 3-3 3M4 20v-2a4 4 0 0 1 4-4h12" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
    </svg>
  );
}

function mergeVisit(queueId) {
  const v = VISIT_BY_ID[queueId];
  if (!v) {
    return {
      ...DEFAULT_VISIT,
      physicalExam: { ...DEFAULT_VISIT.physicalExam },
      defaultDiagnoses: [],
    };
  }
  return {
    ...DEFAULT_VISIT,
    ...v,
    vitals: { ...DEFAULT_VISIT.vitals, ...v.vitals },
    physicalExam: { ...DEFAULT_VISIT.physicalExam, ...v.physicalExam },
    defaultDiagnoses: v.defaultDiagnoses ? [...v.defaultDiagnoses] : [],
  };
}

export default function DoctorConsultationPage() {
  const [globalSearch, setGlobalSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState('');
  const [selectedId, setSelectedId] = useState('q3');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Jenkins');
  const [doctorTitle, setDoctorTitle] = useState('Physician');

  const [physical, setPhysical] = useState(() => mergeVisit('q3').physicalExam);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnoses, setDiagnoses] = useState(() => mergeVisit('q3').defaultDiagnoses);
  const [icdInput, setIcdInput] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      if (name) setDoctorName(name.startsWith('Dr') ? name : `Dr. ${name}`);
      if (u.role_display) setDoctorTitle(u.role_display);
    } catch {
      /* ignore */
    }
  }, []);

  const visit = useMemo(() => mergeVisit(selectedId), [selectedId]);

  useEffect(() => {
    const v = mergeVisit(selectedId);
    setPhysical({ ...v.physicalExam });
    setClinicalNotes('');
    setDiagnoses([...v.defaultDiagnoses]);
    setIcdInput('');
  }, [selectedId]);

  const filteredQueue = useMemo(() => {
    const q = queueFilter.trim().toLowerCase();
    if (!q) return DOCTOR_QUEUE;
    return DOCTOR_QUEUE.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [queueFilter]);

  const initials = useMemo(() => {
    const parts = doctorName.replace(/^Dr\.?\s*/i, '').split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || 'D';
    const b = parts[1]?.[0] || '';
    return (a + b).toUpperCase();
  }, [doctorName]);

  function setPe(key, value) {
    setPhysical((prev) => ({ ...prev, [key]: value }));
  }

  function tryAddIcd() {
    const raw = icdInput.trim();
    if (!raw) return;
    const fromPreset = ICD_PRESETS.find(
      (p) =>
        raw.toLowerCase() === p.code.toLowerCase() ||
        raw.toLowerCase() === `${p.code} - ${p.label}`.toLowerCase() ||
        p.label.toLowerCase().includes(raw.toLowerCase())
    );
    if (fromPreset) {
      if (!diagnoses.some((d) => d.code === fromPreset.code)) {
        setDiagnoses((d) => [...d, fromPreset]);
      }
      setIcdInput('');
      return;
    }
    const m = raw.match(/^([A-Z]\d{2}(?:\.\d+)?)\s*[-–]\s*(.+)$/i);
    if (m) {
      const code = m[1].toUpperCase();
      const label = m[2].trim();
      if (!diagnoses.some((d) => d.code === code)) setDiagnoses((d) => [...d, { code, label }]);
      setIcdInput('');
    }
  }

  function removeDiagnosis(code) {
    setDiagnoses((d) => d.filter((x) => x.code !== code));
  }

  function callNextPatient() {
    const next = DOCTOR_QUEUE.find((p) => p.kind !== 'session' && p.id !== selectedId);
    if (next) setSelectedId(next.id);
    else window.alert('No other patients in queue (demo data).');
  }

  function queueBadgeLabel() {
    return DOCTOR_QUEUE.filter((p) => p.kind !== 'session').length;
  }

  function priorityClass(entry) {
    if (entry.kind === 'session') return 'doc-priority-session';
    if (entry.level === 1) return 'doc-priority-1';
    if (entry.level === 2) return 'doc-priority-2';
    return 'doc-priority-3';
  }

  function priorityLabel(entry) {
    if (entry.kind === 'session') return 'In session';
    return `Priority ${entry.level}`;
  }

  const vitals = visit.vitals;

  return (
    <div className="doc-app">
      <header className="doc-topbar">
        <div className="doc-brand">
          <BuildingIcon />
          <span>Health Management System</span>
        </div>
        <div className="doc-topbar-right">
          <div className="doc-search">
            <label htmlFor="doc-global-search" className="visually-hidden">
              Global search
            </label>
            <input
              id="doc-global-search"
              type="search"
              placeholder="Global Search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="doc-user">
            <div className="doc-user-avatar" aria-hidden>
              {initials}
            </div>
            <div className="doc-user-text">
              <span className="doc-user-name">{doctorName}</span>
              <span className="doc-user-title">{doctorTitle}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="doc-body">
        <aside className="doc-queue" aria-label="Doctor queue">
          <div className="doc-queue-head">
            <h2 className="doc-queue-title">Doctor&apos;s Queue</h2>
            <span className="doc-queue-badge">{queueBadgeLabel()}</span>
          </div>
          <div className="doc-search" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="doc-queue-filter" className="visually-hidden">
              Filter queue
            </label>
            <input
              id="doc-queue-filter"
              type="search"
              placeholder="Filter patients…"
              value={queueFilter}
              onChange={(e) => setQueueFilter(e.target.value)}
            />
          </div>
          <div className="doc-queue-list">
            {filteredQueue.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`doc-queue-card ${p.id === selectedId ? 'doc-queue-card-active' : ''}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="doc-queue-meta">
                  <span className={`doc-priority ${priorityClass(p)}`}>{priorityLabel(p)}</span>
                  <span className="doc-queue-wait">{p.waitText}</span>
                </div>
                <p className="doc-queue-name">{p.name}</p>
                {p.reason ? <p className="doc-queue-reason">{p.reason}</p> : null}
              </button>
            ))}
          </div>
          {filteredQueue.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>No patients match your filter.</p>
          ) : null}
          <button type="button" className="doc-call-next" onClick={callNextPatient}>
            <PlayIcon />
            Call Next Patient
          </button>
        </aside>

        <main className="doc-main">
          <div className="doc-card">
            <div className="doc-card-body">
              <div className="doc-patient-header">
                <div className="doc-patient-photo" aria-hidden />
                <div>
                  <div className="doc-patient-top">
                    <div>
                      <h1 className="doc-patient-name">{DOCTOR_QUEUE.find((x) => x.id === selectedId)?.name || 'Patient'}</h1>
                      <p className="doc-patient-meta">
                        {visit.sex}, {visit.age}y · DOB {visit.dob}
                        {visit.bmi !== '—' && visit.bmi != null && visit.bmi !== '' ? ` · BMI ${visit.bmi}` : ''}
                      </p>
                      {visit.allergy ? <div className="doc-allergy-tag">ALLERGY: {visit.allergy}</div> : null}
                    </div>
                    <div className="doc-header-actions">
                      <button type="button" className="doc-btn doc-btn-primary" onClick={() => window.alert('Open full record (wire to API).')}>
                        View Full Record
                      </button>
                      <button type="button" className="doc-btn doc-btn-muted" onClick={() => window.alert('Patient summary (wire to API).')}>
                        Patient Summary
                      </button>
                    </div>
                  </div>
                  <blockquote className="doc-handover">{visit.nurseHandover}</blockquote>
                  <div className="doc-vitals">
                    <div className="doc-vital">
                      <span className="doc-vital-label">BPM</span>
                      <span className="doc-vital-value">{vitals.bpm}</span>
                    </div>
                    <div className="doc-vital">
                      <span className="doc-vital-label">BP</span>
                      <span className="doc-vital-value">
                        {vitals.bpSys}/{vitals.bpDia}
                      </span>
                    </div>
                    <div className="doc-vital">
                      <span className="doc-vital-label">TEMP</span>
                      <span className="doc-vital-value">{vitals.temp}</span>
                    </div>
                    <div className="doc-vital">
                      <span className="doc-vital-label">SpO2</span>
                      <span className="doc-vital-value">{vitals.spo2}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="doc-card">
            <div className="doc-card-head">Physical examination</div>
            <div className="doc-card-body">
              <div className="doc-exam-grid">
                <div className="doc-field">
                  <label htmlFor="doc-pe-head">Head &amp; neck</label>
                  <textarea
                    id="doc-pe-head"
                    placeholder="Findings…"
                    value={physical.headNeck}
                    onChange={(e) => setPe('headNeck', e.target.value)}
                  />
                </div>
                <div className="doc-field">
                  <label htmlFor="doc-pe-chest">Chest / cardiovascular</label>
                  <textarea
                    id="doc-pe-chest"
                    placeholder="Findings…"
                    value={physical.chest}
                    onChange={(e) => setPe('chest', e.target.value)}
                  />
                </div>
                <div className="doc-field">
                  <label htmlFor="doc-pe-abd">Abdomen</label>
                  <textarea
                    id="doc-pe-abd"
                    placeholder="Findings…"
                    value={physical.abdomen}
                    onChange={(e) => setPe('abdomen', e.target.value)}
                  />
                </div>
                <div className="doc-field">
                  <label htmlFor="doc-pe-neuro">Neurological / musculoskeletal</label>
                  <textarea
                    id="doc-pe-neuro"
                    placeholder="Findings…"
                    value={physical.neuro}
                    onChange={(e) => setPe('neuro', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="doc-card">
            <div className="doc-card-head">Diagnosis / clinical impression</div>
            <div className="doc-card-body">
              <div className="doc-icd-row">
                <div className="doc-icd-search">
                  <label htmlFor="doc-icd" className="visually-hidden">
                    Search ICD-10
                  </label>
                  <input
                    id="doc-icd"
                    placeholder="Search ICD-10 codes or common names…"
                    value={icdInput}
                    onChange={(e) => setIcdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        tryAddIcd();
                      }
                    }}
                  />
                </div>
                <button type="button" className="doc-btn doc-btn-muted" onClick={tryAddIcd}>
                  Add
                </button>
              </div>
              <div className="doc-tags" aria-label="Selected diagnoses">
                {diagnoses.map((d) => (
                  <span key={d.code} className="doc-tag">
                    {d.code} — {d.label}
                    <button type="button" aria-label={`Remove ${d.code}`} onClick={() => removeDiagnosis(d.code)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="doc-notes">
                <label htmlFor="doc-clinical-notes" className="visually-hidden">
                  Clinical notes
                </label>
                <textarea
                  id="doc-clinical-notes"
                  placeholder={visit.clinicalNotesPlaceholder}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </main>

        <aside className="doc-rail" aria-label="Orders and disposition">
          <div className="doc-card">
            <div className="doc-card-head">Clinical orders</div>
            <div className="doc-card-body">
              <p className="doc-rail-section">Active</p>
              <div className="doc-order-list">
                <button type="button" className="doc-order-item" onClick={() => window.alert('Pharmacy queue (wire to API).')}>
                  <span className="doc-order-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </span>
                  <span>
                    <span className="doc-order-title">Prescriptions</span>
                    <div className="doc-order-sub">2 pending pharmacy referrals</div>
                  </span>
                </button>
                <button type="button" className="doc-order-item" onClick={() => window.alert('Imaging request (wire to API).')}>
                  <span className="doc-order-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 3h6v3H9V3zM7 6h10l1 14H6L7 6zM10 11h4" />
                    </svg>
                  </span>
                  <span>
                    <span className="doc-order-title">Lab / radiology</span>
                    <div className="doc-order-sub">Lumbosacral spine MRI requested</div>
                  </span>
                </button>
                <button type="button" className="doc-order-item" onClick={() => window.alert('Procedure orders (wire to API).')}>
                  <span className="doc-order-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </span>
                  <span>
                    <span className="doc-order-title">Procedure orders</span>
                    <div className="doc-order-sub">None scheduled for this visit</div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="doc-card">
            <div className="doc-card-head">Patient disposition</div>
            <div className="doc-card-body">
              <div className="doc-disposition">
                <button type="button" className="doc-disp-btn doc-disp-admit" onClick={() => window.alert('Admit to ward (wire to API).')}>
                  <BedIcon />
                  Admit to Ward
                </button>
                <button type="button" className="doc-disp-btn doc-disp-refer" onClick={() => window.alert('Refer to specialist (wire to API).')}>
                  <ReferIcon />
                  Refer to Specialist
                </button>
                <button
                  type="button"
                  className="doc-disp-btn doc-disp-discharge"
                  onClick={() => window.alert('Discharge & follow-up (wire to API).')}
                >
                  <ExitIcon />
                  Discharge &amp; Follow-up
                </button>
              </div>
              <div className="doc-rail-footer">
                <button type="button" className="doc-save-draft" onClick={() => window.alert('Draft saved locally (wire to API).')}>
                  Save Draft
                </button>
                <button type="button" className="doc-trash" aria-label="Discard draft" onClick={() => window.alert('Confirm discard (wire to API).')}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="doc-footer">
        A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer">
          Kopano-Vertex
        </a>{' '}
        · HMS Doctor module v2.4.0
      </footer>
    </div>
  );
}
