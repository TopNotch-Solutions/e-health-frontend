import { toast as toastClasses } from '../styles/frontOfficeClasses';

/**
 * Fixed-position toast stack (top-right). Used via ToastProvider.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className={toastClasses.container}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === 'error' ? 'alert' : 'status'}
          className={`${toastClasses.item} ${
            t.type === 'success'
              ? toastClasses.success
              : t.type === 'info'
                ? toastClasses.info
                : toastClasses.error
          }`}
        >
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            className={toastClasses.dismiss}
            aria-label="Dismiss notification"
            onClick={() => onDismiss(t.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
