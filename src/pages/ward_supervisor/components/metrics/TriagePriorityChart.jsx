import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { axisTickStyle, gridStroke, tooltipStyle } from './chartTheme';
import { ws } from '../../styles/wardSupervisorClasses';

export default function TriagePriorityChart({ data }) {
  return (
    <section className={ws.chartPanel} aria-labelledby="ws-chart-triage">
      <h2 id="ws-chart-triage" className={ws.chartTitle}>
        Triage priority distribution
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">Patients awaiting bed assignment</p>
      <div className={ws.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={axisTickStyle} />
            <YAxis
              type="category"
              dataKey="level"
              tick={{ ...axisTickStyle, fontSize: 9 }}
              width={108}
            />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" name="Waiting" radius={[0, 4, 4, 0]} isAnimationActive>
              {data.map((row) => (
                <Cell key={row.level} fill={row.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
