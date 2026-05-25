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
import { ex } from '../styles/executiveClasses';

const COLORS = ['#0d9488', '#0284c7', '#059669', '#e11d48', '#7c3aed', '#475569', '#d97706'];

const axisTick = { fontSize: 10, fill: '#475569' };
const gridStroke = '#e2e8f0';
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 },
};

function formatXLabel(value) {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    try {
      return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  }
  return value;
}

const SERIES_LABELS = {
  admissions: 'Admissions',
  discharges: 'Discharges',
  prepared: 'Prepared',
  pending: 'Pending',
  total: 'Revenue (N$)',
  cumulative: 'Cumulative',
};

function ChartBlock({ chart }) {
  const {
    type,
    title,
    subtitle,
    data,
    xKey = 'name',
    yKey = 'count',
    layout,
    multiLine,
    yKeys,
    stacked,
    allowDecimals,
  } = chart;
  const barKeys = stacked && yKeys?.length ? yKeys : yKey ? [yKey] : ['count'];
  const yKeysList = multiLine && yKeys ? yKeys : [yKey];
  const dec = Boolean(allowDecimals);

  if (!data?.length) {
    return (
      <section className={ex.chartPanel}>
        <h4 className={ex.sectionTitle}>{title}</h4>
        <p className={ex.sectionDesc}>{subtitle}</p>
        <p className={`${ex.hint} mt-3`}>No data for this period.</p>
      </section>
    );
  }

  return (
    <section className={ex.chartPanel}>
      <h4 className={ex.sectionTitle}>{title}</h4>
      <p className={ex.sectionDesc}>{subtitle}</p>
      <div className={ex.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' && multiLine ? (
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey={xKey} tick={axisTick} tickFormatter={formatXLabel} />
              <YAxis allowDecimals={dec} tick={axisTick} width={36} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} labelFormatter={formatXLabel} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {yKeysList.map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={SERIES_LABELS[key] || key}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          ) : null}
          {type === 'line' && !multiLine ? (
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey={xKey} tick={axisTick} tickFormatter={formatXLabel} />
              <YAxis allowDecimals={dec} tick={axisTick} width={36} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} labelFormatter={formatXLabel} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0d9488' }}
              />
            </LineChart>
          ) : null}
          {type === 'bar' ? (
            <BarChart
              data={data}
              layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
              margin={{ top: 8, right: 8, left: layout === 'vertical' ? 4 : 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              {layout === 'vertical' ? (
                <>
                  <XAxis type="number" allowDecimals={dec} tick={axisTick} />
                  <YAxis type="category" dataKey={xKey} tick={axisTick} width={110} />
                </>
              ) : (
                <>
                  <XAxis dataKey={xKey} tick={axisTick} />
                  <YAxis allowDecimals={dec} tick={axisTick} width={44} />
                </>
              )}
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {barKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={SERIES_LABELS[key] || key}
                  fill={COLORS[i % COLORS.length]}
                  stackId={stacked ? 'stack' : undefined}
                  radius={stacked ? undefined : [4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : null}
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                dataKey={chart.valueKey || yKey}
                nameKey={chart.nameKey || xKey}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={entry[chart.nameKey || xKey] || i} fill={entry.fill || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function ExecutiveAnalyticsPanel({ panel, loading, error }) {
  if (loading) {
    return <p className={ex.hint}>Loading analytics…</p>;
  }

  if (error) {
    return (
      <p className={ex.alert} role="alert">
        {error}
      </p>
    );
  }

  if (!panel) {
    return <p className={ex.hint}>Select a module from the sidebar.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={ex.hero}>
        <h1 className={ex.heroTitle}>{panel.title}</h1>
        <p className={ex.heroSub}>
          National read-only view aggregated across all facilities.
          {panel.facilityCount ? ` · ${panel.facilityCount} facilities` : ''}
          {panel.updatedAt
            ? ` · Updated ${new Date(panel.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
            : ''}
        </p>
      </div>

      {panel.kpis?.length ? (
        <div className={ex.kpiGrid}>
          {panel.kpis.map((k) => (
            <div key={k.label} className={ex.kpiCard}>
              <p className={ex.kpiValue}>{k.value}</p>
              <p className={ex.kpiLabel}>{k.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {panel.charts?.length ? (
        <div className={ex.chartGrid}>
          {panel.charts.map((chart, idx) => (
            <ChartBlock key={`${chart.title}-${chart.type}-${idx}`} chart={chart} />
          ))}
        </div>
      ) : (
        <div className={ex.chartPanel}>
          <p className={ex.hint}>No chart data available for this module yet.</p>
        </div>
      )}
    </div>
  );
}
