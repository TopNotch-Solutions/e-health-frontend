import { useCallback, useState } from 'react';
import { getMedicalCard } from '../../api/patients';
import { getAdminMedicalCard } from '../../api/admin';
import MedicalCardDownloadModal from './MedicalCardDownloadModal';
import './patientMedicalCard.css';

export default function MedicalCardDownloadActions({
  patientId,
  visitId = null,
  admin = false,
  className = '',
}) {
  const [loadingScope, setLoadingScope] = useState('');
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);

  const loadCard = useCallback(async (scope) => {
    if (!patientId) return;
    setLoadingScope(scope);
    setError('');
    try {
      const params = scope === 'visit' && visitId ? { visit_id: visitId } : {};
      const payload = admin
        ? await getAdminMedicalCard(patientId, params)
        : await getMedicalCard(patientId, params);
      setCard(payload);
    } catch (err) {
      setError(err.message || 'Could not load medical card');
    } finally {
      setLoadingScope('');
    }
  }, [admin, patientId, visitId]);

  function handleClose() {
    setCard(null);
  }

  if (!patientId) return null;

  return (
    <>
      <div className={`medical-card-download-actions ${className}`.trim()}>
        <button
          type="button"
          className="medical-card-download-btn medical-card-download-btn--primary"
          disabled={!visitId || Boolean(loadingScope)}
          onClick={() => loadCard('visit')}
        >
          {loadingScope === 'visit' ? 'Preparing…' : 'This consultation (PDF)'}
        </button>
        <button
          type="button"
          className="medical-card-download-btn"
          disabled={Boolean(loadingScope)}
          onClick={() => loadCard('all')}
        >
          {loadingScope === 'all' ? 'Preparing…' : 'Full medical history (PDF)'}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>
      ) : null}
      {card ? <MedicalCardDownloadModal card={card} onClose={handleClose} /> : null}
    </>
  );
}
