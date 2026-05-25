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
import { admin as c } from '../styles/adminClasses';

const COLORS = ['#0d9488', '#0284c7', '#059669', '#e11d48', '#7c3aed', '#475569'];
const axisTick = { fontSize: 10, fill: '#475569' };
const gridStroke = '#e2e8f0';
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 },
};

function formatDayLabel(isoDate) {
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AdminDashboardCharts({ analytics }) {
  if (!analytics) return null;

  const visitsData = (analytics.visitsByDay || []).map((row) => ({
    ...row,
    label: formatDayLabel(row.date),
  }));

  const staffData = analytics.staffByRole || [];
  const categoryData = analytics.patientsByCategory || [];
  const paymentData = analytics.patientsByPaymentType || [];
  const facilityData = analytics.facilitiesByType || [];
  const queueData = (analytics.queueWaiting || []).map((q) => ({
    department: capitalize(q.department),
    count: q.count,
  }));

  const hasCharts =
    visitsData.length > 0
    || staffData.length > 0
    || categoryData.length > 0
    || facilityData.length > 0
    || queueData.length > 0;

  if (!hasCharts) {
    return (
      <div className={c.sectionPanel}>
        <p className={c.hint}>Analytics will appear once there is visit and patient data in the system.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className={c.sectionTitle}>Analytics</h3>
      <p className={c.sectionDesc}>National trends over the last 14 days and current network breakdown.</p>

      <div className={c.chartGrid}>
        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Patient visits (14 days)</h4>
          <p className={c.sectionDesc}>Daily visit volume across all facilities</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={axisTick} width={32} />
                <Tooltip
                  contentStyle={tooltipStyle.contentStyle}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Visits"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0d9488' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Active staff by role</h4>
          <p className={c.sectionDesc}>Employees with active accounts</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData.slice(0, 10)} layout="vertical" margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={axisTick} />
                <YAxis type="category" dataKey="role" tick={axisTick} width={100} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} />
                <Bar dataKey="count" name="Staff" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Patients by category</h4>
          <p className={c.sectionDesc}>Registered patient population</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={categoryData[i].label} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Patients by payment type</h4>
          <p className={c.sectionDesc}>Cash, medical aid, and other schemes</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} width={32} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} />
                <Bar dataKey="count" name="Patients" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Facilities by type</h4>
          <p className={c.sectionDesc}>Hospitals, clinics, and health centers</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="label" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} width={32} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} />
                <Bar dataKey="count" name="Facilities" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={c.chartPanel}>
          <h4 className={c.sectionTitle}>Queue — waiting now</h4>
          <p className={c.sectionDesc}>Patients waiting by department (national)</p>
          <div className={c.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="department" tick={axisTick} />
                <YAxis allowDecimals={false} tick={axisTick} width={32} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} />
                <Bar dataKey="count" name="Waiting" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
