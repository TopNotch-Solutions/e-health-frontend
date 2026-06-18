/** ANC form defaults and API payload builders. */

export const EMPTY_ANC_FORM = {
  baseline_obstetric: [''],
  baseline_gynae: [''],
  baseline_past_medical: [''],
  bp: '',
  pulse: '',
  temperature: '',
  saturation: '',
  weight: '',
  pallor: '',
  thyroid: '',
  breast_exam: '',
  oedema: '',
  varicose_veins: '',
  hiv_result: '',
  serology: '',
  tetanus_toxoid_immunization: '',
  chemoprophylaxis: '',
  place_of_delivery: '',
  no_further_session_required: false,
  follow_up_date: '',
};

export function normalizeBaselineList(items) {
  if (!Array.isArray(items)) {
    if (typeof items === 'string' && items.trim()) return [items.trim()];
    return [];
  }
  return items.map((entry) => String(entry || '').trim()).filter(Boolean);
}

export function buildAncSessionRequest(form, base) {
  return {
    ...base,
    baseline_obstetric: normalizeBaselineList(form.baseline_obstetric),
    baseline_gynae: normalizeBaselineList(form.baseline_gynae),
    baseline_past_medical: normalizeBaselineList(form.baseline_past_medical),
    bp: form.bp,
    pulse: form.pulse,
    temperature: form.temperature,
    saturation: form.saturation,
    weight: form.weight,
    pallor: form.pallor,
    thyroid: form.thyroid,
    breast_exam: form.breast_exam,
    oedema: form.oedema,
    varicose_veins: form.varicose_veins,
    hiv_result: form.hiv_result,
    serology: form.serology,
    tetanus_toxoid_immunization: form.tetanus_toxoid_immunization,
    chemoprophylaxis: form.chemoprophylaxis,
    place_of_delivery: form.place_of_delivery,
    no_further_session_required: form.no_further_session_required,
    follow_up_date: form.follow_up_date || null,
  };
}
