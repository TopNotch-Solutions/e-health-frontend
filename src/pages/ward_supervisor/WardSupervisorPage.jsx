import { useCallback, useEffect, useMemo, useState } from 'react';
import { createWard, getWardDashboard, getWards, updateBed } from '../../api/ward';
import CreateWardPanel from './components/CreateWardPanel';
import WardBedGrid from './components/WardBedGrid';
import WardSupervisorTopbar from './components/WardSupervisorTopbar';
import { useWardSupervisorSession } from './hooks/useWardSupervisorSession';
import { ws } from './styles/wardSupervisorClasses';

const KOPANO = 'https://kopanovertex.com/';

function WardIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-teal-300" aria-hidden>
      <path
        d="M4 20V6a2 2 0 012-2h12a2 2 0 012 2v14M8 20v-6h2v6M14 20v-4h2v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function aggregateStats(wards) {
  return (wards || []).reduce(
    (acc, w) => {
      const s = w.stats || {};
      acc.wards += 1;
      acc.total += s.total ?? w.total_beds ?? 0;
      acc.available += s.available ?? 0;
      acc.occupied += s.occupied ?? 0;
      acc.outOfService += s.out_of_service ?? 0;
      return acc;
    },
    { wards: 0, total: 0, available: 0, occupied: 0, outOfService: 0 }
  );
}

