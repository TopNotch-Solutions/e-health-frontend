import { lookup } from '../../styles/lookupClasses';

export default function LookupEmergencyBanner({ loading, onEmergency, hidden = false }) {
  if (hidden) return null;
  return (
    <p className={lookup.emergencyBanner}>
      Critical situation, no ID?{' '}
      <button
        type="button"
        className={lookup.emergencyBtn}
        disabled={loading}
        onClick={onEmergency}
      >
        {loading ? 'Registering…' : 'Register unknown patient → Emergency Unit'}
      </button>
    </p>
  );
}
