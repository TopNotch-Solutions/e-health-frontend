import { useEffect, useRef, useState } from 'react';
import { searchIcd10Codes } from '../../../api/icd10';
import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';

export default function ClinicDiagnosisSection({
  icd10Code,
  icd10Description,
  notes,
  fieldErrors,
  onIcd10Select,
  onNotesChange,
}) {
  const [query, setQuery] = useState(icd10Code || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setQuery(icd10Code || '');
  }, [icd10Code]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 1) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);
    setSearchError('');
    const timer = setTimeout(() => {
      searchIcd10Codes(q, { limit: 20 })
        .then((rows) => {
          if (!cancelled) setResults(Array.isArray(rows) ? rows : []);
        })
        .catch((err) => {
          if (!cancelled) {
            setResults([]);
            setSearchError(err.message || 'Could not search ICD-10 codes.');
          }
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function handleSelect(row) {
    onIcd10Select({ code: row.code, description: row.description });
    setQuery(row.code);
    setOpen(false);
    setResults([]);
  }

  function handleQueryChange(value) {
    setQuery(value);
    setOpen(true);
    if (!value.trim()) {
      onIcd10Select({ code: '', description: '' });
    } else if (value.trim().toUpperCase() !== icd10Code) {
      onIcd10Select({ code: '', description: '' });
    }
  }

  return (
    <section className={c.sectionPanel} aria-labelledby="cd-diagnosis-heading">
      <h3 id="cd-diagnosis-heading" className={c.sectionTitle}>
        Doctor diagnosis
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Select an ICD-10 code from the catalog before any disposition or routing actions are unlocked.
      </p>
      <div className="mt-4 space-y-4">
        <div ref={wrapRef} className="relative">
          <IntakeInput
            id="cd-icd10-code"
            label="Clinical diagnosis (ICD-10 code)"
            required
            error={fieldErrors.icd10Code}
            className={c.input}
            placeholder="Search by code or description, e.g. M54.5 or back pain"
            value={query}
            autoComplete="off"
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-autocomplete="list"
            aria-expanded={open && results.length > 0}
            aria-controls="cd-icd10-results"
          />
          {open && query.trim() ? (
            <div
              id="cd-icd10-results"
              role="listbox"
              className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
            >
              {searching ? (
                <p className="px-3 py-2 text-xs text-slate-500">Searching ICD-10 codes…</p>
              ) : searchError ? (
                <p className="px-3 py-2 text-xs text-red-600" role="alert">{searchError}</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-500">No matching ICD-10 codes.</p>
              ) : (
                results.map((row) => (
                  <button
                    key={row.code}
                    type="button"
                    role="option"
                    aria-selected={row.code === icd10Code}
                    className="flex w-full flex-col gap-0.5 border-b border-slate-100 px-3 py-2 text-left text-sm transition last:border-0 hover:bg-teal-50"
                    onClick={() => handleSelect(row)}
                  >
                    <span className="font-mono font-semibold text-teal-900">{row.code}</span>
                    <span className="text-xs text-slate-600">{row.description}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <IntakeTextarea
          id="cd-icd10-description"
          label="ICD-10 description"
          required={false}
          showRequiredMark={false}
          readOnly
          className={c.textarea}
          rows={2}
          placeholder="Description appears when you select a code from the list above."
          value={icd10Description}
        />

        <IntakeTextarea
          id="cd-notes"
          label="Consultation notes (optional)"
          required={false}
          showRequiredMark={false}
          className={c.textarea}
          rows={2}
          placeholder="Additional notes for the record…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </section>
  );
}
