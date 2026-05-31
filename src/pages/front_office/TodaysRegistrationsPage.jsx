import { lookup } from './styles/lookupClasses';
import TodaysRegistrationsPanel from './components/TodaysRegistrationsPanel';

export default function TodaysRegistrationsPage() {
  return (
    <div className={lookup.page}>
      <section className={lookup.hero}>
        <div className={lookup.heroInner}>
          <p className={lookup.heroKicker}>Front office</p>
          <h1 className={lookup.heroTitle}>Today&apos;s registrations</h1>
          <p className={lookup.heroMeta}>
            All patients you registered or checked in today. Update profile details before end of day if needed.
          </p>
        </div>
      </section>

      <TodaysRegistrationsPanel />
    </div>
  );
}