export default function WardSupervisorPage() {
  const { supervisorLabel, initials } = useWardSupervisorSession();

  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [view, setView] = useState('overview');
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [wardSearch, setWardSearch] = useState('');

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [wardType, setWardType] = useState('general');
  const [roomCount, setRoomCount] = useState('10');
  const [togglingBedId, setTogglingBedId] = useState(null);

  const loadWards = useCallback(async () => {
    setError('');
    try {
      const rows = await getWards();
      setWards(Array.isArray(rows) ? rows : []);
      return rows;
    } catch (err) {
      setError(err.message || 'Failed to load wards');
      setWards([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async (wardId) => {
    if (!wardId) {
      setDashboard(null);
      return;
    }
    setDashboardLoading(true);
    try {
      const data = await getWardDashboard(wardId);
      setDashboard(data);
    } catch (err) {
      setError(err.message || 'Failed to load ward details');
      setDashboard(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWards();
  }, [loadWards]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (view === 'ward' && selectedWardId) {
      loadDashboard(selectedWardId);
    }
  }, [view, selectedWardId, loadDashboard]);

  const facilityStats = useMemo(() => aggregateStats(wards), [wards]);

  const filteredWards = useMemo(() => {
    const q = wardSearch.trim().toLowerCase();
    if (!q) return wards;
    return wards.filter(
      (w) =>
        w.name?.toLowerCase().includes(q) ||
        w.ward_number?.toLowerCase().includes(q) ||
        w.ward_type?.toLowerCase().includes(q)
    );
  }, [wards, wardSearch]);

  function openWard(wardId) {
    setView('ward');
    setSelectedWardId(wardId);
    setError('');
  }

  function openCreate() {
    setView('create');
    setSelectedWardId(null);
    setDashboard(null);
    setName('');
    setWardNumber('');
    setWardType('general');
    setRoomCount('10');
    setError('');
  }

  function openOverview() {
    setView('overview');
    setSelectedWardId(null);
    setDashboard(null);
  }

  async function handleCreateWard(e) {
    e.preventDefault();
    const count = parseInt(roomCount, 10);
    if (!name.trim() || !wardNumber.trim()) {
      setError('Ward name and code are required.');
      return;
    }
    if (!Number.isFinite(count) || count < 1) {
      setError('Enter a valid number of rooms (at least 1).');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const result = await createWard({
        name: name.trim(),
        ward_number: wardNumber.trim(),
        ward_type: wardType,
        room_count: count,
      });
      setToast(`Ward ${wardNumber.trim()} created — ${count} active beds. Click beds to mark any inactive.`);
      await loadWards();
      const newId = result?.ward?.id;
      if (newId) openWard(newId);
      else openOverview();
    } catch (err) {
      setError(err.message || 'Failed to create ward');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleBed(bed) {
    if (bed.status === 'occupied' || bed.status === 'reserved') {
      setToast(
        bed.status === 'reserved'
          ? 'Bed is reserved for an incoming patient — cannot change status'
          : 'Cannot change status while a patient is on this bed'
      );
      return;
    }
    setTogglingBedId(bed.id);
    setError('');
    try {
      const updated = await updateBed(bed.id, {});
      const nextStatus = updated?.status;
      setToast(
        nextStatus === 'available'
          ? `Room ${bed.room_number} marked active`
          : `Room ${bed.room_number} marked inactive`
      );
      await loadDashboard(selectedWardId);
      await loadWards();
    } catch (err) {
      setError(err.message || 'Failed to update bed');
    } finally {
      setTogglingBedId(null);
    }
  }

  const selectedWard = wards.find((w) => w.id === selectedWardId);
  const dashStats = dashboard?.stats;

  return (
    <div className={ws.page}>
      <WardSupervisorTopbar supervisorLabel={supervisorLabel} initials={initials} />

      {toast ? (
        <div className={ws.toast} role="status">
          {toast}
        </div>
      ) : null}

      {error && view !== 'create' ? (
        <p className={ws.alert} role="alert">
          {error}
        </p>
      ) : null}

      <div className={ws.body}>
        <aside className={ws.queueAside} aria-label="Ward list">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className={ws.queueTitle}>Wards</h2>
              <p className={ws.queueSub}>
                <span className="font-bold text-teal-700">{facilityStats.wards}</span> at your
                facility
              </p>
            </div>
            <button type="button" className={`${ws.btnPrimary} !min-h-0 shrink-0 px-3 py-2 text-xs`} onClick={openCreate}>
              + New
            </button>
          </div>

          <div className={ws.searchWrap}>
            <label htmlFor="ws-ward-search" className="sr-only">
              Search wards
            </label>
            <input
              id="ws-ward-search"
              type="search"
              className={ws.searchInput}
              placeholder="Search by name or code"
              value={wardSearch}
              onChange={(e) => setWardSearch(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className={ws.queueList}>
            {loading ? (
              <p className={ws.hint}>Loading wards…</p>
            ) : filteredWards.length === 0 ? (
              <p className={ws.hint}>
                {wardSearch.trim() ? 'No wards match your search.' : 'No wards yet — create one.'}
              </p>
            ) : (
              filteredWards.map((w) => {
                const s = w.stats || {};
                const active = selectedWardId === w.id && view === 'ward';
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`${ws.wardCard} ${active ? ws.wardCardActive : ''}`}
                    onClick={() => openWard(w.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">{w.name}</p>
                      <span className={ws.wardTypePill}>{w.ward_type}</span>
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-teal-700">{w.ward_number}</p>
                    <div className={ws.miniStatRow}>
                      <span className={`${ws.miniStat} bg-emerald-100 text-emerald-800`}>
                        {s.available ?? 0} free
                      </span>
                      <span className={`${ws.miniStat} bg-amber-100 text-amber-900`}>
                        {s.occupied ?? 0} in use
                      </span>
                      <span className={`${ws.miniStat} bg-slate-200 text-slate-700`}>
                        {s.out_of_service ?? 0} inactive
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className={ws.main}>
          {view === 'create' ? (
            <div className={ws.workspaceScroll}>
            <CreateWardPanel
              name={name}
              onNameChange={setName}
              wardNumber={wardNumber}
              onWardNumberChange={setWardNumber}
              wardType={wardType}
              onWardTypeChange={setWardType}
              roomCount={roomCount}
              onRoomCountChange={setRoomCount}
              error={error}
              creating={creating}
              onSubmit={handleCreateWard}
              onCancel={openOverview}
            />
            </div>
          ) : view === 'ward' && selectedWard ? (
            <div className={ws.mainInner}>
              <div className={`${ws.hero} ${ws.wardInfoHeader}`}>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-teal-200">
                  {selectedWard.ward_number}
                </p>
                <h1 className={ws.heroTitle}>{dashboard?.ward?.name || selectedWard.name}</h1>
                <p className={ws.heroSub}>
                  {selectedWard.ward_type} ward · {dashStats?.total_beds ?? selectedWard.stats?.total ?? 0}{' '}
                  beds · click beds to mark active or inactive
                </p>
                <div className={ws.kpiGrid}>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{dashStats?.available ?? '—'}</p>
                    <p className={ws.kpiLabel}>Available</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{dashStats?.occupied ?? '—'}</p>
                    <p className={ws.kpiLabel}>Occupied</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{dashStats?.out_of_service ?? '—'}</p>
                    <p className={ws.kpiLabel}>Inactive</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{dashStats?.total_beds ?? '—'}</p>
                    <p className={ws.kpiLabel}>Total beds</p>
                  </div>
                </div>
              </div>

              <section className={`${ws.sectionPanel} flex min-h-0 flex-1 flex-col overflow-hidden`}>
                <div className={`${ws.panelHeader} shrink-0`}>
                  <div>
                    <h2 className={ws.sectionTitle}>Room & bed map</h2>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Click any empty bed to toggle active or inactive. Occupied beds show the patient.
                    </p>
                  </div>
                  <button type="button" className={ws.btnGhost} onClick={() => loadDashboard(selectedWardId)}>
                    Refresh
                  </button>
                </div>
                <div className={`${ws.workspaceScroll} mt-2 pr-1`}>
                  {dashboardLoading ? (
                    <p className={ws.hint}>Loading beds…</p>
                  ) : (
                    <WardBedGrid
                      beds={dashboard?.beds}
                      togglingBedId={togglingBedId}
                      onToggleBed={handleToggleBed}
                    />
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className={ws.mainInner}>
              <div className={`${ws.hero} ${ws.wardInfoHeader}`}>
                <h1 className={ws.heroTitle}>Ward operations</h1>
                <p className={ws.heroSub}>
                  Select a ward to view beds and occupancy, or create a new ward with rooms and beds in
                  one step.
                </p>
                <div className={ws.kpiGrid}>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{facilityStats.wards}</p>
                    <p className={ws.kpiLabel}>Wards</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{facilityStats.available}</p>
                    <p className={ws.kpiLabel}>Beds available</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{facilityStats.occupied}</p>
                    <p className={ws.kpiLabel}>Beds occupied</p>
                  </div>
                  <div className={ws.kpiCard}>
                    <p className={ws.kpiValue}>{facilityStats.outOfService}</p>
                    <p className={ws.kpiLabel}>Inactive</p>
                  </div>
                </div>
              </div>

              <div className={ws.workspaceScroll}>
                <div className={`${ws.idle} rounded-xl border border-dashed border-teal-200 bg-white`}>
                  <WardIcon />
                  <h3 className={ws.idleTitle}>Select a ward from the list</h3>
                  <p className={ws.idleText}>
                    Open a ward to see the bed map, or use <strong className="text-teal-700">+ New</strong>{' '}
                    to add a ward with rooms and beds.
                  </p>
                  <button type="button" className={`${ws.btnPrimary} mt-6 max-w-xs`} onClick={openCreate}>
                    Create new ward
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className={ws.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={ws.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Ward supervisor
      </footer>
    </div>
  );
}
