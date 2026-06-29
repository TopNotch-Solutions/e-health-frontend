import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from '../../data/wardMetricsUtils';
import { axisTickStyle, gridStroke, tooltipStyle } from './chartTheme';
import { ws } from '../../styles/wardSupervisorClasses';

export default function AdmissionDischargeBarChart({ data }) {
  return (
    <section className={ws.chartPanel} aria-labelledby="ws-chart-ad-dis">
      <h2 id="ws-chart-ad-dis" className={ws.chartTitle}>
        Admissions vs discharges
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">Hourly volumes today</p>
      <div className={ws.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar
              dataKey="admissions"
              name="Admissions"
              fill={CHART_COLORS.teal}
              radius={[4, 4, 0, 0]}
              isAnimationActive
            />
            <Bar
              dataKey="discharges"
              name="Discharges"
              fill={CHART_COLORS.sky}
              radius={[4, 4, 0, 0]}
              isAnimationActive
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
