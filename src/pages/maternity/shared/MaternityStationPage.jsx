import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { confirmAction, confirmReturnToQueue, confirmStartPatientSession } from '../../../utils/confirmAction';
import { startQueueEntry, releaseQueueEntry } from '../../../api/queue';
import {
  registerMaternityPatient,
  routeFromMaternityFrontOffice,
  completeAncSession,
  signOffAnwDaily,
  signOffPnwDaily,
  signOffIcuDaily,
  registerNewborn,
  getMaternityEpisode,
  getAncSessions,
  getMaternityStateHospitals,
} from '../../../api/maternity';
import ActiveSessionQueueAside from '../../../components/queue/ActiveSessionQueueAside';
import MaternityMedicalHistoryPanel from '../../../components/patient/MaternityMedicalHistoryPanel';
import { sortQueueEmergencyFirst } from '../../../utils/queueDisplay';
import { nurse as c } from '../../nurse/styles/nurseClasses';
import {
  EMPTY_ANC_FORM,
  EMPTY_ANW_FORM,
  EMPTY_PNW_FORM,
  EMPTY_ICU_FORM,
  EMPTY_NICU_FORM,
  EMPTY_REGISTRATION,
} from './departmentConfig';
import { buildAncSessionRequest } from './ancFormUtils';
import { validateClinicalForm, validateFrontOfficeForm } from './maternityFormValidation';
import {
  MaternityTopbar,
  AncForm,
  AnwForm,
  PnwForm,
  IcuForm,
  NicuForm,
  FrontOfficeForm,
} from './MaternityForms';
import {
  useMaternityQueue,
  useMaternitySession,
  pickAutoResumeEntry,
} from './useMaternityQueue';

const KOPANO = 'https://kopanovertex.com/';

const EMPTY_FORMS = {
  anc: EMPTY_ANC_FORM,
  anw: EMPTY_ANW_FORM,
  pnw: EMPTY_PNW_FORM,
  icu: EMPTY_ICU_FORM,
  nicu: EMPTY_NICU_FORM,
};

