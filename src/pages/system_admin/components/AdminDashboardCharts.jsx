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
const axisTick = { fontSize: 10, fill: '#64748b' };
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

export default function AdminDashboardCharts({ analytics, facilityScope, selectedFacilityName }) {
  if (!analytics) return null;

  const scopeLabel = facilityScope && selectedFacilityName
    ? selectedFacilityName
    : 'all facilities';

  const visitsData = (analytics.visitsByDay || []).map((row) => ({
    ...row,
    label: formatDayLabel(row.date),
  }));

  const staffData = analytics.staffByRole || [];
  const categoryData = analytics.patientsByCategory || [];
  const paymentData = analytics.patientsByPaymentType || [];
  const facilityTypeData = analytics.facilitiesByType || [];
  const visitsByFacility = analytics.visitsByFacility || [];
  const queueData = (analytics.queueWaiting || []).map((q) => ({
    department: capitalize(q.department),
    count: q.count,
  }));

  const hasCharts =
    visitsData.length > 0
    || staffData.length > 0
    || categoryData.length > 0
    || facilityTypeData.length > 0
    || visitsByFacility.length > 0
    || queueData.length > 0;

  if (!hasCharts) {
    return (
      <div className={c.sectionPanel}>
        <p className={c.cardBody}>
          Analytics will appear once there is visit and staff data
          {facilityScope ? ' at this facility' : ' across facilities'}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className={c.sectionTitle}>Analytics</h3>
      <p className={c.sectionDesc}>
        {facilityScope
          ? `Trends for ${selectedFacilityName} over the last 14 days.`
          : 'National facility comparison — visits and staff broken down by location.'}
      </p>

      <div className={c.chartGrid}>
        <section className={c.chartPanel}>
          <h4 className={c.chartTitle}>Patient visits (14 days)</h4>
          <p className={c.chartDesc}>Daily volume at {scopeLabel}</p>
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

        {!facilityScope && visitsByFacility.length > 0 ? (
          <section className={c.chartPanel}>
            <h4 className={c.chartTitle}>Visits by facility (14 days)</h4>
            <p className={c.chartDesc}>Which locations are busiest</p>
            <div className={c.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitsByFacility.slice(0, 12)} layout="vertical" margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={axisTick} />
                  <YAxis type="category" dataKey="label" tick={axisTick} width={120} />
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                  <Bar dataKey="count" name="Visits" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        <section className={c.chartPanel}>
          <h4 className={c.chartTitle}>Active staff by role</h4>
          <p className={c.chartDesc}>{facilityScope ? 'At this facility' : 'Across all facilities'}</p>
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

        {categoryData.length > 0 ? (
          <section className={c.chartPanel}>
            <h4 className={c.chartTitle}>Patients by category</h4>
            <p className={c.chartDesc}>
              {facilityScope ? 'Patients with visits at this facility' : 'Registered patient population'}
            </p>
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
                  <Legend wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        {paymentData.length > 0 ? (
          <section className={c.chartPanel}>
            <h4 className={c.chartTitle}>Patients by payment type</h4>
            <p className={c.chartDesc}>State vs private schemes</p>
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
        ) : null}

        {!facilityScope && facilityTypeData.length > 0 ? (
          <section className={c.chartPanel}>
            <h4 className={c.chartTitle}>Facilities by type</h4>
            <p className={c.chartDesc}>Hospitals, clinics, and health centers</p>
            <div className={c.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityTypeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="label" tick={axisTick} />
                  <YAxis allowDecimals={false} tick={axisTick} width={32} />
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                  <Bar dataKey="count" name="Facilities" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        {queueData.length > 0 ? (
          <section className={c.chartPanel}>
            <h4 className={c.chartTitle}>Queue — waiting now</h4>
            <p className={c.chartDesc}>
              {facilityScope ? `At ${selectedFacilityName}` : 'Across all facilities'}
            </p>
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
        ) : null}
      </div>
    </div>
  );
}
