/** True when queue entry or patient should be treated as emergency priority. */
export function isEmergencyQueueEntry(entry) {
  return entry?.priority === 'emergency' || Boolean(entry?.patient?.is_emergency);
}

/** Stable sort: emergency first, then original order. */
export function sortQueueEmergencyFirst(entries) {
  return [...entries].sort((a, b) => {
    const ae = a.isEmergency ? 1 : 0;
    const be = b.isEmergency ? 1 : 0;
    if (ae !== be) return be - ae;
    return 0;
  });
}
