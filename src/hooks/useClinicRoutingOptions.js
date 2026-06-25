import { useEffect, useState } from 'react';
import { getClinicRoutingOptions } from '../api/clinicRouting';

export function useClinicRoutingOptions() {
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getClinicRoutingOptions()
      .then((data) => {
        if (!cancelled) setOptions(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load routing options');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { options, loading, error };
}
