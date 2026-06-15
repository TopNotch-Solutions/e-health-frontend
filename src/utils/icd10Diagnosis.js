/** Parse stored consultation diagnosis text into ICD-10 code + description. */
export function parseStoredDiagnosis(text) {
  if (!text || typeof text !== 'string') return { code: '', description: '' };
  const trimmed = text.trim();
  if (!trimmed) return { code: '', description: '' };

  const match = trimmed.match(/^([A-Z]\d{2}(?:\.\d+)?[A-Z0-9]*)\s*(?:[-–—]\s*(.+))?$/i);
  if (match) {
    return {
      code: match[1].toUpperCase(),
      description: (match[2] || '').trim(),
    };
  }

  return { code: '', description: trimmed };
}

/** Build diagnosis string for API persistence. */
export function formatDiagnosisForSave(code, description) {
  const c = String(code || '').trim().toUpperCase();
  const d = String(description || '').trim();
  if (!c) return '';
  return d ? `${c} — ${d}` : c;
}
