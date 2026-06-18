import { formatDateTime, formatLabel } from '../../pages/front_office/utils/ehrUtils';

function displayValue(value) {
  if (value == null) return '—';
  const s = String(value).trim();
  return s || '—';
}

function pushDetail(lines, label, value) {
  const text = displayValue(value);
  if (text !== '—') lines.push({ label, value: text });
}

function flattenJsonField(lines, label, value) {
  if (value == null || value === '') return;
  if (typeof value === 'object' && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, val]) => {
      if (val == null || val === '') return;
      pushDetail(lines, `${label} · ${formatLabel(key)}`, typeof val === 'object' ? JSON.stringify(val) : val);
    });
    return;
  }
  pushDetail(lines, label, typeof value === 'object' ? JSON.stringify(value) : value);
}

function formatDailyRecordLines(records, prefix) {
  const lines = [];
  (records || []).forEach((record, idx) => {
    const dayLabel = record.record_date
      ? `${prefix} · ${record.record_date}`
      : `${prefix} ${idx + 1}`;
    pushDetail(lines, dayLabel, record.signed_off_at ? `Signed off ${formatDateTime(record.signed_off_at)}` : 'In progress');

    Object.entries(record).forEach(([key, value]) => {
      if (['record_date', 'signed_off_at', 'id', 'episode_id', 'visit_id', 'recorded_by'].includes(key)) return;
      if (value == null || value === '') return;
      if (typeof value === 'boolean') {
        if (value) pushDetail(lines, `${dayLabel} · ${formatLabel(key)}`, 'Yes');
        return;
      }
      flattenJsonField(lines, `${dayLabel} · ${formatLabel(key)}`, value);
    });
  });
  return lines;
}

function formatBaselineHistoryList(value) {
  if (Array.isArray(value)) {
    const items = value.map((entry) => String(entry || '').trim()).filter(Boolean);
    if (!items.length) return null;
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function formatHivPanel(hiv) {
  if (!hiv || typeof hiv !== 'object') return null;
  if (hiv.conducted === false || hiv.result === 'positive_on_record') {
    return 'HIV positive on record — test not conducted';
  }
  if (hiv.result === 'positive' || hiv.status === 'positive') return 'HIV positive';
  if (hiv.result === 'negative') return 'HIV negative';
  return null;
}

function formatAncSessionLines(session) {
  const lines = [];
  const label = `ANC session ${session.session_number || ''}`.trim();

  if (session.is_first_visit) {
    pushDetail(lines, label, 'First visit of pregnancy (baseline captured)');
  }

  const baseline = session.baseline_history;
  if (baseline && typeof baseline === 'object') {
    pushDetail(lines, `${label} · obstetric`, formatBaselineHistoryList(baseline.obstetric));
    pushDetail(lines, `${label} · gynae`, formatBaselineHistoryList(baseline.gynae));
    pushDetail(lines, `${label} · past medical`, formatBaselineHistoryList(baseline.past_medical));
  } else if (baseline) {
    flattenJsonField(lines, `${label} · baseline history`, baseline);
  }

  const exam = session.general_physical_exam;
  if (exam && typeof exam === 'object') {
    Object.entries(exam).forEach(([key, val]) => {
      if (val == null || val === '') return;
      pushDetail(lines, `${label} · ${formatLabel(key)}`, val);
    });
  }

  const investigations = session.special_investigations;
  if (investigations && typeof investigations === 'object') {
    const hivLabel = formatHivPanel(investigations.hiv_panel);
    if (hivLabel) pushDetail(lines, `${label} · HIV panel`, hivLabel);
    pushDetail(lines, `${label} · serology`, investigations.serology);
    pushDetail(lines, `${label} · tetanus toxoid`, investigations.tetanus_toxoid_immunization);
  }

  const delivery = session.delivery_details;
  if (delivery && typeof delivery === 'object') {
    pushDetail(lines, `${label} · chemoprophylaxis`, delivery.chemoprophylaxis);
    pushDetail(lines, `${label} · place of delivery`, delivery.place_of_delivery);
  }

  if (session.no_further_session_required) {
    pushDetail(lines, `${label} · follow-up`, 'No further session required');
  } else if (session.follow_up_date) {
    pushDetail(lines, `${label} · follow-up`, session.follow_up_date);
  }

  if (session.signed_off_at) {
    pushDetail(lines, `${label} · signed off`, formatDateTime(session.signed_off_at));
  }

  return lines;
}

/** Map maternity clinical payloads from API stops into book timeline detail lines. */
export function formatMaternityStopDetails(clinical) {
  if (!clinical) return [];
  const lines = [];

  if (clinical.maternity_anc_sessions?.length) {
    clinical.maternity_anc_sessions.forEach((session) => {
      lines.push(...formatAncSessionLines(session));
    });
  }

  if (clinical.maternity_anw_daily_records?.length) {
    lines.push(...formatDailyRecordLines(clinical.maternity_anw_daily_records, 'ANW daily record'));
  }

  if (clinical.maternity_pnw_daily_records?.length) {
    lines.push(...formatDailyRecordLines(clinical.maternity_pnw_daily_records, 'PNW daily record'));
  }

  if (clinical.maternity_icu_daily_records?.length) {
    lines.push(...formatDailyRecordLines(clinical.maternity_icu_daily_records, 'Maternity ICU daily record'));
  }

  if (clinical.maternity_nicu_records?.length) {
    clinical.maternity_nicu_records.forEach((record, idx) => {
      const label = record.name ? `Newborn · ${record.name}` : `NICU record ${idx + 1}`;
      pushDetail(lines, label, [
        record.sex ? formatLabel(record.sex) : null,
        record.gestation_weeks ? `${record.gestation_weeks} weeks gestation` : null,
        record.date_time_of_birth ? formatDateTime(record.date_time_of_birth) : null,
      ].filter(Boolean).join(' · '));
      flattenJsonField(lines, `${label} · clinical status`, record.clinical_status);
      flattenJsonField(lines, `${label} · APGAR`, record.apgar_matrix);
    });
  }

  if (clinical.maternity_episode) {
    const ep = clinical.maternity_episode;
    if (ep.current_ward) pushDetail(lines, 'Episode ward', formatLabel(ep.current_ward));
    if (ep.feeding_counselling_done) pushDetail(lines, 'Discharge', 'Feeding counselling completed');
    if (ep.six_week_follow_up_date) pushDetail(lines, '6-week follow-up', ep.six_week_follow_up_date);
    if (ep.discharged_at) pushDetail(lines, 'Discharged', formatDateTime(ep.discharged_at));
  }

  if (clinical.current_ward) {
    pushDetail(lines, 'Current ward', formatLabel(clinical.current_ward));
  }

  return lines;
}
