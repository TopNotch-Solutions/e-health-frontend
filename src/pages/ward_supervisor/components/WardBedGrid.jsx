import { ws } from '../styles/wardSupervisorClasses';

function statusMeta(status) {
  if (status === 'occupied') {
    return { label: 'Occupied', tile: ws.bedTileOccupied, pill: 'bg-amber-100 text-amber-900' };
  }
  if (status === 'reserved') {
    return {
      label: 'Awaiting arrival',
      tile: 'border-sky-200 bg-gradient-to-b from-sky-50 to-white',
      pill: 'bg-sky-100 text-sky-900',
    };
  }
  if (status === 'out_of_service') {
    return { label: 'Inactive', tile: ws.bedTileOos, pill: 'bg-slate-200 text-slate-700' };
  }
  return { label: 'Active', tile: ws.bedTileAvailable, pill: 'bg-emerald-100 text-emerald-800' };
}

export default function WardBedGrid({ beds, togglingBedId, onToggleBed }) {
  const sorted = [...(beds || [])].sort((a, b) => {
    const ra = Number(a.room_number) || 0;
    const rb = Number(b.room_number) || 0;
    if (ra !== rb) return ra - rb;
    return String(a.bed_number).localeCompare(String(b.bed_number));
  });

  if (sorted.length === 0) {
    return <p className={ws.hint}>No beds configured for this ward.</p>;
  }

  return (
    <div>
      <p className={`${ws.hint} mb-2 text-xs`}>
        Click a bed to mark it <span className="font-semibold text-emerald-700">active</span> or{' '}
        <span className="font-semibold text-slate-600">inactive</span>. Occupied beds cannot be changed.
      </p>
      <div className={ws.bedGrid}>
        {sorted.map((bed) => {
          const meta = statusMeta(bed.status);
          const patient = bed.patient;
          const patientName = patient
            ? [patient.first_name, patient.last_name].filter(Boolean).join(' ')
            : null;
          const isOccupied = bed.status === 'occupied';
          const isReserved = bed.status === 'reserved';
          const isToggling = togglingBedId === bed.id;
          const canToggle = !isOccupied && !isReserved && onToggleBed;

          const TileTag = canToggle ? 'button' : 'article';
          const tileProps = canToggle
            ? {
                type: 'button',
                onClick: () => onToggleBed(bed),
                disabled: isToggling,
                'aria-pressed': bed.status === 'out_of_service',
                'aria-label': `Room ${bed.room_number}, bed ${bed.bed_number}. ${meta.label}. Click to toggle active or inactive.`,
              }
            : {
                'aria-label': `Room ${bed.room_number}, bed ${bed.bed_number}. ${meta.label}.`,
              };

          return (
            <TileTag
              key={bed.id}
              className={`${ws.bedTile} ${meta.tile} text-left ${
                canToggle
                  ? 'cursor-pointer hover:ring-2 hover:ring-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60'
                  : ''
              }`}
              title={
                isOccupied
                  ? 'Patient on bed — cannot change status'
                  : isReserved
                    ? 'Patient en route — awaiting ward arrival'
                    : 'Click to toggle active / inactive'
              }
              {...tileProps}
            >
              <span className={ws.bedRoom}>Room {bed.room_number || '—'}</span>
              <span className={ws.bedNumber}>Bed {bed.bed_number}</span>
              <span className={`${ws.bedStatus} ${meta.pill}`}>
                {isToggling ? 'Updating…' : meta.label}
              </span>
              {patientName ? (
                <p className="mt-2 truncate text-xs font-semibold text-slate-700">{patientName}</p>
              ) : null}
              {bed.condition_note && bed.status === 'out_of_service' ? (
                <p className="mt-1 line-clamp-2 text-[0.65rem] text-slate-500">{bed.condition_note}</p>
              ) : null}
              {canToggle ? (
                <p className="mt-2 text-[0.65rem] font-semibold text-teal-700">
                  Tap to {bed.status === 'out_of_service' ? 'activate' : 'deactivate'}
                </p>
              ) : null}
            </TileTag>
          );
        })}
      </div>
    </div>
  );
}
