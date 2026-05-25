import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PharmacyMetricKpiRow from './PharmacyMetricKpiRow';
import { CHART_COLORS, axisTickStyle, gridStroke, tooltipStyle, DONUT_PALETTE } from './chartTheme';
import { ps } from '../../styles/pharmacySupervisorClasses';

function LiveBadge({ live }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide ${
        live ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-teal-100'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-emerald-300' : 'bg-teal-200'}`}
        aria-hidden
      />
      {live ? 'Live' : 'Updating'}
    </span>
  );
}

export default function PharmacySupervisorDashboard({ metrics, live }) {
  if (!metrics) return null;

  return (
    <>
      <div className={ps.hero}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className={ps.heroTitle}>Pharmacy supervisor dashboard</h1>
            <p className={ps.heroSub}>
              Stock levels, purchases received, prescriptions, and low-stock alerts in real time.
            </p>
          </div>
          <LiveBadge live={live} />
        </div>
        <PharmacyMetricKpiRow kpis={metrics.kpis} />
      </div>

      <div className={`${ps.workspaceScroll} pr-1`}>
        <div className={ps.chartGrid}>
          <section className={ps.chartPanel}>
            <h2 className={ps.sectionTitle}>Stock received today</h2>
            <p className="mt-0.5 text-xs text-slate-500">Units loaded by hour</p>
            <div className={ps.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.stockReceivedVelocity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" name="Units" stroke={CHART_COLORS.teal} strokeWidth={2} dot={{ r: 2 }} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={ps.chartPanel}>
            <h2 className={ps.sectionTitle}>Stock by category</h2>
            <p className="mt-0.5 text-xs text-slate-500">Current quantity on hand</p>
            <div className={ps.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.stockByCategory} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius="52%" outerRadius="72%" paddingAngle={2} isAnimationActive>
                    {metrics.stockByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={ps.chartPanel}>
            <h2 className={ps.sectionTitle}>Dispensing activity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Dispense events by hour today</p>
            <div className={ps.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourlyDispensed} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="dispensed" name="Dispensed" fill={CHART_COLORS.sky} radius={[4, 4, 0, 0]} isAnimationActive />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={ps.chartPanel}>
            <h2 className={ps.sectionTitle}>Prescription status</h2>
            <p className="mt-0.5 text-xs text-slate-500">Facility-wide breakdown</p>
            <div className={ps.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.prescriptionStatus} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={axisTickStyle} />
                  <YAxis type="category" dataKey="status" tick={{ ...axisTickStyle, fontSize: 9 }} width={72} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]} isAnimationActive>
                    {metrics.prescriptionStatus.map((row) => (
                      <Cell key={row.status} fill={row.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
