import { useCallback, useEffect, useState } from 'react';
import { admin as c } from '../styles/adminClasses';

function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `NAD ${Number(value).toFixed(2)}`;
}

function formatFeeValue(fee, value) {
  if (fee?.value_kind === 'minutes') {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return `${Math.round(Number(value))} min`;
  }
  return formatMoney(value);
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function BillingFeeEditor({
  title,
  description,
  onBack,
  loadFees,
  loadHistory,
  saveFee,
  showNationalColumn = true,
  showOverrideColumn = false,
  showEffectiveColumn = true,
  currentColumnLabel = 'Current (NAD)',
  newPriceColumnLabel = 'New price (NAD)',
  historyTitle = 'Price change history',
  historyDescription,
  reasonLabel = 'Reason for price change *',
  reasonPlaceholder = 'e.g. Annual tariff adjustment approved by ministry',
  allowResetToNational = false,
  onResetToNational,
}) {
  const [fees, setFees] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingKey, setSubmittingKey] = useState('');
  const [draftAmounts, setDraftAmounts] = useState({});
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feePayload, historyPayload] = await Promise.all([loadFees(), loadHistory()]);
      const rows = Array.isArray(feePayload?.fees) ? feePayload.fees : [];
      setFees(rows);
      setDraftAmounts(Object.fromEntries(rows.map((row) => [
        row.fee_key,
        row.value_kind === 'minutes'
          ? String(Math.round(Number(row.amount)))
          : String(row.amount),
      ])));
      setHistory(Array.isArray(historyPayload?.history) ? historyPayload.history : []);
    } catch (err) {
      setError(err.message || 'Failed to load billing prices');
      setFees([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [loadFees, loadHistory]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(fee) {
    const amount = draftAmounts[fee.fee_key];
    if (!String(reason).trim()) {
      setError('Enter a reason for the price change.');
      return;
    }
    if (amount === '' || Number.isNaN(Number(amount)) || Number(amount) < 0) {
      setError('Enter a valid price.');
      return;
    }
    if (fee.value_kind === 'minutes') {
      const minutes = Math.round(Number(amount));
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) {
        setError('Enter a billing interval between 1 and 240 minutes.');
        return;
      }
    }

    setSubmittingKey(fee.fee_key);
    setError('');
    try {
      const payloadAmount = fee.value_kind === 'minutes'
        ? Math.round(Number(amount))
        : Number(amount);
      await saveFee(fee.fee_key, {
        amount: payloadAmount,
        reason: reason.trim(),
      });
      setReason('');
      await load();
    } catch (err) {
      setError(err.message || 'Could not update price');
    } finally {
      setSubmittingKey('');
    }
  }

  async function handleReset(fee) {
    if (!String(reason).trim()) {
      setError('Enter a reason for resetting to the national default.');
      return;
    }
    setSubmittingKey(`reset:${fee.fee_key}`);
    setError('');
    try {
      await onResetToNational(fee.fee_key, { reason: reason.trim() });
      setReason('');
      await load();
    } catch (err) {
      setError(err.message || 'Could not reset price');
    } finally {
      setSubmittingKey('');
    }
  }

  function saveDisabled(fee) {
    if (!reason.trim()) return true;
    const draft = draftAmounts[fee.fee_key];
    if (fee.value_kind === 'minutes') {
      return Math.round(Number(draft)) === Math.round(Number(fee.amount));
    }
    return draft === String(fee.amount);
  }

  const hasMinuteFees = fees.some((fee) => fee.value_kind === 'minutes');
  const effectiveColumnLabel = hasMinuteFees ? 'Current value' : currentColumnLabel;
  const newValueColumnLabel = hasMinuteFees ? 'New value' : newPriceColumnLabel;

  return (
    <div>
      {onBack ? (
        <button type="button" className={`${c.btnGhost} mb-2`} onClick={onBack}>
          ← Back
        </button>
      ) : null}

      <section className={c.chartPanel}>
        <h3 className={c.sectionTitle}>{title}</h3>
        <p className={c.sectionDesc}>{description}</p>

        {error ? <p className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}

        {loading ? (
          <p className="mt-3 text-sm text-slate-600">Loading prices…</p>
        ) : fees.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No configurable prices.</p>
        ) : (
          <>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <label className={c.label} htmlFor="billing-fee-reason">{reasonLabel}</label>
              <textarea
                id="billing-fee-reason"
                className={c.input}
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
              />
            </div>

            <div className={`${c.whiteTableWrap} mt-4`}>
              <table className={c.whiteTable}>
                <thead>
                  <tr>
                    <th className={c.whiteTh}>Fee</th>
                    {showNationalColumn ? <th className={c.whiteTh}>National default</th> : null}
                    {showEffectiveColumn ? <th className={c.whiteTh}>{effectiveColumnLabel}</th> : null}
                    {showOverrideColumn ? <th className={c.whiteTh}>Override</th> : null}
                    <th className={c.whiteTh}>{newValueColumnLabel}</th>
                    <th className={c.whiteTh} />
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.fee_key}>
                      <td className={c.whiteTd}>{fee.label}</td>
                      {showNationalColumn ? (
                        <td className={c.whiteTdMuted}>{formatFeeValue(fee, fee.national_amount)}</td>
                      ) : null}
                      {showEffectiveColumn ? (
                        <td className={c.whiteTd}>
                          {formatFeeValue(fee, fee.amount)}
                          {fee.has_override ? (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-900">
                              Override
                            </span>
                          ) : (
                            <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-[0.65rem] font-semibold text-teal-900">
                              National
                            </span>
                          )}
                        </td>
                      ) : null}
                      {showOverrideColumn ? (
                        <td className={c.whiteTdMuted}>
                          {fee.has_override ? formatFeeValue(fee, fee.override_amount) : '—'}
                        </td>
                      ) : null}
                      <td className={c.whiteTd}>
                        <input
                          type="number"
                          min={fee.value_kind === 'minutes' ? '1' : '0'}
                          max={fee.value_kind === 'minutes' ? '240' : undefined}
                          step={fee.value_kind === 'minutes' ? '1' : '0.01'}
                          className={c.input}
                          value={draftAmounts[fee.fee_key] ?? ''}
                          onChange={(e) => setDraftAmounts((prev) => ({
                            ...prev,
                            [fee.fee_key]: e.target.value,
                          }))}
                        />
                      </td>
                      <td className={c.whiteTd}>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={c.btnPrimary}
                            disabled={submittingKey === fee.fee_key || saveDisabled(fee)}
                            onClick={() => handleSave(fee)}
                          >
                            {submittingKey === fee.fee_key ? 'Saving…' : 'Save'}
                          </button>
                          {allowResetToNational && fee.has_override ? (
                            <button
                              type="button"
                              className={c.btnSecondary}
                              disabled={submittingKey === `reset:${fee.fee_key}` || !reason.trim()}
                              onClick={() => handleReset(fee)}
                            >
                              {submittingKey === `reset:${fee.fee_key}` ? 'Resetting…' : 'Use national'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-bold text-slate-900">{historyTitle}</h4>
          {historyDescription ? (
            <p className="mt-1 text-xs text-slate-600">{historyDescription}</p>
          ) : null}
          {history.length ? (
            <div className={`${c.whiteTableWrap} mt-3`}>
              <table className={c.whiteTable}>
                <thead>
                  <tr>
                    <th className={c.whiteTh}>Date</th>
                    <th className={c.whiteTh}>Fee</th>
                    <th className={c.whiteTh}>Previous</th>
                    <th className={c.whiteTh}>New</th>
                    <th className={c.whiteTh}>Reason</th>
                    <th className={c.whiteTh}>Changed by</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className={c.whiteTdMuted}>{formatDateTime(item.created_at)}</td>
                      <td className={c.whiteTd}>{item.fee_label}</td>
                      <td className={c.whiteTdMuted}>{formatFeeValue({ value_kind: item.value_kind }, item.previous_amount)}</td>
                      <td className={c.whiteTd}>{formatFeeValue({ value_kind: item.value_kind }, item.new_amount)}</td>
                      <td className={c.whiteTd}>{item.reason}</td>
                      <td className={c.whiteTdMuted}>{item.changed_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No price changes recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
