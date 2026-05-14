import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Stub until API search exists. Returns a patient when the query matches known demo keys.
 */
function lookupPatient(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  if (q.includes('elena') || q === 'p-1001' || q.includes('1001')) {
    return { id: 'P-1001', name: 'Elena Rodriguez', phone: '+264 61 000 0001' };
  }
  if (q.includes('marcus') || q.includes('chen')) {
    return { id: 'P-2044', name: 'Marcus Chen', phone: '+264 61 000 0002' };
  }
  if (q.includes('sarah') || q.includes('jenkins')) {
    return { id: 'P-3310', name: 'Sarah Jenkins', phone: '+264 61 000 0003' };
  }
  return null;
}

export default function FrontOfficeDashboardPage() {
  const [searchInput, setSearchInput] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const [searchMessage, setSearchMessage] = useState(null);

  function runSearch(e) {
    e.preventDefault();
    const patient = lookupPatient(searchInput);
    setFoundPatient(patient);
    setSearchMessage(
      patient ? null : searchInput.trim().length < 2
        ? 'Enter at least 2 characters to search.'
        : 'No patient found for that search. Try name, patient ID, or phone (demo: Elena, Marcus Chen, Sarah Jenkins, or P-1001).'
    );
  }

  function clearPatient() {
    setFoundPatient(null);
    setSearchMessage(null);
    setSearchInput('');
  }

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h1 className="fo-dash-title">Welcome, Front Office Team</h1>
          <p className="fo-dash-meta">
            <span>
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span>|</span>
            <span>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>
        <form className="fo-dash-search" onSubmit={runSearch}>
          <label htmlFor="fo-global-search" className="visually-hidden">
            Search patients
          </label>
          <input
            id="fo-global-search"
            name="q"
            type="search"
            placeholder="Search patient name, ID, or phone..."
            autoComplete="off"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="fo-btn fo-btn-primary" style={{ padding: '0.55rem 1rem', whiteSpace: 'nowrap' }}>
            Search
          </button>
        </form>
      </div>

      {searchMessage ? (
        <p
          role="status"
          style={{
            margin: '0 0 1rem',
            fontSize: '0.875rem',
            color: foundPatient ? '#166534' : '#b45309',
          }}
        >
          {searchMessage}
        </p>
      ) : null}

      <div className="fo-dash-grid">
        <div>
          <div className="fo-intake-grid">
            <Link to="/front_office/registration/step-1" className="fo-intake-card">
              <div className="fo-intake-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                +
              </div>
              <h3>New known patient</h3>
              <p>Register a new patient with pre-existing identification documents.</p>
            </Link>
            <Link to="/front_office/registration/step-1" className="fo-intake-card">
              <div className="fo-intake-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                *
              </div>
              <h3>Unknown patient (emergency)</h3>
              <p>Immediate triage entry for unidentified patients in critical condition.</p>
            </Link>
            <Link to="/front_office" className="fo-intake-card">
              <div className="fo-intake-icon" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                ↻
              </div>
              <h3>Returning patient</h3>
              <p>Fast-track check-in for patients previously seen within the system.</p>
            </Link>
          </div>

          <div className="fo-table-wrap">
            <div className="fo-table-head">
              <h2>Recent intake activity</h2>
              <a href="#records" style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb' }}>
                View all records
              </a>
            </div>
            <table className="fo-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>08:32</td>
                  <td>Elena Rodriguez</td>
                  <td>
                    <span className="fo-pill fo-pill-blue">Returning</span>
                  </td>
                  <td>Triage</td>
                </tr>
                <tr>
                  <td>08:28</td>
                  <td>Unknown #412</td>
                  <td>
                    <span className="fo-pill fo-pill-red">Emergency</span>
                  </td>
                  <td>Stabilization</td>
                </tr>
                <tr>
                  <td>08:15</td>
                  <td>Marcus Chen</td>
                  <td>
                    <span className="fo-pill fo-pill-gray">New</span>
                  </td>
                  <td>Registration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          {foundPatient ? (
            <div className="fo-sidebar-card">
              <h3>Selected patient</h3>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem' }}>
                <strong>{foundPatient.name}</strong>
                <br />
                <span style={{ color: '#64748b' }}>{foundPatient.id}</span>
                <br />
                <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>{foundPatient.phone}</span>
              </p>
              <button type="button" className="fo-btn fo-btn-outline" style={{ width: '100%', marginBottom: '1rem' }} onClick={clearPatient}>
                Clear selection
              </button>
              <h3 style={{ marginTop: 0 }}>Quick actions</h3>
              <div className="fo-sidebar-actions">
                <button type="button" className="fo-btn-ghost">
                  Send to pharmacy
                </button>
                <button type="button" className="fo-btn-ghost">
                  Send to nurse
                </button>
                <button type="button" className="fo-btn-ghost">
                  Print wristband
                </button>
              </div>
            </div>
          ) : null}
          <div className="fo-sidebar-card" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#1e40af',
                background: '#dbeafe',
                padding: '0.2rem 0.45rem',
                borderRadius: 4,
                marginBottom: '0.5rem',
              }}
            >
              Tip
            </span>
            <h3 style={{ marginBottom: '0.35rem' }}>Peak hours &amp; queue</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5 }}>
              At busy times, confirm the patient&apos;s mobile number and date of birth out loud before opening a file.
              Ask for photo ID and any insurance or employer letter up front so registration is not restarted at the
              counter.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
