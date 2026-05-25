/** Palette aligned with ward supervisor teal / slate theme */
export const CHART_COLORS = {
  teal: '#0d9488',
  tealLight: '#5eead4',
  slate: '#475569',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  sky: '#0284c7',
  violet: '#7c3aed',
};

const WARD_TYPE_LABELS = {
  general: 'General ward',
  icu: 'ICU',
  pediatric: 'Pediatrics',
  paediatric: 'Pediatrics',
  maternity: 'Maternity',
  emergency: 'Emergency',
  isolation: 'Isolation',
};

export function formatWardType(type) {
  if (!type) return 'Other';
  const key = String(type).toLowerCase();
  return WARD_TYPE_LABELS[key] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Hour labels from midnight through current hour (inclusive). */
export function buildHourlySeries(seedFn) {
  const now = new Date();
  const endHour = now.getHours();
  const points = [];
  for (let h = 0; h <= endHour; h += 1) {
    const label = `${String(h).padStart(2, '0')}:00`;
    points.push({ hour: label, ...(seedFn ? seedFn(h, endHour) : {}) });
  }
  return points;
}

export function occupancyFromWards(wards) {
  const byType = {};
  let available = 0;

  for (const w of wards || []) {
    const type = formatWardType(w.ward_type);
    const s = w.stats || {};
    const occupied = s.occupied ?? 0;
    const avail = s.available ?? 0;
    byType[type] = (byType[type] || 0) + occupied;
    available += avail;
  }

  const slices = Object.entries(byType)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  if (available > 0) {
    slices.push({ name: 'Available beds', value: available });
  }

  if (slices.length === 0) {
    return [
      { name: 'General ward', value: 12 },
      { name: 'ICU', value: 8 },
      { name: 'Pediatrics', value: 6 },
      { name: 'Available beds', value: 24 },
    ];
  }

  return slices;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function buildInitialMetrics(wards = []) {
  const registrationVelocity = buildHourlySeries((h, endHour) => ({
    count: h <= endHour ? randInt(0, h < 8 ? 2 : 8) : 0,
  }));

  const hourlyAdmissionsVsDischarges = buildHourlySeries((h) => ({
    admissions: randInt(0, 4),
    discharges: randInt(0, 3),
  }));

  const registrationsToday = registrationVelocity.reduce((s, p) => s + (p.count || 0), 0);
  const registrationsYesterday = Math.max(8, registrationsToday - randInt(-6, 8));

  return {
    kpis: {
      registrationsToday,
      registrationsYesterday,
      activeAdmissions: 0,
      dischargesToday: hourlyAdmissionsVsDischarges.reduce((s, p) => s + (p.discharges || 0), 0),
      avgTriageWaitMinutes: randInt(14, 38),
    },
    registrationVelocity,
    occupancyByArea: occupancyFromWards(wards),
    hourlyAdmissionsVsDischarges,
    triageDistribution: [
      { level: 'Red / Immediate', count: randInt(2, 8), fill: CHART_COLORS.rose },
      { level: 'Yellow / Urgent', count: randInt(8, 22), fill: CHART_COLORS.amber },
      { level: 'Green / Non-urgent', count: randInt(12, 35), fill: CHART_COLORS.emerald },
    ],
  };
}

export function mergeRealBedStats(metrics, facilityStats, wards) {
  if (!metrics) return metrics;
  const occupied = facilityStats?.occupied ?? 0;
  return {
    ...metrics,
    kpis: {
      ...metrics.kpis,
      activeAdmissions: occupied,
    },
    occupancyByArea: occupancyFromWards(wards),
  };
}

/** Small random walk to simulate a live metrics stream. */
export function tickMetrics(prev) {
  if (!prev) return prev;

  const hourIdx = prev.registrationVelocity.length - 1;
  const velocity = prev.registrationVelocity.map((p, i) => {
    if (i !== hourIdx) return p;
    const delta = randInt(-1, 2);
    return { ...p, count: clamp((p.count || 0) + delta, 0, 24) };
  });

  const hourly = prev.hourlyAdmissionsVsDischarges.map((p, i) => {
    if (i !== hourIdx) return p;
    return {
      ...p,
      admissions: clamp((p.admissions || 0) + randInt(-1, 1), 0, 12),
      discharges: clamp((p.discharges || 0) + randInt(0, 1), 0, 12),
    };
  });

  const registrationsToday = velocity.reduce((s, p) => s + (p.count || 0), 0);
  const dischargesToday = hourly.reduce((s, p) => s + (p.discharges || 0), 0);

  const triage = prev.triageDistribution.map((row) => ({
    ...row,
    count: clamp((row.count || 0) + randInt(-2, 2), 0, 80),
  }));

  return {
    ...prev,
    kpis: {
      ...prev.kpis,
      registrationsToday,
      dischargesToday,
      avgTriageWaitMinutes: clamp(
        (prev.kpis?.avgTriageWaitMinutes || 20) + randInt(-2, 2),
        8,
        90
      ),
    },
    registrationVelocity: velocity,
    hourlyAdmissionsVsDischarges: hourly,
    triageDistribution: triage,
  };
}
