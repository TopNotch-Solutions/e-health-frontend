import { getStoredUser } from '../../api/authSession';
import { layout as c } from '../doctor/styles/doctorLayoutClasses';
import KitchenMealBoard from '../kitchen/components/KitchenMealBoard';
import KitchenTopbar from '../kitchen/components/KitchenTopbar';
import { useKitchenMeals } from '../kitchen/hooks/useKitchenMeals';

const KOPANO = 'https://kopanovertex.com/';

export default function KitchenStaffPage() {
  const user = getStoredUser();
  const label =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Kitchen staff';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'KS';

  const { mealData, stats, loading, error, live, refresh } = useKitchenMeals();

  return (
    <div className={c.page}>
      <KitchenTopbar
        staffLabel={label}
        initials={initials}
        live={live}
        moduleTag="Kitchen · Meal service"
      />
      <main className={`${c.main} !max-w-none`}>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <header className="mb-4">
            <h1 className="text-xl font-bold text-slate-900">Today&apos;s meal board</h1>
            <p className="mt-1 text-sm text-slate-600">
              Today&apos;s inpatient diets — each card shows ward, room, bed, and dietary requirements.
            </p>
          </header>
          <KitchenMealBoard
            mealData={mealData}
            stats={stats}
            loading={loading}
            error={error}
            onRefresh={refresh}
          />
        </div>
      </main>
      <footer className={c.footer}>
        Health Management System | A digital solution by{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>
          Kopano-Vertex
        </a>{' '}
        | Kitchen staff
      </footer>
    </div>
  );
}
