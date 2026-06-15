export function parseAuditDetails(details) {
  if (!details) return {};
  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return { summary: details };
    }
  }
  return details;
}

export function icd10ActionLabel(action) {
  switch (action) {
    case 'create': return 'Added';
    case 'activate': return 'Activated';
    case 'inactivate': return 'Inactivated';
    case 'import': return 'Bulk import';
    case 'update': return 'Updated';
    default: return action || '—';
  }
}

export function formatIcd10AuditSummary(log) {
  const details = parseAuditDetails(log.details);
  if (log.action === 'import') {
    const parts = [];
    if (details.created != null) parts.push(`${details.created} added`);
    if (details.updated != null) parts.push(`${details.updated} updated`);
    if (details.file_name) parts.push(details.file_name);
    return parts.join(' · ') || 'Spreadsheet import';
  }
  if (details.icd10_code) {
    return details.description
      ? `${details.icd10_code} — ${details.description}`
      : details.icd10_code;
  }
  return details.summary || '—';
}

export function auditUserLabel(log) {
  return log.user_name || log.user_email || (log.user_id ? `${log.user_id.slice(0, 8)}…` : '—');
}
