import { useEffect, useMemo, useState } from 'react';
import { getClinicDepartmentCatalog } from '../../../api/admin';
import { admin as c, FACILITY_TYPE_OPTIONS } from '../styles/adminClasses';

const EMPTY = {
  name: '',
  address: '',
  province: '',
  district: '',
  phone: '',
  type: 'hospital',
  clinic_template: 'full',
  departments: [],
  template_reason: '',
};

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export default function CreateFacilityModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState('');

  const isClinic = form.type === 'clinic';
  const isCustomTemplate = isClinic && form.clinic_template === 'custom';

  useEffect(() => {
    if (!open || !isClinic) return undefined;
    let cancelled = false;
    getClinicDepartmentCatalog()
      .then((data) => {
        if (!cancelled) {
          setCatalog(data);
          setForm((f) => ({
            ...f,
            departments: f.departments.length ? f.departments : [...(data.full_template || [])],
          }));
        }
      })
      .catch((err) => {
        if (!cancelled) setCatalogError(err.message || 'Could not load clinic departments');
      });
    return () => { cancelled = true; };
  }, [open, isClinic]);

  const foundationKeys = useMemo(
    () => new Set(catalog?.foundation_template || catalog?.minimal_template || []),
    [catalog]
  );

  const fullTemplateSet = useMemo(
    () => new Set(catalog?.full_template || []),
    [catalog]
  );

  const selectedSet = useMemo(() => new Set(form.departments), [form.departments]);

  const customDiffersFromFull = isCustomTemplate
    && catalog
    && !setsEqual(selectedSet, fullTemplateSet);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function setTemplate(template) {
    setForm((f) => ({
      ...f,
      clinic_template: template,
      departments: template === 'full'
        ? [...(catalog?.full_template || [])]
        : [...(catalog?.full_template || f.departments)],
      template_reason: '',
    }));
  }

  function toggleDepartment(key) {
    if (foundationKeys.has(key)) return;
    setForm((f) => {
      const setKeys = new Set(f.departments);
      if (setKeys.has(key)) {
        setKeys.delete(key);
        const dept = catalog?.departments?.find((d) => d.key === key);
        (dept?.removal_cascades_to || []).forEach((cascadeKey) => setKeys.delete(cascadeKey));
      } else {
        setKeys.add(key);
      }
      return { ...f, departments: [...setKeys] };
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      address: form.address,
      province: form.province,
      district: form.district,
      phone: form.phone,
      type: form.type,
    };
    if (isClinic) {
      payload.clinic_template = form.clinic_template;
      if (form.clinic_template === 'custom') {
        payload.departments = form.departments;
        if (customDiffersFromFull) {
          payload.template_reason = form.template_reason.trim();
        }
      }
    }
    await onSubmit(payload);
    setForm(EMPTY);
  };

  return (
    <div className={c.modalBackdrop} role="presentation" onClick={onClose}>
      <div
        className={`${c.modal} max-w-2xl`}
        role="dialog"
        aria-labelledby="create-facility-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-facility-title" className={c.modalTitle}>
          Create new facility
        </h2>
        <p className={c.modalSub}>Register a facility on the national network.</p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={c.label} htmlFor="fac-name">
              Facility name
            </label>
            <input id="fac-name" className={c.input} value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className={c.label} htmlFor="fac-address">
              Physical address
            </label>
            <textarea
              id="fac-address"
              className={c.input}
              rows={2}
              value={form.address}
              onChange={set('address')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="fac-province">
                Region / province
              </label>
              <input id="fac-province" className={c.input} value={form.province} onChange={set('province')} />
            </div>
            <div>
              <label className={c.label} htmlFor="fac-district">
                City / district
              </label>
              <input id="fac-district" className={c.input} value={form.district} onChange={set('district')} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={c.label} htmlFor="fac-phone">
                Contact number
              </label>
              <input id="fac-phone" className={c.input} value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={c.label} htmlFor="fac-type">
                Facility type
              </label>
              <select id="fac-type" className={c.input} value={form.type} onChange={set('type')} required>
                {FACILITY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isClinic ? (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-bold text-slate-900">Clinic department template</h3>
              <p className="mt-1 text-xs text-slate-600">
                Every clinic includes Front Office, Parameter Nurse, Screening Nurse, and Master Doctor.
                Choose the full template or remove optional departments.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { value: 'full', label: 'Full clinic (all departments)' },
                  { value: 'custom', label: 'Customize departments' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      form.clinic_template === opt.value
                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                    }`}
                    onClick={() => setTemplate(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {form.clinic_template === 'full' ? (
                <p className="mt-3 text-xs text-slate-600">
                  All clinic departments will be created, including the four foundation departments.
                </p>
              ) : null}

              {isCustomTemplate && catalog ? (
                <>
                  <p className="mt-3 text-xs font-medium text-teal-800">
                    Foundation departments cannot be removed. Removing Billing also removes Revenue Office.
                  </p>
                  <div className="mt-3 max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
                    {catalog.departments.map((dept) => {
                      const isFoundation = dept.is_foundation || foundationKeys.has(dept.key);
                      const requiresMissing = dept.requires_department
                        && !form.departments.includes(dept.requires_department);
                      const checked = form.departments.includes(dept.key);
                      const requiredLabel = requiresMissing
                        ? catalog.departments.find((d) => d.key === dept.requires_department)?.label
                        : null;
                      return (
                        <label
                          key={dept.key}
                          className={`flex items-center gap-2 text-sm ${
                            isFoundation || requiresMissing ? 'text-slate-500' : 'text-slate-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isFoundation || requiresMissing}
                            onChange={() => toggleDepartment(dept.key)}
                          />
                          <span>
                            {dept.label}
                            {isFoundation ? (
                              <span className="ml-1 text-xs font-semibold text-teal-700">(foundation)</span>
                            ) : null}
                            {requiresMissing && requiredLabel ? (
                              <span className="ml-1 text-xs text-slate-500">
                                (requires {requiredLabel})
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {isCustomTemplate && customDiffersFromFull ? (
                <div className="mt-3">
                  <label className={c.label} htmlFor="fac-template-reason">
                    Reason for removing departments *
                  </label>
                  <textarea
                    id="fac-template-reason"
                    className={c.input}
                    rows={2}
                    value={form.template_reason}
                    onChange={set('template_reason')}
                    placeholder="Explain why optional departments are being excluded"
                    required
                  />
                </div>
              ) : null}

              {catalogError ? (
                <p className="mt-2 text-sm text-amber-800" role="alert">{catalogError}</p>
              ) : null}
            </section>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={c.btnSecondary} onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={c.btnPrimary}
              disabled={
                submitting
                || (isCustomTemplate && form.departments.length === 0)
                || (isCustomTemplate && customDiffersFromFull && !form.template_reason.trim())
              }
            >
              {submitting ? 'Creating…' : 'Create facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
