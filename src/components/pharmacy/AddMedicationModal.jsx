import AddMedicationForm from './AddMedicationForm';
import { nurse as nc } from '../../pages/nurse/styles/nurseClasses';

export default function AddMedicationModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`${nc.sectionPanel} max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto`}
        role="dialog"
        aria-labelledby="add-medication-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-medication-title" className={nc.sectionTitle}>
          Add medication to inventory
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose from the master medication list — name, generic, and price are filled in automatically.
        </p>
        <div className="mt-4">
          <AddMedicationForm
            onSuccess={(msg) => {
              onSuccess?.(msg);
              onClose?.();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
