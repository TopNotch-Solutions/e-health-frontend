import { useMemo, useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { markMealDispensed, markMealPrepared } from '../../../api/kitchen';
import { dietTypeLabel } from '../../../constants/dietTypes';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { greenCard, greenOn } from '../../styles/cardSurfaces';

const MEAL_TABS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'all', label: 'All meals' },
];

function statusPill(row) {
  if (row.dispensed) {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Served</span>;
  }
  if (row.prepared) {
    return <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">Prepared</span>;
  }
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Pending</span>;
}

function MealCard({ row, actionLoading, onPrepared, onDispensed }) {
  return (
    <article className={`${greenCard} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={greenOn.titleSm}>
            {row.patient_name}
            <span className={`ml-2 font-normal ${greenOn.hint}`}>{row.patient_number}</span>
          </p>
          <p className={`mt-1 text-sm font-semibold ${greenOn.body}`}>{row.location_label}</p>
          <p className={`mt-0.5 text-xs capitalize ${greenOn.hint}`}>{row.meal_type}</p>
        </div>
        {statusPill(row)}
      </div>

      <dl className={`mt-3 grid gap-1 text-sm ${greenOn.body}`}>
        <div>
          <dt className={`text-xs font-bold uppercase tracking-wide ${greenOn.fieldLabel}`}>Diet</dt>
          <dd className="font-medium">{dietTypeLabel(row.diet_type)}</dd>
        </div>
        {row.diet_description ? (
          <div>
            <dt className={`text-xs font-bold uppercase tracking-wide ${greenOn.fieldLabel}`}>Notes</dt>
            <dd>{row.diet_description}</dd>
          </div>
        ) : null}
        {row.diet_restrictions ? (
          <div>
            <dt className={`text-xs font-bold uppercase tracking-wide ${greenOn.fieldLabel}`}>Restrictions</dt>
            <dd className="text-amber-900">{row.diet_restrictions}</dd>
          </div>
        ) : null}
        {row.diet_special_instructions ? (
          <div>
            <dt className={`text-xs font-bold uppercase tracking-wide ${greenOn.fieldLabel}`}>Special instructions</dt>
            <dd>{row.diet_special_instructions}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {!row.prepared ? (
          <button
            type="button"
            className={c.btnComplete}
            disabled={actionLoading}
            onClick={() => onPrepared(row.id)}
          >
            Mark prepared
          </button>
        ) : null}
        {row.prepared && !row.dispensed ? (
          <button
            type="button"
            className={c.btnSecondary}
            disabled={actionLoading}
            onClick={() => onDispensed(row.id)}
          >
            Mark served to ward
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function KitchenMealBoard({
  mealData,
  stats,
  loading,
  error,
  onRefresh,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const rows = useMemo(() => {
    if (!mealData?.plans) return [];
    if (activeTab === 'all') return mealData.orders || mealData.plans.all || [];
    return mealData.plans[activeTab] || [];
  }, [mealData, activeTab]);

  async function handlePrepared(id) {
    setActionLoading(true);
    setActionError('');
    try {
      await markMealPrepared(id);
      await onRefresh();
    } catch (err) {
      setActionError(err.message || 'Failed to update meal');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDispensed(id) {
    if (!(await confirmAction({
      title: 'Mark meal served?',
      text: 'Mark this meal as dispensed/served to the patient?',
      icon: 'question',
      confirmButtonText: 'Mark served',
    }))) return;
    setActionLoading(true);
    setActionError('');
    try {
      await markMealDispensed(id);
      await onRefresh();
    } catch (err) {
      setActionError(err.message || 'Failed to mark served');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {stats ? (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Meals today', value: stats.total_meals },
            { label: 'Pending prep', value: stats.pending },
            { label: 'Prepared', value: stats.prepared },
            { label: 'Served', value: stats.dispensed },
          ].map((k) => (
            <div key={k.label} className={`${greenCard} px-3 py-2`}>
              <p className={`text-2xl font-bold ${greenOn.fieldValue}`}>{k.value}</p>
              <p className={`text-xs ${greenOn.hint}`}>{k.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-2">
        {MEAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              activeTab === tab.id
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {mealData?.date ? (
          <span className="ml-auto self-center text-xs text-slate-500">Date: {mealData.date}</span>
        ) : null}
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      {actionError ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading inpatient meal orders…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
          No diet orders for this meal period. When a doctor admits a patient and prescribes a diet, orders
          appear here with ward and room.
        </p>
      ) : (
        <div className="grid gap-3 overflow-y-auto pb-6 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <MealCard
              key={row.id}
              row={row}
              actionLoading={actionLoading}
              onPrepared={handlePrepared}
              onDispensed={handleDispensed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
