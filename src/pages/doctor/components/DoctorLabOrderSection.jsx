import { useEffect, useMemo, useState } from 'react';
import { getLabTestCatalog } from '../../../api/lab';
import { IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function DoctorLabOrderSection({
  selectedTests,
  onToggleTest,
  labClinicalNotes,
  onLabClinicalNotesChange,
  labEmergency,
  onLabEmergencyChange,
  actionLoading,
  labError,
  hideSubmitButton = false,
}) {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    getLabTestCatalog()
      .then((data) => {
        if (!cancelled) {
          setCatalog(Array.isArray(data) ? data : []);
          setExpanded(new Set((data || []).map((g) => g.category)));
        }
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedIds = useMemo(() => new Set(selectedTests.map((t) => t.id)), [selectedTests]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((group) => ({
        ...group,
        tests: (group.tests || []).filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q) ||
            (t.sampleType || '').toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.tests.length > 0);
  }, [catalog, search]);

  function toggleCategory(category) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const hasSelection = selectedTests.length > 0;

  return (
    <section className={c.sectionPanel} aria-labelledby="doc-lab-heading">
      <h3 id="doc-lab-heading" className={c.sectionTitle}>
        Laboratory orders
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Select tests to include when you complete the consultation. Mark as emergency when urgent
        processing is required.
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          checked={labEmergency}
          onChange={(e) => onLabEmergencyChange(e.target.checked)}
        />
        Emergency patient (priority laboratory queue)
      </label>

      <div className="mt-4">
        <IntakeTextarea
          id="doc-lab-notes"
          label="Notes for laboratory"
          value={labClinicalNotes}
          onChange={(e) => onLabClinicalNotesChange(e.target.value)}
          className={c.textarea}
          rows={2}
          placeholder="Specimen details, clinical indication, fasting status…"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="doc-lab-search" className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Search tests
        </label>
        <input
          id="doc-lab-search"
          type="search"
          className={`${c.input} mt-1`}
          placeholder="Filter by test name or sample type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      {catalogLoading ? (
        <p className={`${c.hint} mt-3`}>Loading test catalog…</p>
      ) : (
        <div className="mt-3 max-h-[min(24rem,50vh)] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2">
          {filteredCatalog.length === 0 ? (
            <p className={c.hint}>No tests match your search.</p>
          ) : (
            filteredCatalog.map((group) => (
              <div key={group.category} className="rounded-lg border border-slate-200 bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold text-slate-800"
                  onClick={() => toggleCategory(group.category)}
                  aria-expanded={expanded.has(group.category)}
                >
                  {group.category}
                  <span className="text-xs font-semibold text-slate-500">
                    {expanded.has(group.category) ? '−' : '+'}
                  </span>
                </button>
                {expanded.has(group.category) ? (
                  <ul className="border-t border-slate-100 px-2 pb-2">
                    {(group.tests || []).map((test) => (
                      <li key={test.id} className="border-b border-slate-50 last:border-0">
                        <label className="flex cursor-pointer gap-2 px-2 py-2 text-sm hover:bg-slate-50">
                          <input
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                            checked={selectedIds.has(test.id)}
                            onChange={() => onToggleTest(test)}
                          />
                          <span>
                            <span className="font-medium text-slate-800">{test.name}</span>
                            {test.sampleType ? (
                              <span className="block text-xs text-slate-500">{test.sampleType}</span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}

      {hasSelection ? (
        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-800">
            Selected ({selectedTests.length})
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {selectedTests.map((t) => (
              <li
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {t.name}
                <button
                  type="button"
                  className="text-slate-400 hover:text-red-600"
                  onClick={() => onToggleTest(t)}
                  aria-label={`Remove ${t.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {labError ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {labError}
        </p>
      ) : null}

      {hasSelection && !hideSubmitButton ? (
        <button
          type="button"
          className={`${c.btnAction} ${c.btnLab} mt-4`}
          disabled={actionLoading}
          onClick={onSendToLab}
        >
          Send to laboratory
        </button>
      ) : null}
    </section>
  );
}
