import { formatDateTime, formatLabel } from '../../pages/front_office/utils/ehrUtils';
import {
  appendClinicalFieldLines,
  formatScalarValue,
  parseJsonValue,
  pushDetail,
} from './clinicalDetailFormatters';

const MATERNITY_WARD_LABELS = {
  maternity_anw: 'Antenatal Ward (ANW)',
  maternity_pnw: 'Postnatal Ward (PNW)',
  maternity_icu: 'Maternity ICU',
  maternity_nicu: 'NICU',
  maternity_anc: 'Antenatal Care (ANC)',
};

function wardLabel(value) {
  if (!value) return '—';
  return MATERNITY_WARD_LABELS[value] || formatLabel(value);
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

      const fieldLabel = `${dayLabel} · ${formatLabel(key)}`;
      const parsed = parseJsonValue(value);

      if (typeof parsed === 'boolean') {
        if (parsed) pushDetail(lines, fieldLabel, 'Yes');
        return;
      }

      if (typeof parsed === 'object') {
        appendClinicalFieldLines(lines, fieldLabel, parsed);
        return;
      }

      pushDetail(lines, fieldLabel, formatScalarValue(parsed) ?? parsed);
    });
  });
  return lines;
}

function formatBaselineHistoryList(value) {
  const parsed = parseJsonValue(value);
  if (Array.isArray(parsed)) {
    const items = parsed.map((entry) => String(entry || '').trim()).filter(Boolean);
    if (!items.length) return null;
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
  if (typeof parsed === 'string' && parsed.trim()) return parsed.trim();
  return null;
}

function formatHivPanel(hiv) {
  const panel = parseJsonValue(hiv);
  if (!panel || typeof panel !== 'object') return null;
  if (panel.conducted === false || panel.result === 'positive_on_record') {
    return 'HIV positive on record — test not conducted';
  }
  if (panel.result === 'positive' || panel.status === 'positive') return 'HIV positive';
  if (panel.result === 'negative') return 'HIV negative';
  return formatScalarValue(panel.result) || formatScalarValue(panel.status);
}

function formatAncSessionLines(session) {
  const lines = [];
  const label = `ANC session ${session.session_number || ''}`.trim();

  if (session.is_first_visit) {
    pushDetail(lines, label, 'First visit of pregnancy (baseline captured)');
  }

  const baseline = parseJsonValue(session.baseline_history);
  if (baseline && typeof baseline === 'object') {
    pushDetail(lines, `${label} · obstetric`, formatBaselineHistoryList(baseline.obstetric));
    pushDetail(lines, `${label} · gynae`, formatBaselineHistoryList(baseline.gynae));
    pushDetail(lines, `${label} · past medical`, formatBaselineHistoryList(baseline.past_medical));
  } else if (baseline) {
    appendClinicalFieldLines(lines, `${label} · baseline history`, baseline);
  }

  const exam = parseJsonValue(session.general_physical_exam);
  if (exam && typeof exam === 'object') {
    appendClinicalFieldLines(lines, `${label} · exam`, exam);
  } else if (exam) {
    pushDetail(lines, `${label} · exam`, exam);
  }

  const investigations = parseJsonValue(session.special_investigations);
  if (investigations && typeof investigations === 'object') {
    const hivLabel = formatHivPanel(investigations.hiv_panel);
    if (hivLabel) pushDetail(lines, `${label} · HIV panel`, hivLabel);
    pushDetail(lines, `${label} · serology`, investigations.serology);
    pushDetail(lines, `${label} · tetanus toxoid`, investigations.tetanus_toxoid_immunization);
  }

  const delivery = parseJsonValue(session.delivery_details);
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

function formatEpisodeSummary(clinical) {
  const lines = [];
  const ep = clinical.maternity_episode || clinical;

  if (ep.current_ward) pushDetail(lines, 'Episode ward', wardLabel(ep.current_ward));
  if (ep.status) pushDetail(lines, 'Episode status', formatLabel(ep.status));
  if (ep.admitted_at) pushDetail(lines, 'Admitted', formatDateTime(ep.admitted_at));
  if (ep.front_office_visits != null) pushDetail(lines, 'Front office visits', String(ep.front_office_visits));
  if (ep.anw_days != null) pushDetail(lines, 'ANW days', String(ep.anw_days));
  if (ep.pnw_days != null) pushDetail(lines, 'PNW days', String(ep.pnw_days));
  if (ep.icu_days != null) pushDetail(lines, 'ICU days', String(ep.icu_days));
  if (ep.feeding_counselling_done) pushDetail(lines, 'Discharge', 'Feeding counselling completed');
  if (ep.six_week_follow_up_date) pushDetail(lines, '6-week follow-up', ep.six_week_follow_up_date);
  if (ep.discharged_at) pushDetail(lines, 'Discharged', formatDateTime(ep.discharged_at));

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
      appendClinicalFieldLines(lines, `${label} · clinical status`, record.clinical_status);
      appendClinicalFieldLines(lines, `${label} · APGAR`, record.apgar_matrix);
    });
  }

  const episodeFields = [
    'current_ward', 'status', 'admitted_at', 'discharged_at', 'front_office_visits',
    'anw_days', 'pnw_days', 'icu_days', 'feeding_counselling_done', 'six_week_follow_up_date',
  ];
  const hasEpisodeSummary = clinical.maternity_episode
    || episodeFields.some((key) => clinical[key] != null && clinical[key] !== '');

  if (hasEpisodeSummary) {
    lines.push(...formatEpisodeSummary(clinical));
  }

  return lines;
}
