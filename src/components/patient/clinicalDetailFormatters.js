import { formatLabel } from '../../pages/front_office/utils/ehrUtils';

export function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

export function pushDetail(lines, label, value) {
  const text = displayValue(value);
  if (text !== '—') lines.push({ label, value: text });
}

export function formatScalarValue(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return null;
  return String(value).trim() || null;
}

/** Parse JSON column values that may arrive as objects or stringified JSON. */
export function parseJsonValue(value) {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return null;
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return JSON.parse(text);
      } catch {
        return value;
      }
    }
  }
  return value;
}

/** Flatten structured clinical objects into readable label/value lines. */
export function formatClinicalObjectLines(obj, skipKeys = [], labelPrefix = '') {
  const parsed = parseJsonValue(obj);
  if (parsed == null || parsed === '') return [];
  if (typeof parsed !== 'object') {
    const scalar = formatScalarValue(parsed) ?? parsed;
    return scalar != null && scalar !== '' ? [{ label: labelPrefix || 'Detail', value: String(scalar) }] : [];
  }

  const lines = [];
  const entries = Array.isArray(parsed)
    ? parsed.map((item, index) => [`Item ${index + 1}`, item])
    : Object.entries(parsed);

  entries.forEach(([key, value]) => {
    if (!Array.isArray(parsed) && skipKeys.includes(key)) return;
    if (value == null || value === '') return;

    const label = labelPrefix
      ? (Array.isArray(parsed) ? `${labelPrefix} · ${key}` : `${labelPrefix} · ${formatLabel(key)}`)
      : (Array.isArray(parsed) ? String(key) : formatLabel(key));

    if (typeof value === 'boolean') {
      if (value) pushDetail(lines, label, 'Yes');
      return;
    }

    if (Array.isArray(value)) {
      if (!value.length) return;
      const items = value.map((item) => {
        if (item == null) return null;
        if (typeof item === 'object') {
          return formatClinicalObjectLines(item).map((line) => `${line.label}: ${line.value}`).join('; ');
        }
        return formatScalarValue(item) || String(item);
      }).filter(Boolean);
      pushDetail(lines, label, items.join('; '));
      return;
    }

    if (typeof value === 'object') {
      lines.push(...formatClinicalObjectLines(value, skipKeys, label));
      return;
    }

    pushDetail(lines, label, formatScalarValue(value) ?? value);
  });

  return lines;
}

export function appendClinicalFieldLines(lines, label, value, skipKeys = []) {
  lines.push(...formatClinicalObjectLines(value, skipKeys, label));
}
