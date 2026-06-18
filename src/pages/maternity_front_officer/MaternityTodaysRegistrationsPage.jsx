import { lookup } from '../front_office/styles/lookupClasses';
import TodaysRegistrationsPanel from '../front_office/components/TodaysRegistrationsPanel';

export default function MaternityTodaysRegistrationsPage() {
  return (
    <div className={lookup.page}>
      <section className={lookup.hero}>
        <div className={lookup.heroInner}>
          <p className={lookup.heroKicker}>Maternity front office</p>
          <h1 className={lookup.heroTitle}>Today&apos;s registrations</h1>
          <p className={lookup.heroMeta}>
            All patients you registered or routed today. Update profile details before end of day if needed.
          </p>
        </div>
      </section>

      <TodaysRegistrationsPanel todayPath="/maternity_front_officer/today" />
    </div>
  );
}
