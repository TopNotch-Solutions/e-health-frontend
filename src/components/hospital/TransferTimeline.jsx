function formatDateTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(iso);
  }
}

export default function TransferTimeline({ timeline, className = '' }) {
  if (!timeline?.length) return null;

  return (
    <ol className={`space-y-0 ${className}`}>
      {timeline.map((step, index) => (
        <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
          {index < timeline.length - 1 ? (
            <span
              className={`absolute left-[0.4375rem] top-3 h-full w-0.5 ${
                step.completed ? 'bg-teal-400' : 'bg-slate-200'
              }`}
              aria-hidden
            />
          ) : null}
          <span
            className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
              step.completed
                ? 'border-teal-600 bg-teal-600'
                : 'border-slate-300 bg-white'
            }`}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
              {step.label}
            </p>
            {step.completed ? (
              <p className="mt-0.5 text-xs text-slate-600">
                {formatDateTime(step.at)}
                {step.actor ? ` · ${step.actor}` : ''}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">Pending</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
