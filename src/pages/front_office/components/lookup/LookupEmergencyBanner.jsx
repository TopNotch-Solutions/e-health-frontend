import { lookup } from '../../styles/lookupClasses';

export default function LookupEmergencyBanner({ loading, onEmergency }) {
  return (
    <p className={lookup.emergencyBanner}>
      Critical situation, no ID?{' '}
      <button
        type="button"
        className={lookup.emergencyBtn}
        disabled={loading}
        onClick={onEmergency}
      >
        {loading ? 'Registering…' : 'Register unknown emergency patient (priority queue)'}
      </button>
    </p>
  );
}
