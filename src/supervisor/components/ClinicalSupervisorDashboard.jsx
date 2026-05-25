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
import { sup } from '../supervisorClasses';
import { CHART_COLORS, axisTickStyle, gridStroke, tooltipStyle, DONUT_PALETTE } from '../chartTheme';

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

export default function ClinicalSupervisorDashboard({
  title,
  subtitle,
  live,
  kpiCards,
  velocityTitle,
  velocitySubtitle,
  velocityData,
  donutTitle,
  donutSubtitle,
  donutData,
  employeeTitle,
  employeeSubtitle,
  employeeColumns,
  employees,
  recentTitle,
  recentSubtitle,
  recentActivity,
}) {
  return (
    <>
      <div className={sup.hero}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className={sup.heroTitle}>{title}</h1>
            <p className={sup.heroSub}>{subtitle}</p>
          </div>
          <LiveBadge live={live} />
        </div>
        <div className={sup.kpiGrid}>
          {kpiCards.map((card) => (
            <div key={card.label} className={sup.kpiCard}>
              <p className={sup.kpiValue}>{card.value}</p>
              <p className={sup.kpiLabel}>{card.label}</p>
              {card.sub ? <p className="mt-1 text-[0.65rem] text-teal-100/90">{card.sub}</p> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={`${sup.workspaceScroll} pr-1`}>
        <div className={sup.chartGrid}>
          <section className={sup.chartPanel}>
            <h2 className={sup.sectionTitle}>{velocityTitle}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{velocitySubtitle}</p>
            <div className={sup.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Count"
                    stroke={CHART_COLORS.teal}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {donutData?.length > 0 ? (
            <section className={sup.chartPanel}>
              <h2 className={sup.sectionTitle}>{donutTitle}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{donutSubtitle}</p>
              <div className={sup.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius="52%"
                      outerRadius="72%"
                      paddingAngle={2}
                      isAnimationActive
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.fill || DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          ) : null}
        </div>

        <section className={`${sup.sectionPanel} mt-3`}>
          <h2 className={sup.sectionTitle}>{employeeTitle}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{employeeSubtitle}</p>
          <div className="overflow-x-auto">
            <table className={sup.staffTable}>
              <thead>
                <tr>
                  {employeeColumns.map((col) => (
                    <th key={col.key} className={sup.staffTh}>
                      {col.label}
                    </th>
                  ))}
                  <th className={sup.staffTh}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(employees || []).map((row) => (
                  <tr key={row.userId}>
                    <td className={sup.staffTd}>
                      <p className={sup.staffName}>{row.name}</p>
                      <p className={sup.staffMeta}>{row.employeeId}</p>
                    </td>
                    <td className={sup.staffTd}>
                      {row.hasStartedToday ? row.firstActivityTime : '—'}
                    </td>
                    {employeeColumns.slice(2).map((col) => (
                      <td key={col.key} className={`${sup.staffTd}${col.bold ? ' font-semibold' : ''}`}>
                        {row[col.key] ?? 0}
                      </td>
                    ))}
                    <td className={sup.staffTd}>
                      <span
                        className={`${sup.badge} ${
                          row.hasStartedToday ? sup.badgeActive : sup.badgeIdle
                        }`}
                      >
                        {row.hasStartedToday ? 'Active' : 'Not started'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!employees || employees.length === 0) && (
              <p className="py-4 text-sm text-slate-500">No staff found for this facility.</p>
            )}
          </div>
        </section>

        <section className={`${sup.sectionPanel} mt-3`}>
          <h2 className={sup.sectionTitle}>{recentTitle}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{recentSubtitle}</p>
          <div className="mt-2">
            {(recentActivity || []).map((item) => (
              <div key={item.id} className={sup.activityRow}>
                <div>
                  <p className={sup.activityPatient}>
                    {item.patientName}
                    <span className="ml-2 font-normal text-slate-500">{item.patientNumber}</span>
                  </p>
                  <p className={sup.activityMeta}>
                    {item.label} · {item.processedTime} · {item.staffName}
                    {item.staffEmployeeId ? ` (${item.staffEmployeeId})` : ''}
                  </p>
                </div>
                {item.isEmergency ? (
                  <span className={`${sup.badge} ${sup.badgeEmergency}`}>Emergency</span>
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
