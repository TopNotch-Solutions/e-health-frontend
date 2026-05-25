import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DONUT_PALETTE, tooltipStyle } from './chartTheme';
import { ws } from '../../styles/wardSupervisorClasses';

export default function WardOccupancyDonut({ data }) {
  return (
    <section className={ws.chartPanel} aria-labelledby="ws-chart-occupancy">
      <h2 id="ws-chart-occupancy" className={ws.sectionTitle}>
        Ward occupancy breakdown
      </h2>
      <p className="mt-0.5 text-xs text-slate-500">Bed utilization by area</p>
      <div className={ws.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius="52%"
              outerRadius="72%"
              paddingAngle={2}
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={DONUT_PALETTE[index % DONUT_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