export default function MaternityStationPage({ stationConfig }) {
  const { nurseLabel, initials, userId } = useMaternitySession();
  const { department, title, queueLabel, moduleLabel, formType, isFrontOffice } = stationConfig;

  const [queueSearch, setQueueSearch] = useState('');
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [form, setForm] = useState(isFrontOffice ? EMPTY_REGISTRATION : (EMPTY_FORMS[formType] || {}));
  const [episodeInfo, setEpisodeInfo] = useState(null);
  const [ancContext, setAncContext] = useState(null);
  const [stateHospitals, setStateHospitals] = useState([]);
  const [stateHospitalsLoading, setStateHospitalsLoading] = useState(false);
  const [stateHospitalsError, setStateHospitalsError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const skipAutoResumeRef = useRef(false);

  const onQueueSynced = useCallback(
    (mapped) => {
      if (skipAutoResumeRef.current) {
        skipAutoResumeRef.current = false;
        return;
      }
      const mine = pickAutoResumeEntry(mapped, userId);
      if (mine) setActiveEntryId((prev) => prev || mine.entryId);
    },
    [userId]
  );

  const { queue, setQueue, loading, error: queueLoadError, live, refresh } = useMaternityQueue(
    department,
    { onQueueSynced }
  );

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const activePatient = useMemo(
    () => queue.find((p) => p.entryId === activeEntryId) || null,
    [queue, activeEntryId]
  );

  useEffect(() => {
    if (!activePatient?.visitId || !formType || formType === 'nicu') {
      setEpisodeInfo(null);
      return undefined;
    }
    let cancelled = false;
    getMaternityEpisode(activePatient.visitId)
      .then((data) => { if (!cancelled) setEpisodeInfo(data); })
      .catch(() => { if (!cancelled) setEpisodeInfo(null); });
    return () => { cancelled = true; };
  }, [activePatient?.visitId, formType]);

  useEffect(() => {
    if (formType !== 'anc') {
      setStateHospitals([]);
      setStateHospitalsError('');
      return undefined;
    }
    let cancelled = false;
    setStateHospitalsLoading(true);
    getMaternityStateHospitals()
      .then((rows) => {
        if (!cancelled) setStateHospitals(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setStateHospitals([]);
          setStateHospitalsError(err.message || 'Could not load state hospitals');
        }
      })
      .finally(() => {
        if (!cancelled) setStateHospitalsLoading(false);
      });
    return () => { cancelled = true; };
  }, [formType]);

  useEffect(() => {
    if (!activePatient?.visitId || formType !== 'anc') {
      setAncContext(null);
      return undefined;
    }
    let cancelled = false;
    getAncSessions(activePatient.visitId)
      .then((data) => {
        if (!cancelled) {
          setAncContext({
            is_first_visit: data.is_first_visit,
            hiv_positive_on_record: data.hiv_positive_on_record,
            hiv_recorded_session_number: data.hiv_recorded_session_number,
            hiv_recorded_at: data.hiv_recorded_at,
            session_count: data.sessions?.length || 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setAncContext(null);
      });
    return () => { cancelled = true; };
  }, [activePatient?.visitId, formType]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    const list = q
      ? queue.filter(
        (p) =>
          p.name.toLowerCase().includes(q)
          || p.patientIdLabel.toLowerCase().includes(q)
      )
      : queue;
    return sortQueueEmergencyFirst(list);
  }, [queue, queueSearch]);

  const workspaceActive =
    activePatient
    && activePatient.status === 'in_progress'
    && activePatient.assignedToId === userId;

  function handleFieldChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError('');
  }

  async function handleSelectPatient(patient) {
    if (patient.status === 'in_progress' && patient.assignedToId && patient.assignedToId !== userId) return;
    if (actionLoading) return;
    if (workspaceActive && patient.entryId !== activeEntryId) return;

    const starting = patient.status === 'pending';
    if (!(await confirmStartPatientSession(patient.name, starting))) return;

    setActionLoading(true);
    setQueueActionError('');
    try {
      if (patient.status === 'pending') {
        await startQueueEntry(patient.entryId);
        await refresh();
        setForm(isFrontOffice ? EMPTY_REGISTRATION : (EMPTY_FORMS[formType] || {}));
        setSubmitError('');
      }
      setActiveEntryId(patient.entryId);
    } catch (err) {
      setQueueActionError(err.message || 'Could not open patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFrontOfficeRegister() {
    if (actionLoading) return;
    const validationError = validateFrontOfficeForm(form);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    setActionLoading(true);
    setSubmitError('');
    try {
      const regRes = await registerMaternityPatient(form);
      const patient = regRes?.patient;
      await routeFromMaternityFrontOffice({
        patient_id: patient?.id,
        routing_destination: form.routing_destination,
      });
      setToast(`${form.first_name} ${form.last_name} registered and routed`);
      setForm(EMPTY_REGISTRATION);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleFrontOfficeRoute() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmAction({
      title: 'Route patient?',
      text: `Send ${activePatient.name} to ${form.routing_destination === 'maternity_anw' ? 'ANW' : 'ANC'}?`,
      icon: 'question',
      confirmButtonText: 'Route',
    }))) return;

    setActionLoading(true);
    setSubmitError('');
    try {
      const entryId = activePatient.entryId;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);
      await routeFromMaternityFrontOffice({
        visit_id: activePatient.visitId,
        queue_entry_id: entryId,
        routing_destination: form.routing_destination || 'maternity_anc',
      });
      setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
      setToast(`${activePatient.name} routed`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Routing failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClinicalSubmit() {
    if (!activePatient || actionLoading) return;

    const validationError = validateClinicalForm(formType, form, ancContext);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    const base = {
      visit_id: activePatient.visitId,
      queue_entry_id: activePatient.entryId,
    };

    setActionLoading(true);
    setSubmitError('');
    try {
      const entryId = activePatient.entryId;
      const patientName = activePatient.name;
      skipAutoResumeRef.current = true;
      setActiveEntryId(null);

      if (formType === 'anc') {
        const result = await completeAncSession(buildAncSessionRequest(form, base));
        setForm(EMPTY_FORMS.anc);
        setAncContext(null);
        setEpisodeInfo(null);
        setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
        setToast(
          result?.discharged
            ? `${patientName} — ANC complete, visit closed`
            : `${patientName} — ANC session complete`
        );
        await refresh();
        return;
      }

      if (formType === 'anw') {
        await signOffAnwDaily({
          ...base,
          is_admission_day: form.is_admission_day,
          admission_reason: form.admission_reason,
          mode_of_arrival: form.mode_of_arrival,
          vitals: {
            temperature: form.temperature,
            pulse: form.pulse,
            respiration: form.respiration,
            blood_pressure: form.blood_pressure,
            urine: form.urine,
          },
          abdominal_update: {
            height_of_fundus: form.height_of_fundus,
            lie: form.lie,
            presentation: form.presentation,
            position: form.position,
          },
          active_labour: {
            cervical_dilation: form.cervical_dilation,
            effacement: form.effacement,
            foetal_heart_rate: form.foetal_heart_rate,
            contractions: form.contractions,
          },
          serial_progress: {
            clinical_assessment: form.clinical_assessment,
            treatment_alteration: form.treatment_alteration,
          },
          routing_destination: form.routing_destination || null,
        });
      } else if (formType === 'pnw') {
        await signOffPnwDaily({
          ...base,
          is_post_delivery_day: form.is_post_delivery_day,
          delivery_type: form.delivery_type,
          post_op_recovery: form.post_op_recovery,
          vitals: {
            temperature: form.temperature,
            pulse: form.pulse,
            respiration: form.respiration,
            systolic_bp: form.systolic_bp,
            diastolic_bp: form.diastolic_bp,
          },
          uterine_index: { fundal_height: form.fundal_height },
          physiological_output: {
            lochia_status: form.lochia_status,
            perineum_site: form.perineum_site,
            urine_passed: form.urine_passed,
            bowels: form.bowels,
          },
          breast_examination: {
            breast: form.breast_examination,
            lower_limb_screening: form.lower_limb_screening,
          },
          routing_destination: form.routing_destination || null,
          feeding_counselling_done: form.feeding_counselling_done,
          six_week_follow_up_date: form.six_week_follow_up_date || null,
        });
      } else if (formType === 'icu') {
        await signOffIcuDaily({
          ...base,
          extreme_indicators: {
            eclampsia_coma: form.eclampsia_coma,
            hellp_syndrome: form.hellp_syndrome,
            dic: form.dic,
            septic_shock: form.septic_shock,
          },
          continuous_parameters: {
            inotropic_support: form.inotropic_support,
            blood_gas_analysis: form.blood_gas_analysis,
            central_venous_pressure: form.central_venous_pressure,
          },
          multiple_origin_tracking: {
            renal_dialysis_metric: form.renal_dialysis_metric,
            advanced_neurological_state: form.advanced_neurological_state,
          },
          routing_destination: form.routing_destination || null,
        });
      } else if (formType === 'nicu') {
        await registerNewborn({
          ...base,
          date_time_of_birth: form.date_time_of_birth,
          sex: form.sex,
          name: form.name,
          gestation_weeks: form.gestation_weeks,
          clinical_status: { notes: form.clinical_status },
          apgar_matrix: {
            minute_1: form.apgar_1min,
            minute_5: form.apgar_5min,
            minute_10: form.apgar_10min,
          },
        });
      }

      setForm(EMPTY_FORMS[formType] || {});
      setQueue((prev) => prev.filter((p) => p.entryId !== entryId));
      setToast(`${activePatient.name} — record saved`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save record');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReturnToQueue() {
    if (!activePatient || actionLoading) return;
    if (!(await confirmReturnToQueue(activePatient.name))) return;
    setActionLoading(true);
    try {
      skipAutoResumeRef.current = true;
      await releaseQueueEntry(activePatient.entryId);
      setActiveEntryId(null);
      setForm(isFrontOffice ? EMPTY_REGISTRATION : (EMPTY_FORMS[formType] || {}));
      setToast(`${activePatient.name} returned to queue`);
      await refresh();
    } catch (err) {
      setSubmitError(err.message || 'Could not return to queue');
    } finally {
      setActionLoading(false);
    }
  }

  function renderForm() {
    if (isFrontOffice && !workspaceActive) {
      return (
        <FrontOfficeForm
          form={form}
          onChange={handleFieldChange}
          onSubmit={handleFrontOfficeRegister}
          loading={actionLoading}
        />
      );
    }
    if (isFrontOffice && workspaceActive) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Route this registered patient to ANC (outpatient) or ANW (inpatient admission).
          </p>
          <FrontOfficeForm
            form={form}
            onChange={handleFieldChange}
            onSubmit={handleFrontOfficeRoute}
            loading={actionLoading}
          />
        </div>
      );
    }
    if (formType === 'anc') {
      return (
        <AncForm
          form={form}
          onChange={handleFieldChange}
          onSubmit={handleClinicalSubmit}
          loading={actionLoading}
          ancContext={ancContext}
          stateHospitals={stateHospitals}
          stateHospitalsLoading={stateHospitalsLoading}
          stateHospitalsError={stateHospitalsError}
        />
      );
    }
    if (formType === 'anw') return <AnwForm form={form} onChange={handleFieldChange} onSubmit={handleClinicalSubmit} loading={actionLoading} />;
    if (formType === 'pnw') return <PnwForm form={form} onChange={handleFieldChange} onSubmit={handleClinicalSubmit} loading={actionLoading} />;
    if (formType === 'icu') return <IcuForm form={form} onChange={handleFieldChange} onSubmit={handleClinicalSubmit} loading={actionLoading} />;
    if (formType === 'nicu') return <NicuForm form={form} onChange={handleFieldChange} onSubmit={handleClinicalSubmit} loading={actionLoading} />;
    return null;
  }

  const missingDaily = episodeInfo?.has_missing_daily;
  const missingDates = episodeInfo?.missing_daily_dates || [];

  return (
    <div className={c.page}>
      <MaternityTopbar title={title} nurseLabel={nurseLabel} initials={initials} live={live} />
      {toast ? <div className={c.toast} role="status">{toast}</div> : null}

      <div className={c.body}>
        <aside className={c.queueAside} aria-label={queueLabel}>
          <h2 className={c.queueTitle}>{queueLabel}</h2>
          <p className={c.queueSub}>
            <span className={c.queueCount}>{queue.length}</span> patient{queue.length === 1 ? '' : 's'}
          </p>

          {workspaceActive ? (
            <ActiveSessionQueueAside
              classes={c}
              badge="In progress"
              title="Active session"
              message="Complete the form and sign off, or return to queue."
            />
          ) : (
            <>
              <div className={c.searchWrap}>
                <input
                  type="search"
                  className={c.searchInput}
                  placeholder="Search by name or ID…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                />
              </div>
              {queueLoadError ? <p className={`${c.hint} text-red-600`} role="alert">{queueLoadError}</p> : null}
              <div className={c.queueList}>
                {loading ? (
                  <p className={c.hint}>Loading…</p>
                ) : filteredQueue.length === 0 ? (
                  <p className={c.hint}>No patients in queue.</p>
                ) : (
                  filteredQueue.map((p) => (
                    <article
                      key={p.entryId}
                      role="button"
                      tabIndex={0}
                      className={`${c.queueCard} cursor-pointer ${p.entryId === activeEntryId ? c.queueCardActive : ''}`}
                      onClick={() => handleSelectPatient(p)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectPatient(p); } }}
                    >
                      <p className={c.queueName}>{p.name}</p>
                      <p className={c.queueMeta}>{p.sexAge}</p>
                      <p className={c.queueId}>{p.patientIdLabel}</p>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </aside>

        <div className={c.main}>
          {!workspaceActive && !isFrontOffice ? (
            <div className={c.idle}>
              <h3 className={c.idleTitle}>No patient selected</h3>
              <p className={c.idleText}>Select a patient from the {queueLabel.toLowerCase()}.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {workspaceActive ? (
                <div className={`${c.banner} shrink-0`}>
                  <div>
                    <span className={c.bannerLabel}>Active patient</span>
                    <strong className={c.bannerValue}>{activePatient.name}</strong>
                  </div>
                  <div>
                    <span className={c.bannerLabel}>Demographics</span>
                    <strong className={c.bannerValue}>{activePatient.sexAge}</strong>
                  </div>
                  <div>
                    <span className={c.bannerLabel}>Patient ID</span>
                    <strong className={c.bannerValue}>{activePatient.patientIdLabel.replace('ID: ', '')}</strong>
                  </div>
                </div>
              ) : null}

              {missingDaily ? (
                <div className="mx-0 mb-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
                  <strong>Missing daily update</strong> — no record for: {missingDates.join(', ')}
                </div>
              ) : null}

              <div className={c.formScroll}>
                {workspaceActive && activePatient?.patient?.id ? (
                  <MaternityMedicalHistoryPanel patientId={activePatient.patient.id} />
                ) : null}
                {renderForm()}
                {workspaceActive && !isFrontOffice ? (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <button type="button" className={c.btnSecondary} disabled={actionLoading} onClick={handleReturnToQueue}>
                      Return to queue
                    </button>
                  </div>
                ) : null}
                {submitError ? <p className={c.submitError} role="alert">{submitError}</p> : null}
              </div>
            </div>
          )}

          {isFrontOffice && !workspaceActive ? (
            <div className={c.formScroll}>{renderForm()}</div>
          ) : null}
        </div>
      </div>

      <footer className={c.footer}>
        Health Management System | {moduleLabel} |{' '}
        <a href={KOPANO} target="_blank" rel="noopener noreferrer" className={c.footerLink}>Kopano-Vertex</a>
      </footer>
    </div>
  );
}
