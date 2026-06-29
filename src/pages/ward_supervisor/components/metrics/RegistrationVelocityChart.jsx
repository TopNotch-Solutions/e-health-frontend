import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from '../../data/wardMetricsUtils';
import { axisTickStyle, gridStroke, tooltipStyle } from './chartTheme';
import { ws } from '../../styles/wardSupervisorClasses';

export default function RegistrationVelocityChart({ data }) {
  return (
    <section className={ws.chartPanel} aria-labelledby="ws-chart-velocity">
      <h2 id="ws-chart-velocity" className={ws.chartTitle}>
        Patient registration velocity
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">Hourly registrations today</p>
      <div className={ws.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="hour" tick={axisTickStyle} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={axisTickStyle} width={28} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              name="Registrations"
              stroke={CHART_COLORS.teal}
              strokeWidth={2}
              dot={{ r: 2, fill: CHART_COLORS.teal }}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
