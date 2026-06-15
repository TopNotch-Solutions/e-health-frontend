import { useMemo, useState } from 'react';
import { searchPatients, getPatient, getClinicalMedicalHistory } from '../../api/patients';
import LookupSearchCard from '../../pages/front_office/components/lookup/LookupSearchCard';
import { lookup } from '../../pages/front_office/styles/lookupClasses';
import { formatDob, patientName } from '../../pages/front_office/patientUtils';
import MedicalHistoryBook from './MedicalHistoryBook';
import DoctorPatientResultCard from './DoctorPatientResultCard';

function validateSearch({ searchMode, nationalId, dob, name }) {
  if (searchMode === 'id') {
    if (!nationalId.trim()) return 'Enter a national ID number.';
    return '';
  }
  if (!dob) return 'Enter date of birth.';
  if (!name.trim()) return 'Enter the patient name.';
  return '';
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DoctorPatientRecordLookup({ showStatSummaryButton = true }) {
  const [searchMode, setSearchMode] = useState('id');
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState('');

  const phase = useMemo(() => {
    if (selectedPatientId) return 'book';
    if (hasSearched && results.length > 1) return 'select';
    return 'search';
  }, [selectedPatientId, hasSearched, results.length]);

  function handleSearchModeChange(mode) {
    setSearchMode(mode);
    setSearchError('');
  }

  async function handleSearch(e) {
    e.preventDefault();
    const validationError = validateSearch({ searchMode, nationalId, dob, name });
    if (validationError) {
      setSearchError(validationError);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setResults([]);
    setSelectedPatientId(null);
    setPatient(null);
    setHistory(null);
    setHasSearched(true);

    const params =
      searchMode === 'id'
        ? { id_number: nationalId.trim() }
        : { date_of_birth: dob, name: name.trim() };

    try {
      const data = await searchPatients(params);
      const list = data.patients || [];
      setResults(list);
      if (list.length === 0) {
        setSearchError('No patients matched your search. Check the ID or name and try again.');
      } else if (list.length === 1) {
        await openPatientRecord(list[0]);
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  }

  async function openPatientRecord(p) {
    const id = p.id;
    setSelectedPatientId(id);
    setRecordLoading(true);
    setRecordError('');
    setPatient(null);
    setHistory(null);

    try {
      const [patientRow, historyRow] = await Promise.all([
        getPatient(id),
        getClinicalMedicalHistory(id),
      ]);
      setPatient(patientRow);
      setHistory(historyRow);
    } catch (err) {
      setRecordError(err.message || 'Failed to load patient record.');
      setSelectedPatientId(null);
    } finally {
      setRecordLoading(false);
    }
  }

  function handleBackFromBook() {
    if (results.length > 1) {
      setSelectedPatientId(null);
      setPatient(null);
      setHistory(null);
      setRecordError('');
      return;
    }
    handleBackToSearch();
  }

  function handleBackToSearch() {
    setResults([]);
    setSearchError('');
    setHasSearched(false);
    setSelectedPatientId(null);
    setPatient(null);
    setHistory(null);
    setRecordError('');
  }

  if (phase === 'book') {
    return (
      <div className={`${lookup.page} max-w-6xl`}>
        <header className={lookup.hero}>
          <div className={lookup.heroInner}>
            <button
              type="button"
              className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={handleBackFromBook}
            >
              <BackIcon />
              {results.length > 1 ? 'Back to patient list' : 'Back to search'}
            </button>
            <p className={lookup.heroKicker}>Clinical records</p>
            <h1 className={lookup.heroTitle}>Medical history book</h1>
            <p className={lookup.heroMeta}>
              {patient ? (
                <>
                  <span className="font-semibold text-white">{patientName(patient)}</span>
                  {' · '}
                  <span className="font-mono">{patient.patient_number}</span>
                  {patient.date_of_birth ? ` · DOB ${formatDob(patient.date_of_birth)}` : ''}
                </>
              ) : (
                'Loading patient record…'
              )}
            </p>
          </div>
        </header>

        <MedicalHistoryBook
          patient={patient}
          history={history}
          loading={recordLoading}
          error={recordError}
          showStatSummaryButton={showStatSummaryButton}
          interactive
        />
      </div>
    );
  }

  if (phase === 'select') {
    return (
      <div className={`${lookup.page} max-w-5xl`}>
        <header className={lookup.hero}>
          <div className={lookup.heroInner}>
            <button
              type="button"
              className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={handleBackToSearch}
            >
              <BackIcon />
              Back to search
            </button>
            <p className={lookup.heroKicker}>Clinical records</p>
            <h1 className={lookup.heroTitle}>Select patient</h1>
            <p className={lookup.heroMeta}>
              {results.length} matches found — choose a patient to open their medical history book.
            </p>
          </div>
        </header>

        <section className={lookup.resultsPanel} aria-labelledby="doctor-record-results-title">
          <header className={lookup.resultsHead}>
            <div>
              <h2 id="doctor-record-results-title" className={lookup.resultsTitle}>
                Matching patients
              </h2>
              <p className={lookup.resultsSubtitle}>
                Tap a card to open their vitals medical history book.
              </p>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {results.map((p) => (
              <DoctorPatientResultCard
                key={p.id}
                patient={p}
                selected={false}
                loading={recordLoading}
                onOpen={openPatientRecord}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`${lookup.page} max-w-5xl`}>
      <header className={lookup.hero}>
        <div className={lookup.heroInner}>
          <p className={lookup.heroKicker}>Clinical records</p>
          <h1 className={lookup.heroTitle}>Patient record search</h1>
          <p className={lookup.heroMeta}>
            Search any patient in your facility to open their captured vitals medical history book.
          </p>
        </div>
      </header>

      <LookupSearchCard
        searchMode={searchMode}
        onSearchModeChange={handleSearchModeChange}
        nationalId={nationalId}
        onNationalIdChange={setNationalId}
        dob={dob}
        onDobChange={setDob}
        name={name}
        onNameChange={setName}
        onSubmit={handleSearch}
        loading={searchLoading}
      />

      {searchError ? (
        <p
          className="mx-auto mt-4 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {searchError}
        </p>
      ) : null}
    </div>
  );
}
