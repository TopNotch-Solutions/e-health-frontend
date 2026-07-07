import { useMemo, useState } from 'react';
import {
  downloadAdminMedicalHistoryExport,
  getAdminPatientMedicalHistory,
  searchAdminPatients,
} from '../../../api/admin';
import DoctorPatientResultCard from '../../../components/patient/DoctorPatientResultCard';
import MedicalHistoryBook from '../../../components/patient/MedicalHistoryBook';
import MaternityMedicalHistoryBook from '../../../components/patient/MaternityMedicalHistoryBook';
import MedicalCardDownloadActions from '../../../components/medical_card/MedicalCardDownloadActions';
import LookupSearchCard from '../../front_office/components/lookup/LookupSearchCard';
import { formatDob, patientName } from '../../front_office/patientUtils';
import { admin as c } from '../styles/adminClasses';

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All records' },
  { value: 'clinic', label: 'Clinic (all departments)' },
  { value: 'maternity', label: 'Maternity only' },
];

function validateSearch({ searchMode, nationalId, dob, name }) {
  if (searchMode === 'id') {
    if (!nationalId.trim()) return 'Enter a national ID number.';
    return '';
  }
  if (!dob) return 'Enter date of birth.';
  if (!name.trim()) return 'Enter the patient name.';
  return '';
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function VisitAttendeeTable({ visits }) {
  return (
    <div className={c.tableWrap}>
      <table className={c.table}>
        <thead>
          <tr>
            <th className={c.th}>Facility</th>
            <th className={c.th}>Visit</th>
            <th className={c.th}>Department</th>
            <th className={c.th}>Arrived</th>
            <th className={c.th}>Completed</th>
            <th className={c.th}>Attended by</th>
            <th className={c.th}>Routed by</th>
          </tr>
        </thead>
        <tbody>
          {visits.flatMap((visit) => {
            const stops = visit.stops || [];
            if (!stops.length) {
              return [(
                <tr key={visit.id} className="border-t-2 border-white/20">
                  <td className={c.tdMuted}>{visit.facility_name || '—'}</td>
                  <td className={c.td}>
                    <div className="font-mono text-xs font-semibold">{visit.visit_number || '—'}</div>
                    {visit.created_at ? (
                      <div className="mt-0.5 text-[0.65rem] text-emerald-100/80">
                        {formatDateTime(visit.created_at)}
                      </div>
                    ) : null}
                  </td>
                  <td className={c.tdMuted} colSpan={5}>
                    No clinical stops recorded
                  </td>
                </tr>
              )];
            }

            return stops.map((stop, idx) => (
              <tr
                key={`${visit.id}-${stop.department}-${idx}`}
                className={idx === 0 ? 'border-t-2 border-white/20' : ''}
              >
                {idx === 0 ? (
                  <>
                    <td className={`${c.tdMuted} align-top`} rowSpan={stops.length}>
                      {visit.facility_name || '—'}
                    </td>
                    <td className={`${c.td} align-top`} rowSpan={stops.length}>
                      <div className="font-mono text-xs font-semibold">{visit.visit_number || '—'}</div>
                      {visit.created_at ? (
                        <div className="mt-0.5 text-[0.65rem] text-emerald-100/80">
                          {formatDateTime(visit.created_at)}
                        </div>
                      ) : null}
                      {visit.visit_type ? (
                        <div className="mt-0.5 text-[0.65rem] capitalize text-emerald-100/80">
                          {visit.visit_type.replace(/_/g, ' ')}
                        </div>
                      ) : null}
                    </td>
                  </>
                ) : null}
                <td className={c.td}>{stop.department_label || stop.department}</td>
                <td className={c.tdMuted}>{formatDateTime(stop.arrived_at)}</td>
                <td className={c.tdMuted}>{formatDateTime(stop.completed_at)}</td>
                <td className={c.td}>{stop.attendees || stop.assigned_to_name || '—'}</td>
                <td className={c.tdMuted}>{stop.routed_by || '—'}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function PatientRecordsView() {
  const [scope, setScope] = useState('all');
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
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const phase = useMemo(() => {
    if (selectedPatientId) return 'record';
    if (hasSearched && results.length > 1) return 'select';
    return 'search';
  }, [selectedPatientId, hasSearched, results.length]);

  async function loadPatientRecord(patientId, scopeValue = scope) {
    setSelectedPatientId(patientId);
    setRecordLoading(true);
    setRecordError('');
    setExportError('');
    setPatient(null);
    setHistory(null);

    try {
      const data = await getAdminPatientMedicalHistory(patientId, { scope: scopeValue });
      setPatient(data.patient);
      setHistory(data.history);
    } catch (err) {
      setRecordError(err.message || 'Failed to load patient record.');
      setSelectedPatientId(null);
    } finally {
      setRecordLoading(false);
    }
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
      const data = await searchAdminPatients(params);
      const list = data.patients || [];
      setResults(list);
      if (list.length === 0) {
        setSearchError('No patients matched your search.');
      } else if (list.length === 1 && list[0]?.id) {
        await loadPatientRecord(list[0].id);
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleScopeChange(nextScope) {
    setScope(nextScope);
    if (selectedPatientId) {
      await loadPatientRecord(selectedPatientId, nextScope);
    }
  }

  async function handleExport() {
    if (!selectedPatientId) return;
    setExporting(true);
    setExportError('');
    try {
      const { blob, filename } = await downloadAdminMedicalHistoryExport(selectedPatientId, { scope });
      triggerDownload(blob, filename);
    } catch (err) {
      setExportError(err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  }

  function handleBackToSearch() {
    setResults([]);
    setSearchError('');
    setHasSearched(false);
    setSelectedPatientId(null);
    setPatient(null);
    setHistory(null);
    setRecordError('');
    setExportError('');
  }

  function handleBackFromRecord() {
    if (results.length > 1) {
      setSelectedPatientId(null);
      setPatient(null);
      setHistory(null);
      setRecordError('');
      setExportError('');
      return;
    }
    handleBackToSearch();
  }

  return (
    <div>
      <div className={c.panelHeader}>
        <div>
          <h2 className={c.sectionTitle}>Patient records</h2>
          <p className={c.sectionDesc}>
            Search patients nationally across all facilities, view clinic or maternity history,
            and download the medical card as Excel with visit dates and staff who attended.
          </p>
        </div>
      </div>

      {phase === 'search' ? (
        <>
          <LookupSearchCard
            searchMode={searchMode}
            onSearchModeChange={(mode) => {
              setSearchMode(mode);
              setSearchError('');
            }}
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
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {searchError}
            </p>
          ) : null}
        </>
      ) : null}

      {phase === 'select' ? (
        <div className={`${c.sectionPanel} mt-4`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className={c.cardTitle}>Matching patients</h3>
              <p className={c.cardDesc}>{results.length} matches — select a patient to open records.</p>
            </div>
            <button type="button" className={c.btnSecondary} onClick={handleBackToSearch}>
              Back to search
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((p) => (
              <DoctorPatientResultCard
                key={p.id}
                patient={p}
                selected={false}
                loading={recordLoading}
                onOpen={(row) => loadPatientRecord(row.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {phase === 'record' ? (
        <div className="mt-4 space-y-4">
          <div className={`${c.sectionPanel} flex flex-wrap items-start justify-between gap-3`}>
            <div>
              <button type="button" className={`${c.btnSecondary} mb-3`} onClick={handleBackFromRecord}>
                ← {results.length > 1 ? 'Back to patient list' : 'Back to search'}
              </button>
              <h3 className={c.cardTitle}>
                {patient ? patientName(patient) : 'Loading…'}
              </h3>
              <p className={`${c.cardDesc} mt-1`}>
                {patient?.patient_number ? (
                  <span className="font-mono">{patient.patient_number}</span>
                ) : null}
                {patient?.date_of_birth ? ` · DOB ${formatDob(patient.date_of_birth)}` : ''}
                {' · All facilities'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {patient?.id ? (
                <MedicalCardDownloadActions patientId={patient.id} admin />
              ) : null}
              <button
                type="button"
                className={c.btnPrimary}
                onClick={handleExport}
                disabled={exporting || recordLoading || !history}
              >
                {exporting ? 'Preparing Excel…' : 'Download medical card (XLSX)'}
              </button>
            </div>
          </div>

          <div className={`${c.sectionPanel} flex flex-wrap gap-2`}>
            {SCOPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={scope === option.value ? c.btnPrimary : c.btnSecondary}
                onClick={() => handleScopeChange(option.value)}
                disabled={recordLoading}
              >
                {option.label}
              </button>
            ))}
          </div>

          {exportError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {exportError}
            </p>
          ) : null}

          {scope === 'maternity' ? (
            <MaternityMedicalHistoryBook
              patient={patient}
              history={history}
              loading={recordLoading}
              error={recordError}
              compact
            />
          ) : (
            <MedicalHistoryBook
              patient={patient}
              history={history}
              loading={recordLoading}
              error={recordError}
              compact
              medicalCardAdmin
              showMedicalCardDownload={false}
              bookLabel="Patient medical history book"
              emptyMessage="No visits on file for this patient."
            />
          )}

          {history?.visits?.length && !recordLoading ? (
            <VisitAttendeeTable visits={history.visits} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
