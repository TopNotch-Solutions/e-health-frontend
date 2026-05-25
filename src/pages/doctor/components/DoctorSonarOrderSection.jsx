import { useEffect, useMemo, useState } from 'react';
import { getSonarScanCatalog } from '../../../api/sonar';
import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function DoctorSonarOrderSection({
  selectedScan,
  onSelectScan,
  symptoms,
  onSymptomsChange,
  diagnosticQuestions,
  onDiagnosticQuestionsChange,
  prepInstructions,
  onPrepInstructionsChange,
  sonarEmergency,
  onSonarEmergencyChange,
  actionLoading,
  onSendToSonar,
  sonarError,
}) {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSonarScanCatalog()
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((cat) => ({
        ...cat,
        scans: (cat.scans || []).filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (cat.category || '').toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.scans.length > 0);
  }, [catalog, search]);

  function handlePick(scan) {
    onSelectScan(scan);
    if (!prepInstructions?.trim() && scan.prepInstructions) {
      onPrepInstructionsChange(scan.prepInstructions);
    }
  }

  return (
    <section className={c.sectionPanel} aria-labelledby="doc-sonar-heading">
      <h3 id="doc-sonar-heading" className={c.sectionTitle}>
        Ultrasound (sonar) referral
      </h3>
      <p className="mt-1 text-xs text-slate-600">
        Document symptoms and the diagnostic questions for the imaging team. The patient will
        follow preparation instructions, then receive a formal report returned to you for
        follow-up.
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-violet-600"
          checked={sonarEmergency}
          onChange={(e) => onSonarEmergencyChange(e.target.checked)}
        />
        Emergency imaging (priority sonar queue)
      </label>

      <div className="mt-4">
        <IntakeTextarea
          id="doc-sonar-symptoms"
          label="Patient symptoms & clinical suspicion"
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          rows={3}
          placeholder="e.g. RUQ pain, fever, rule out cholecystitis"
        />
      </div>

      <div className="mt-3">
        <IntakeTextarea
          id="doc-sonar-questions"
          label="Diagnostic questions for sonographer / radiologist"
          value={diagnosticQuestions}
          onChange={(e) => onDiagnosticQuestionsChange(e.target.value)}
          rows={3}
          placeholder="e.g. Gallstones? Wall thickening? Free fluid?"
        />
      </div>

      <div className="mt-3">
        <IntakeTextarea
          id="doc-sonar-prep"
          label="Preparation instructions for patient"
          value={prepInstructions}
          onChange={(e) => onPrepInstructionsChange(e.target.value)}
          rows={2}
          placeholder="Auto-filled when you select a scan type"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="doc-sonar-search" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Scan type
        </label>
        <input
          id="doc-sonar-search"
          type="search"
          className={`${c.input} mt-1`}
          placeholder="Search ultrasound studies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {catalogLoading ? (
        <p className={`${c.hint} mt-3`}>Loading scan catalog…</p>
      ) : (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 p-2">
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-xs text-slate-500">No scans match your search.</p>
          ) : (
            filtered.map((cat) => (
              <div key={cat.category} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
                  {cat.category}
                </p>
                <ul>
                  {(cat.scans || []).map((scan) => (
                    <li key={scan.id}>
                      <button
                        type="button"
                        className={`w-full rounded-md px-2 py-2 text-left text-sm transition ${
                          selectedScan?.id === scan.id
                            ? 'bg-violet-100 font-semibold text-violet-900'
                            : 'hover:bg-white text-slate-800'
                        }`}
                        onClick={() => handlePick(scan)}
                      >
                        {scan.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {selectedScan ? (
        <p className="mt-2 text-xs font-semibold text-violet-800">
          Selected: {selectedScan.name}
        </p>
      ) : null}

      {sonarError ? (
        <p className={`${c.submitError} mt-3`} role="alert">
          {sonarError}
        </p>
      ) : null}

      <button
        type="button"
        className={`${c.btnAction} ${c.btnSonar} mt-4`}
        disabled={actionLoading || !selectedScan}
        onClick={onSendToSonar}
      >
        Send to ultrasound (sonar)
      </button>
    </section>
  );
}
