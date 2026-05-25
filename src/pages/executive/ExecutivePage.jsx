import { useCallback, useEffect, useState } from 'react';
import { getStoredUser } from '../../api/authSession';
import { getExecutivePanel } from '../../api/executive';
import ExecutiveAnalyticsPanel from './components/ExecutiveAnalyticsPanel';
import ExecutiveSidebar from './components/ExecutiveSidebar';
import ExecutiveTopbar from './components/ExecutiveTopbar';
import { ex } from './styles/executiveClasses';

const KOPANO = 'https://kopanovertex.com/';

export default function ExecutivePage() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Executive';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'EX';

  const [section, setSection] = useState('overview');
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPanel = useCallback(async (key) => {
    setLoading(true);
    setError('');
    try {
      const data = await getExecutivePanel(key);
      setPanel(data);
    } catch (err) {
      setPanel(null);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPanel(section);
  }, [section, loadPanel]);

  return (
    <div className={ex.page}>
      <ExecutiveTopbar label={label} initials={initials} />

      <div className={ex.body}>
        <ExecutiveSidebar activeSection={section} onSectionChange={setSection} />
        <main className={ex.main}>
          <div className={ex.readOnlyBanner} role="status">
            <span aria-hidden>👁</span>
            Read-only analytics — view national metrics only. No create, edit, or delete actions.
          </div>
          <div className={ex.mainScroll}>
            <ExecutiveAnalyticsPanel panel={panel} loading={loading} error={error} />
          </div>
        </main>
      </div>

      <footer className={ex.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={ex.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Executive
      </footer>
    </div>
  );
}
