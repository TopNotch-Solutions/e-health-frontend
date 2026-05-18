import { lookup } from '../../styles/lookupClasses';
import { sanitizeNationalIdInput } from '../../utils/validation';

const SEARCH_MODES = [
  { id: 'id', label: 'National ID' },
  { id: 'dob', label: 'DOB' },
];

export default function LookupSearchCard({
  searchMode,
  onSearchModeChange,
  nationalId,
  onNationalIdChange,
  dob,
  onDobChange,
  name,
  onNameChange,
  onSubmit,
  loading,
}) {
  function handleNationalIdChange(e) {
    onNationalIdChange(sanitizeNationalIdInput(e.target.value));
  }

  return (
    <section className={lookup.searchWrap} aria-labelledby="lookup-search-title">
      <div className={lookup.searchCard}>
        <h2 id="lookup-search-title" className={lookup.searchTitle}>
          Search patient
        </h2>
        <p className={lookup.searchSubtitle}>
          Use an 11-digit National ID, or date of birth with the patient&apos;s full legal name.
        </p>

        <div className={lookup.toggleGroup} role="tablist" aria-label="Search method">
          {SEARCH_MODES.map(({ id, label }) => {
            const active = searchMode === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? lookup.toggleActive : lookup.toggleInactive}
                onClick={() => onSearchModeChange(id)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {searchMode === 'id' ? (
            <div className={lookup.field}>
              <label htmlFor="fo-national-id" className={lookup.label}>
                National ID number
              </label>
              <input
                id="fo-national-id"
                className={lookup.input}
                value={nationalId}
                onChange={handleNationalIdChange}
                placeholder="11-digit ID"
                inputMode="numeric"
                pattern="\d{11}"
                maxLength={11}
                autoComplete="off"
              />
            </div>
          ) : (
            <>
              <div className={lookup.field}>
                <label htmlFor="fo-dob" className={lookup.label}>
                  Date of birth
                </label>
                <input
                  id="fo-dob"
                  type="date"
                  className={lookup.input}
                  value={dob}
                  onChange={(e) => onDobChange(e.target.value)}
                />
              </div>
              <div className={lookup.field}>
                <label htmlFor="fo-name" className={lookup.label}>
                  Full name
                </label>
                <input
                  id="fo-name"
                  className={lookup.input}
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Legal first and last name"
                />
              </div>
            </>
          )}
          <button type="submit" className={lookup.submit} disabled={loading}>
            {loading ? 'Searching…' : 'Search records'}
          </button>
        </form>
      </div>
    </section>
  );
}
