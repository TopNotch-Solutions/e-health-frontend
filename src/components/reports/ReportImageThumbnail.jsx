import { useEffect, useState } from 'react';
import { fetchReportAttachment } from '../../api/reports';

export default function ReportImageThumbnail({ reportId, className = 'h-14 w-14 rounded border border-slate-200 object-cover' }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    (async () => {
      try {
        const blob = await fetchReportAttachment(reportId);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportId]);

  if (failed) {
    return <span className="text-xs text-slate-400">Unavailable</span>;
  }

  if (!src) {
    return <span className="text-xs text-slate-400">Loading…</span>;
  }

  return (
    <img
      src={src}
      alt="Report attachment"
      className={className}
    />
  );
}
