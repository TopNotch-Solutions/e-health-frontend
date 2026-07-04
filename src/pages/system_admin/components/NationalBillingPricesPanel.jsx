import {
  getNationalBillingFeeHistory,
  getNationalBillingFees,
  updateNationalBillingFee,
} from '../../../api/admin';
import BillingFeeEditor from './BillingFeeEditor';

export default function NationalBillingPricesPanel({ scope, title, description, onBack }) {
  return (
    <BillingFeeEditor
      title={title}
      description={description}
      onBack={onBack}
      loadFees={() => getNationalBillingFees(scope)}
      loadHistory={() => getNationalBillingFeeHistory(scope)}
      saveFee={(feeKey, body) => updateNationalBillingFee(scope, feeKey, body)}
      showNationalColumn={false}
      showOverrideColumn={false}
      showEffectiveColumn
      currentColumnLabel="National price (NAD)"
      newPriceColumnLabel="New national price (NAD)"
      historyTitle="National price change history"
      reasonLabel="Reason for national price change *"
      reasonPlaceholder="e.g. Ministry tariff circular 2026/04"
    />
  );
}
