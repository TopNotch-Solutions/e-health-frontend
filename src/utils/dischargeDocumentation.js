/** Medico-legal copy and validation for ending a visit when the patient declines care. */

export const REFUSAL_DISCHARGE_DIAGNOSIS = 'Patient declined care — consultation ended without clinical diagnosis';

export const DISCHARGE_SECTION_TITLE = 'End consultation — patient declined care';

export const DISCHARGE_SECTION_DESCRIPTION =
  'Use when the patient refuses examination, treatment, or further care. '
  + 'Document what happened — this record protects you and the facility.';

export const DISCHARGE_REASON_LABEL = 'Documentation (why the consultation is ending)';

export const DISCHARGE_REASON_PLACEHOLDER =
  'e.g. Patient refused vital signs and left waiting area; '
  + 'declined examination after counselling; left against medical advice (AMA); '
  + 'refused referral to screening…';

export const DISCHARGE_BUTTON_LABEL = 'End consultation & save record';

export const DISCHARGE_CONFIRM_TITLE = 'End consultation?';

export function dischargeConfirmText(patientName) {
  return `Document that ${patientName} declined care and end this consultation? `
    + 'Your reason will be saved to the patient record for medico-legal protection.';
}

export function validateRefusalDischargeReason(dischargeReason) {
  const reason = dischargeReason?.trim();
  if (!reason) {
    return {
      discharge_reason:
        'Document why the patient is leaving — e.g. refused examination, declined treatment, or left against advice.',
    };
  }
  if (reason.length < 10) {
    return {
      discharge_reason: 'Please provide a clearer account (at least a short sentence).',
    };
  }
  return {};
}

export function resolveDischargeDiagnosisForSave(icd10Code, icd10Description, formatDiagnosisForSave) {
  if (icd10Code?.trim() && icd10Description?.trim()) {
    return formatDiagnosisForSave(icd10Code, icd10Description);
  }
  return REFUSAL_DISCHARGE_DIAGNOSIS;
}
