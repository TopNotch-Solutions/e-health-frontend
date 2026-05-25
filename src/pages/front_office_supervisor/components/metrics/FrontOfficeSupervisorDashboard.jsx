import {
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
import FrontOfficeMetricKpiRow from './FrontOfficeMetricKpiRow';
import { CHART_COLORS, axisTickStyle, gridStroke, tooltipStyle, DONUT_PALETTE } from './chartTheme';
import { fos } from '../../styles/frontOfficeSupervisorClasses';

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

export default function FrontOfficeSupervisorDashboard({ metrics, live }) {
  if (!metrics) return null;

  const { employeesToday, recentActivity } = metrics;

  return (
    <>
      <div className={fos.hero}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className={fos.heroTitle}>Front office supervisor dashboard</h1>
            <p className={fos.heroSub}>
              Daily staff activity — first patient of the day, registrations, returning check-ins, and
              emergency intake.
            </p>
          </div>
          <LiveBadge live={live} />
        </div>
        <FrontOfficeMetricKpiRow kpis={metrics.kpis} />
      </div>

      <div className={`${fos.workspaceScroll} pr-1`}>
        <div className={fos.chartGrid}>
          <section className={fos.chartPanel}>
            <h2 className={fos.sectionTitle}>Registration velocity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Patients processed by hour today</p>
            <div className={fos.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.registrationVelocity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Processed"
                    stroke={CHART_COLORS.teal}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={fos.chartPanel}>
            <h2 className={fos.sectionTitle}>Visit type today</h2>
            <p className="mt-0.5 text-xs text-slate-500">New vs returning vs emergency</p>
            <div className={fos.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.visitsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius="52%"
                    outerRadius="72%"
                    paddingAngle={2}
                    isAnimationActive
                  >
                    {(metrics.visitsByType || []).map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill || DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={fos.chartPanel}>
            <h2 className={fos.sectionTitle}>Payment type</h2>
            <p className="mt-0.5 text-xs text-slate-500">State vs private (today)</p>
            <div className={fos.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.visitsByPayment}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius="52%"
                    outerRadius="72%"
                    paddingAngle={2}
                    isAnimationActive
                  >
                    {(metrics.visitsByPayment || []).map((entry, i) => (
                      <Cell key={entry.name} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className={`${fos.sectionPanel} mt-3`}>
          <h2 className={fos.sectionTitle}>Front office staff — today</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            First activity time is when each clerk registered or checked in their first patient today.
          </p>
          <div className="overflow-x-auto">
            <table className={fos.staffTable}>
              <thead>
                <tr>
                  <th className={fos.staffTh}>Employee</th>
                  <th className={fos.staffTh}>First patient today</th>
                  <th className={fos.staffTh}>New</th>
                  <th className={fos.staffTh}>Returning</th>
                  <th className={fos.staffTh}>Emergency</th>
                  <th className={fos.staffTh}>Total</th>
                  <th className={fos.staffTh}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(employeesToday || []).map((row) => (
                  <tr key={row.userId}>
                    <td className={fos.staffTd}>
                      <p className={fos.staffName}>{row.name}</p>
                      <p className={fos.staffMeta}>{row.employeeId}</p>
                    </td>
                    <td className={fos.staffTd}>
                      {row.hasStartedToday ? row.firstActivityTime : '—'}
                    </td>
                    <td className={fos.staffTd}>{row.newRegistrations}</td>
                    <td className={fos.staffTd}>{row.returningCheckins}</td>
                    <td className={fos.staffTd}>{row.emergencyVisits}</td>
                    <td className={`${fos.staffTd} font-semibold`}>{row.totalProcessed}</td>
                    <td className={fos.staffTd}>
                      <span
                        className={`${fos.badge} ${
                          row.hasStartedToday ? fos.badgeActive : fos.badgeIdle
                        }`}
                      >
                        {row.hasStartedToday ? 'Active' : 'Not started'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!employeesToday || employeesToday.length === 0) && (
              <p className="py-4 text-sm text-slate-500">No front office staff found for this facility.</p>
            )}
          </div>
        </section>

        <section className={`${fos.sectionPanel} mt-3`}>
          <h2 className={fos.sectionTitle}>Recent activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Latest registrations and check-ins today</p>
          <div className="mt-2">
            {(recentActivity || []).map((item) => (
              <div key={item.visitId} className={fos.activityRow}>
                <div>
                  <p className={fos.activityPatient}>
                    {item.patientName}
                    <span className="ml-2 font-normal text-slate-500">{item.patientNumber}</span>
                  </p>
                  <p className={fos.activityMeta}>
                    {item.visitTypeLabel} · {item.processedTime} · {item.staffName}
                    {item.staffEmployeeId ? ` (${item.staffEmployeeId})` : ''}
                  </p>
                </div>
                {item.isEmergency ? (
                  <span className={`${fos.badge} ${fos.badgeEmergency}`}>Emergency</span>
                ) : null}
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="py-4 text-sm text-slate-500">No activity recorded today yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
