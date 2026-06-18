const KOPANO = 'https://kopanovertex.com/';

export default function AppShellFooter({ className = '', moduleLabel = null }) {
  return (
    <footer className={className}>
      <span className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <span className="font-semibold text-slate-600">E-Health</span>
        <span className="text-slate-300" aria-hidden>·</span>
        <span>A digital solution by</span>
        <a
          href={KOPANO}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-teal-700 transition hover:text-teal-800 hover:underline"
        >
          Kopano-Vertex
        </a>
        {moduleLabel ? (
          <>
            <span className="text-slate-300" aria-hidden>·</span>
            <span>{moduleLabel}</span>
          </>
        ) : null}
        <span className="text-slate-300" aria-hidden>·</span>
        <span>© {new Date().getFullYear()}</span>
      </span>
    </footer>
  );
}
