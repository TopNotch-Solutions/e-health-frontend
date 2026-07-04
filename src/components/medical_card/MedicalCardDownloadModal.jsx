import { useCallback, useRef, useState } from 'react';
import PatientMedicalCardDocument from './PatientMedicalCardDocument';
import { medicalCardFilename, printMedicalCard } from './printMedicalCard';
import './patientMedicalCard.css';

export default function MedicalCardDownloadModal({ card, onClose }) {
  const cardRef = useRef(null);
  const [printing, setPrinting] = useState(false);

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    try {
      const printed = await printMedicalCard(cardRef.current);
      if (!printed) {
        window.alert('Allow pop-ups for this site, then try Download medical card (PDF) again.');
      }
    } finally {
      setPrinting(false);
    }
  }, []);

  if (!card) return null;

  return (
    <div className="medical-card-modal-backdrop" role="dialog" aria-modal="true">
      <div className="medical-card-modal-panel">
        <div className="medical-card-modal-actions">
          <button
            type="button"
            className="medical-card-btn-print"
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? 'Preparing PDF…' : 'Download medical card (PDF)'}
          </button>
          <button type="button" className="medical-card-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mb-2 text-xs text-slate-500">
          In the print dialog, choose <strong>Save as PDF</strong> and turn off{' '}
          <strong>Headers and footers</strong> so the app URL is not stamped on the page.
          Suggested filename: {medicalCardFilename(card)}
        </p>
        <div className="medical-card-modal-preview">
          <PatientMedicalCardDocument ref={cardRef} card={card} />
        </div>
      </div>
    </div>
  );
}
