import { useState } from 'react';
import { confirmAction } from '../../../utils/confirmAction';
import { IntakeInput, IntakeTextarea } from '../../nurse/components/IntakeField';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import { submitButtonClass } from '../../nurse/utils/submitButtonClasses';
import { updateArtPathway, completeArtSession } from '../../../api/hivArt';

const milestoneBtn = submitButtonClass('primary');

const STATE_ORDER = ['day_1', 'week_1', 'month_1', 'month_3_6', 'maintenance'];

function stateIndex(state) {
  return STATE_ORDER.indexOf(state);
}

function PathwayStepper({ episode }) {
  const current = stateIndex(episode.pathway_state);
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-1">
      {(episode.states || []).map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li
            key={s.value}
            className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-semibold sm:min-w-[100px] ${
              active
                ? 'border-teal-600 bg-teal-50 text-teal-900'
                : done
                  ? 'border-slate-200 bg-slate-50 text-slate-600'
                  : 'border-slate-100 bg-white text-slate-400'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wide opacity-70">
              {done ? '✓' : active ? '●' : idx + 1}
            </span>
            <span className="line-clamp-2">{s.label.split('—')[0].trim()}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function TreatmentPathwayPanel({
  episode,
  visitId,
  queueEntryId,
  onEpisodeUpdated,
  onSessionComplete,
  actionLoading,
  setActionLoading,
  setSubmitError,
}) {
  const [localForms, setLocalForms] = useState({});

  if (!episode) {
    return (
      <section className={c.sectionPanel}>
        <p className={c.hint}>No ART episode found for this visit. Patient may need a positive HIV test first.</p>
      </section>
    );
  }

  const { pathway_state: state, flags, pathway_data: data } = episode;
  const locked = state === 'day_1' && !data?.counseling_completed;

  function saveConfirmText(section, advance) {
    const texts = {
      counseling: 'Save counseling notes for this patient?',
      baseline_bloodwork: 'Save baseline bloodwork results?',
      initial_prescription: advance
        ? 'Save initial prescription and advance the pathway?'
        : 'Save initial prescription draft?',
      month_1_followup: 'Save month 1 follow-up and advance the pathway?',
      suppression_check: 'Confirm viral suppression and enter maintenance?',
      maintenance: 'Save maintenance follow-up details?',
    };
    return texts[section] || 'Save this ART pathway step?';
  }

  async function save(section, payload, advance = false) {
    if (!(await confirmAction({
      title: advance ? 'Save and continue?' : 'Save progress?',
      text: saveConfirmText(section, advance),
      icon: 'question',
      confirmButtonText: advance ? 'Save & continue' : 'Save',
    }))) return;
    setActionLoading(true);
    setSubmitError('');
    try {
      const updated = await updateArtPathway({
        visit_id: visitId,
        queue_entry_id: queueEntryId,
        section,
        data: payload,
        advance,
      });
      onEpisodeUpdated(updated);
      setLocalForms({});
    } catch (err) {
      setSubmitError(err.message || 'Failed to save pathway');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompleteSession() {
    if (!(await confirmAction({
      title: 'End queue session?',
      text: 'End ART queue session? Patient remains in maintenance follow-up.',
      icon: 'question',
      confirmButtonText: 'End session',
    }))) return;
    setActionLoading(true);
    setSubmitError('');
    try {
      await completeArtSession({ visit_id: visitId, queue_entry_id: queueEntryId });
      onSessionComplete();
    } catch (err) {
      setSubmitError(err.message || 'Could not complete session');
    } finally {
      setActionLoading(false);
    }
  }

  function field(key, subkey) {
    return localForms[key]?.[subkey] ?? '';
  }

  function setField(key, subkey, value) {
    setLocalForms((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [subkey]: value },
    }));
  }

  return (
    <div className="space-y-4">
      <section className={c.sectionPanel}>
        <h3 className={c.sectionTitle}>Treatment pathway</h3>
        <p className="mt-1 text-sm font-medium text-teal-800">{episode.pathway_state_label}</p>
        <p className="mt-1 text-xs text-slate-500">
          Day {flags?.daysSinceEnrollment ?? 0} since enrollment
          {flags?.month1Due && state === 'week_1' ? ' · Month 1 follow-up due soon' : ''}
          {flags?.suppressionWindowDue && state === 'month_1' ? ' · Suppression check window' : ''}
        </p>
        <div className="mt-4">
          <PathwayStepper episode={episode} />
        </div>
      </section>

      {state === 'day_1' && (
        <section className={`${c.sectionPanel} ${locked ? 'ring-2 ring-amber-200' : ''}`}>
          <h3 className={c.sectionTitle}>Day 1 — Counseling milestone</h3>
          <p className="mt-1 text-sm text-slate-500">
            Clinical actions are locked until supportive counseling and HIV education are documented.
          </p>
          {data?.counseling_completed ? (
            <p className="mt-3 text-sm font-semibold text-teal-700">
              ✓ Supportive Counseling &amp; HIV Education Completed
            </p>
          ) : (
            <>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600"
                  checked={!!localForms.counseling?.completed}
                  onChange={(e) => setField('counseling', 'completed', e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-800">
                  Supportive Counseling &amp; HIV Education Completed
                </span>
              </label>
              <IntakeTextarea
                id="art-counsel-notes"
                label="Counseling notes (optional)"
                className={`${c.textarea} mt-3`}
                rows={2}
                value={field('counseling', 'notes')}
                onChange={(e) => setField('counseling', 'notes', e.target.value)}
              />
              <button
                type="button"
                className={`${milestoneBtn} mt-6`}
                disabled={actionLoading || !localForms.counseling?.completed}
                onClick={() => save('counseling', localForms.counseling, true)}
              >
                {actionLoading ? 'Submitting…' : 'Complete milestone & advance to Week 1'}
              </button>
            </>
          )}
        </section>
      )}

      {state === 'week_1' && (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Week 1 — Baseline bloodwork &amp; Treat All</h3>
          <p className="mt-1 text-sm text-slate-500">Days 1–7: log baseline labs and issue initial 30-day ART.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IntakeInput
              id="art-cd4"
              label="CD4 count"
              type="number"
              className={c.input}
              value={field('bloodwork', 'cd4_count') || data?.baseline_bloodwork?.cd4_count || ''}
              onChange={(e) => setField('bloodwork', 'cd4_count', e.target.value)}
            />
            <IntakeInput
              id="art-vl"
              label="Initial viral load"
              className={c.input}
              value={field('bloodwork', 'viral_load') || data?.baseline_bloodwork?.viral_load || ''}
              onChange={(e) => setField('bloodwork', 'viral_load', e.target.value)}
            />
            <IntakeInput
              id="art-kidney"
              label="Kidney / liver panel"
              className={`${c.input} sm:col-span-2`}
              value={field('bloodwork', 'kidney_liver_panel') || data?.baseline_bloodwork?.kidney_liver_panel || ''}
              onChange={(e) => setField('bloodwork', 'kidney_liver_panel', e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${c.btnSecondary} mt-4`}
            disabled={actionLoading}
            onClick={() => save('baseline_bloodwork', localForms.bloodwork || data?.baseline_bloodwork || {})}
          >
            Save bloodwork
          </button>

          <hr className="my-6 border-slate-200" />
          <h4 className="text-sm font-bold text-slate-800">Initial prescription (30-day TLD)</h4>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <IntakeInput
              id="art-med"
              label="Medication"
              className={c.input}
              value={field('rx', 'medication') || data?.initial_prescription?.medication || 'TLD (Tenofovir/Lamivudine/Dolutegravir)'}
              onChange={(e) => setField('rx', 'medication', e.target.value)}
            />
            <IntakeInput
              id="art-supply"
              label="Supply (days)"
              type="number"
              className={c.input}
              value={field('rx', 'supply_days') || data?.initial_prescription?.supply_days || 30}
              onChange={(e) => setField('rx', 'supply_days', e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${c.btnSecondary} mt-4`}
            disabled={actionLoading}
            onClick={() => save('initial_prescription', {
              medication: field('rx', 'medication') || 'TLD (Tenofovir/Lamivudine/Dolutegravir)',
              supply_days: field('rx', 'supply_days') || 30,
              dosage: '1 tablet daily',
            })}
          >
            Save prescription
          </button>
          {episode.can_advance ? (
            <button
              type="button"
              className={`${milestoneBtn} mt-6`}
              disabled={actionLoading}
              onClick={() => save('initial_prescription', data?.initial_prescription || {}, true)}
            >
              {actionLoading ? 'Submitting…' : 'Advance to Month 1'}
            </button>
          ) : null}
        </section>
      )}

      {state === 'month_1' && (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Month 1 — Adherence &amp; tolerance</h3>
          {flags?.month1Due ? (
            <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
              4-week follow-up due
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <IntakeInput
              id="art-adherence"
              label="Adherence rate (%)"
              type="number"
              min={0}
              max={100}
              className={c.input}
              value={field('m1', 'adherence_rate')}
              onChange={(e) => setField('m1', 'adherence_rate', e.target.value)}
            />
            <IntakeTextarea
              id="art-timing"
              label="Timing hurdles"
              className={c.textarea}
              rows={2}
              value={field('m1', 'timing_hurdles')}
              onChange={(e) => setField('m1', 'timing_hurdles', e.target.value)}
            />
            <IntakeTextarea
              id="art-side"
              label="Side-effect tolerance"
              className={c.textarea}
              rows={2}
              value={field('m1', 'side_effects')}
              onChange={(e) => setField('m1', 'side_effects', e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${milestoneBtn} mt-6`}
            disabled={actionLoading}
            onClick={() => save('month_1_followup', localForms.m1 || {}, true)}
          >
            {actionLoading ? 'Submitting…' : 'Save follow-up & advance to suppression check'}
          </button>
        </section>
      )}

      {state === 'month_3_6' && (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Month 3–6 — Suppression check</h3>
          {flags?.suppressionWindowDue ? (
            <p className="mt-1 rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-800">
              Critical milestone: order and record follow-up viral load
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <IntakeInput
              id="art-fu-vl"
              label="Follow-up viral load"
              className={c.input}
              value={field('sup', 'followup_viral_load')}
              onChange={(e) => setField('sup', 'followup_viral_load', e.target.value)}
            />
            <IntakeInput
              id="art-fu-date"
              label="Result date"
              type="date"
              className={c.input}
              value={field('sup', 'followup_date')}
              onChange={(e) => setField('sup', 'followup_date', e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-teal-600"
                checked={!!localForms.sup?.viral_suppression_confirmed}
                onChange={(e) => setField('sup', 'viral_suppression_confirmed', e.target.checked)}
              />
              Viral suppression confirmed (undetectable)
            </label>
          </div>
          <button
            type="button"
            className={`${milestoneBtn} mt-6`}
            disabled={actionLoading || !localForms.sup?.viral_suppression_confirmed}
            onClick={() => save('suppression_check', localForms.sup || {}, true)}
          >
            {actionLoading ? 'Submitting…' : 'Confirm suppression & enter maintenance'}
          </button>
        </section>
      )}

      {state === 'maintenance' && (
        <section className={c.sectionPanel}>
          <h3 className={c.sectionTitle}>Long-term maintenance</h3>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring bloodwork every 6–12 months. Multi-month dispensing (3–6 months) unlocked.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IntakeInput
              id="art-monitor"
              label="Monitoring interval (months)"
              type="number"
              min={6}
              max={12}
              className={c.input}
              value={field('maint', 'monitoring_interval_months') || data?.maintenance?.monitoring_interval_months || 6}
              onChange={(e) => setField('maint', 'monitoring_interval_months', e.target.value)}
            />
            <IntakeInput
              id="art-dispense"
              label="Multi-month dispense (months)"
              type="number"
              min={3}
              max={6}
              className={c.input}
              value={field('maint', 'multi_month_dispense_months') || data?.maintenance?.multi_month_dispense_months || 3}
              onChange={(e) => setField('maint', 'multi_month_dispense_months', e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`${c.btnSecondary} mt-4`}
            disabled={actionLoading}
            onClick={() => save('maintenance', {
              monitoring_interval_months: field('maint', 'monitoring_interval_months') || 6,
              multi_month_dispense_months: field('maint', 'multi_month_dispense_months') || 3,
            })}
          >
            Save maintenance plan
          </button>
          <button
            type="button"
            className={`${milestoneBtn} mt-6`}
            disabled={actionLoading}
            onClick={handleCompleteSession}
          >
            {actionLoading ? 'Submitting…' : 'Complete ART queue session'}
          </button>
        </section>
      )}

      {episode.advance_block_reason && !episode.can_advance && state !== 'maintenance' ? (
        <p className="text-xs text-slate-500">{episode.advance_block_reason}</p>
      ) : null}
    </div>
  );
}
