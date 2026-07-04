import { admin as c, facilityTypeLabel, isOperationalFacility } from '../styles/adminClasses';
import FacilityBillingFeesPanel from '../components/FacilityBillingFeesPanel';
import NationalBillingPricesPanel from '../components/NationalBillingPricesPanel';

const PRICE_MANAGED_TYPES = new Set(['clinic', 'hospital', 'health_center']);

export default function BillingPricesView({
  facilities,
  loading,
  view,
  selectedFacility,
  onViewChange,
  onSelectFacility,
}) {
  const clinics = (facilities || []).filter(
    (f) => isOperationalFacility(f) && f.type === 'clinic'
  );
  const hospitals = (facilities || []).filter(
    (f) => isOperationalFacility(f) && (f.type === 'hospital' || f.type === 'health_center')
  );

  if (view === 'national-clinic') {
    return (
      <NationalBillingPricesPanel
        scope="clinic"
        title="National clinic prices"
        description="Default clinic visit fee applied to all clinics unless a clinic has its own override."
        onBack={() => onViewChange('home')}
      />
    );
  }

  if (view === 'national-hospital') {
    return (
      <NationalBillingPricesPanel
        scope="hospital"
        title="National hospital prices"
        description="Default admission fee and department visit charges for all hospitals unless a hospital sets its own override."
        onBack={() => onViewChange('home')}
      />
    );
  }

  if (view === 'clinic-overrides') {
    if (selectedFacility) {
      return (
        <div>
          <FacilityBillingFeesPanel
            facilityId={selectedFacility.id}
            facilityType={selectedFacility.type}
            facilityName={selectedFacility.name}
          />
          <button type="button" className={`${c.btnGhost} mt-4`} onClick={() => onSelectFacility(null)}>
            ← Back to clinics
          </button>
        </div>
      );
    }

    return (
      <FacilityOverrideList
        title="Clinic price overrides"
        description="Set a custom clinic visit fee for individual clinics. Clinics without an override use the national default."
        facilities={clinics}
        loading={loading}
        onBack={() => onViewChange('home')}
        onSelect={onSelectFacility}
        emptyMessage="No clinics available."
      />
    );
  }

  if (view === 'hospital-overrides') {
    if (selectedFacility) {
      return (
        <div>
          <FacilityBillingFeesPanel
            facilityId={selectedFacility.id}
            facilityType={selectedFacility.type}
            facilityName={selectedFacility.name}
          />
          <button type="button" className={`${c.btnGhost} mt-4`} onClick={() => onSelectFacility(null)}>
            ← Back to hospitals
          </button>
        </div>
      );
    }

    return (
      <FacilityOverrideList
        title="Hospital price overrides"
        description="Set custom admission and department visit fees for individual hospitals. Hospitals without overrides use national defaults."
        facilities={hospitals}
        loading={loading}
        onBack={() => onViewChange('home')}
        onSelect={onSelectFacility}
        emptyMessage="No hospitals available."
      />
    );
  }

  return (
    <div>
      <div className={`${c.card} mb-3`}>
        <h2 className={c.cardTitle}>Billing prices</h2>
        <p className={c.cardDesc}>
          National defaults apply to every clinic and hospital. Override prices per facility when needed. All changes require a reason and are audited.
        </p>
      </div>

      <div className={c.metricGrid}>
        <PricingCard
          title="National clinic prices"
          description="Clinic visit fee — all activities (NAD) for every clinic."
          actionLabel="Manage national clinic prices"
          onClick={() => onViewChange('national-clinic')}
        />
        <PricingCard
          title="National hospital prices"
          description="Admission fee and department visit charges for every hospital."
          actionLabel="Manage national hospital prices"
          onClick={() => onViewChange('national-hospital')}
        />
        <PricingCard
          title="Clinic overrides"
          description="Optional clinic visit fee for a specific clinic."
          actionLabel="Choose a clinic"
          onClick={() => onViewChange('clinic-overrides')}
        />
        <PricingCard
          title="Hospital overrides"
          description="Optional admission and department fees for a specific hospital."
          actionLabel="Choose a hospital"
          onClick={() => onViewChange('hospital-overrides')}
        />
      </div>
    </div>
  );
}

function PricingCard({ title, description, actionLabel, onClick }) {
  return (
    <article className={c.metricCard}>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-emerald-50">{description}</p>
      <button type="button" className={`${c.btnSecondary} mt-4`} onClick={onClick}>
        {actionLabel}
      </button>
    </article>
  );
}

function FacilityOverrideList({
  title,
  description,
  facilities,
  loading,
  onBack,
  onSelect,
  emptyMessage,
}) {
  return (
    <div>
      <div className={`${c.card} mb-3`}>
        <button
          type="button"
          className="mb-2 font-semibold text-white underline decoration-white/40 hover:decoration-white"
          onClick={onBack}
        >
          ← Back
        </button>
        <h2 className={c.cardTitle}>{title}</h2>
        <p className={c.cardDesc}>{description}</p>
      </div>

      {loading ? (
        <p className={c.cardBody}>Loading facilities…</p>
      ) : facilities.length === 0 ? (
        <div className={c.card}>
          <p className={c.cardBody}>{emptyMessage}</p>
        </div>
      ) : (
        <div className={c.facilityGrid}>
          {facilities.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${c.facilityCard} cursor-pointer text-left transition hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/40`}
              onClick={() => onSelect(f)}
            >
              <h3 className={c.cardTitle}>{f.name}</h3>
              <p className={c.cardDesc}>{f.location || '—'}</p>
              <p className="mt-3 text-xs font-semibold text-teal-100">
                {facilityTypeLabel(f.type)} · Manage overrides →
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
