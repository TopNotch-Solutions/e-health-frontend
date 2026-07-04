import { useCallback, useRef } from 'react';
import PatientBillingReceipt from '../../../components/billing/PatientBillingReceipt';
import { printBillingReceipt } from '../../../components/billing/printBillingReceipt';
import MedicalCardDownloadActions from '../../../components/medical_card/MedicalCardDownloadActions';

export default function BillingReceiptModal({ receipt, onClose }) {
  const receiptRef = useRef(null);

  const handlePrint = useCallback(() => {
    const printed = printBillingReceipt(receiptRef.current);
    if (!printed) {
      window.alert('Allow pop-ups for this site to print the receipt.');
    }
  }, []);

  if (!receipt) return null;

  return (
    <div className="billing-receipt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="billing-receipt-title">
      <div className="billing-receipt-modal-panel">
        <div className="billing-receipt-modal-actions">
          <button type="button" className="billing-receipt-btn-print" onClick={handlePrint}>
            Print receipt for patient
          </button>
          {receipt?.patient?.id ? (
            <MedicalCardDownloadActions
              patientId={receipt.patient.id}
              visitId={receipt.visit_id}
              className="!gap-2"
            />
          ) : null}
          <button type="button" className="billing-receipt-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
        <PatientBillingReceipt ref={receiptRef} receipt={receipt} />
      </div>
    </div>
  );
}
