import { formatDob, patientInitials } from '../patientUtils';
import { fo } from '../styles/frontOfficeModuleClasses';

function formatSex(sex) {
  if (!sex) return null;
  const value = String(sex).toLowerCase();
  if (value === 'm' || value === 'male') return 'Male';
  if (value === 'f' || value === 'female') return 'Female';
  if (value === 'other') return 'Other';
  return sex;
}

function SummaryField({ label, value, muted = false }) {
  const empty = !value || value === '—';
  return (
    <div className={fo.summaryItem}>
      <dt className={fo.summaryLabel}>{label}</dt>
      <dd className={empty ? fo.summaryValueMuted : fo.summaryValue}>{value || '—'}</dd>
    </div>
  );
}

function SummaryGroup({ title, children }) {
  return (
    <section className={fo.summaryGroup}>
      <h4 className={fo.summaryGroupTitle}>{title}</h4>
      <dl className={fo.summaryGrid}>{children}</dl>
    </section>
  );
}

export default function RegistrationSummaryCard({ draft, regionLabel }) {
  const fullName = [draft.first_name, draft.last_name].filter(Boolean).join(' ') || 'Patient';
  const sexLabel = formatSex(draft.sex);
  const dobLabel = formatDob(draft.date_of_birth);
  const isPrivate = draft.payment_type === 'private';
  const isEmergency = Boolean(draft.is_emergency);

  return (
    <article className={fo.summaryCard} aria-labelledby="fo-registration-summary-title">
      <div className={fo.summaryHero}>
        <div className={fo.summaryAvatar} aria-hidden>
          {patientInitials({ first_name: draft.first_name, last_name: draft.last_name })}
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="fo-registration-summary-title" className={fo.summaryHeroName}>
            {fullName}
          </h3>
          <p className={fo.summaryHeroMeta}>
            {sexLabel ? <span>{sexLabel}</span> : null}
            {sexLabel && dobLabel !== '—' ? <span className={fo.summaryHeroDot}>·</span> : null}
            {dobLabel !== '—' ? <span>{dobLabel}</span> : null}
            {!sexLabel && dobLabel === '—' ? <span className="text-slate-400">Details pending</span> : null}
          </p>
        </div>
      </div>

      <div className={fo.summaryBody}>
        <SummaryGroup title="Identity">
          <SummaryField label="National ID" value={draft.id_number} muted={!draft.id_number} />
          <SummaryField label="Sex" value={sexLabel} muted={!sexLabel} />
        </SummaryGroup>

        <SummaryGroup title="Contact">
          <SummaryField label="Primary phone" value={draft.phone} muted={!draft.phone} />
          <SummaryField label="Town / city" value={draft.city} muted={!draft.city} />
          <SummaryField label="Region" value={regionLabel !== '—' ? regionLabel : null} muted={regionLabel === '—'} />
        </SummaryGroup>

        <SummaryGroup title="Next of kin">
          <SummaryField
            label="Full name"
            value={draft.emergency_contact_name}
            muted={!draft.emergency_contact_name}
          />
          <SummaryField
            label="Emergency phone"
            value={draft.emergency_contact_phone}
            muted={!draft.emergency_contact_phone}
          />
        </SummaryGroup>

        <div className={fo.summaryBadges}>
          <span
            className={`${fo.summaryBadge} ${
              isPrivate ? fo.summaryBadgePrivate : fo.summaryBadgePublic
            }`}
          >
            {isPrivate ? 'Private healthcare' : 'Public healthcare'}
          </span>
          <span
            className={`${fo.summaryBadge} ${
              isEmergency ? fo.summaryBadgeEmergency : fo.summaryBadgeNormal
            }`}
          >
            {isEmergency ? 'Emergency case' : 'Routine case'}
          </span>
        </div>
      </div>
    </article>
  );
}
