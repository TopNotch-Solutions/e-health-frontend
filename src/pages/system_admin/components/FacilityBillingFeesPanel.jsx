import {
  getFacilityBillingFeeHistory,
  getFacilityBillingFees,
  updateFacilityBillingFee,
} from '../../../api/admin';
import { facilityTypeLabel } from '../styles/adminClasses';
import BillingFeeEditor from './BillingFeeEditor';

export default function FacilityBillingFeesPanel({ facilityId, facilityType, facilityName }) {
  const facilityLabel = facilityTypeLabel(facilityType);
  const isClinic = facilityType === 'clinic';

  return (
    <BillingFeeEditor
      title={isClinic ? 'Clinic price overrides' : 'Hospital price overrides'}
      description={
        isClinic
          ? `Optional overrides for ${facilityName || 'this clinic'}. Leave unset to use the national clinic visit fee for all clinics.`
          : `Optional overrides for ${facilityName || 'this hospital'}. Admission and department visit fees fall back to national defaults when not overridden.`
      }
      loadFees={() => getFacilityBillingFees(facilityId)}
      loadHistory={() => getFacilityBillingFeeHistory(facilityId)}
      saveFee={(feeKey, body) => updateFacilityBillingFee(facilityId, feeKey, body)}
      onResetToNational={(feeKey, body) => updateFacilityBillingFee(facilityId, feeKey, {
        ...body,
        use_national_default: true,
      })}
      allowResetToNational
      showNationalColumn
      showOverrideColumn
      showEffectiveColumn
      currentColumnLabel="Charged (NAD)"
      newPriceColumnLabel="Override price (NAD)"
      historyTitle="Facility price change history"
      historyDescription={`Overrides recorded for this ${facilityLabel.toLowerCase()} only.`}
      reasonLabel="Reason for price change *"
    />
  );
}
