/** Shared stock labels — aligned with backend pharmacyStockStatus.js */

/** Doctor prescribing: only in stock vs out of stock (low stock counts as in stock). */
export function doctorStockDisplayStatus(stock) {
  const status = stock?.stock_status;
  if (status === 'out_of_stock') return 'out_of_stock';
  return 'in_stock';
}

export function doctorStockLabel(stock) {
  return doctorStockDisplayStatus(stock) === 'out_of_stock' ? 'Out of stock' : 'In stock';
}

export function formatDoctorStockDetail(stock) {
  if (!stock) return '';
  const qty = stock.quantity_in_stock ?? 0;
  const need = stock.required_quantity ?? 1;
  const reorder = stock.reorder_level ?? 0;
  return `${qty} on hand · need ${need} for this order · reorder at ${reorder}`;
}

export function formatAvailabilityElsewhere(locations) {
  if (!Array.isArray(locations) || !locations.length) return null;
  return locations.map((row) => formatAvailabilityElsewhereLine(row));
}

function facilityTypeLabel(type) {
  if (type === 'hospital') return 'Hospital';
  if (type === 'clinic') return 'Clinic';
  if (type === 'health_center') return 'Health center';
  return 'Facility';
}

export function formatAvailabilityElsewhereLine(row) {
  if (!row) return '';
  const typeLabel = facilityTypeLabel(row.facility_type);
  const place = row.location ? ` (${row.location})` : '';
  const qty = row.quantity_in_stock != null ? ` — ${row.quantity_in_stock} on hand` : '';
  return `${typeLabel}: ${row.facility_name}${place}${qty}`;
}

export function formatAvailabilityElsewhereDetailed(locations) {
  if (!Array.isArray(locations) || !locations.length) return [];
  return locations.map((row) => formatAvailabilityElsewhereLine(row));
}

export function buildDoctorPrescriptionLine(medLine, liveStock) {
  const qty = Number(medLine.quantity) || 1;
  const stockSnapshot = liveStock || {
    stock_status: 'out_of_stock',
    stock_label: 'Out of stock',
    quantity_in_stock: 0,
    reorder_level: 0,
    required_quantity: qty,
    availability_elsewhere: [],
  };
  const displayStatus = doctorStockDisplayStatus(stockSnapshot);
  return {
    ...medLine,
    medication_name: medLine.medication_name.trim(),
    generic_name: medLine.generic_name?.trim() || '',
    dosage: medLine.dosage.trim(),
    quantity: qty,
    stock_status: displayStatus,
    stock_label: doctorStockLabel(stockSnapshot),
    quantity_in_stock: stockSnapshot.quantity_in_stock ?? 0,
    reorder_level: stockSnapshot.reorder_level ?? 0,
    required_quantity: stockSnapshot.required_quantity ?? qty,
    availability_elsewhere: stockSnapshot.availability_elsewhere || [],
    can_dispense: displayStatus === 'in_stock',
  };
}

export function lineStockStatus(item) {
  if (item.stock_label && item.stock_status) {
    const tone =
      item.stock_status === 'out_of_stock'
        ? 'outOfStock'
        : item.stock_status === 'low_stock'
          ? 'lowStock'
          : item.stock_status === 'in_stock'
            ? 'inStock'
            : 'awaiting';
    return { label: item.stock_label, tone };
  }
  if (item.is_dispensed) return { label: 'Given', tone: 'given' };
  if (item.dispensed_at && !item.is_dispensed) return { label: 'Not given', tone: 'notGiven' };
  if (item.stock_status === 'out_of_stock') return { label: 'Out of stock', tone: 'outOfStock' };
  if (item.stock_status === 'low_stock') return { label: 'Low stock', tone: 'lowStock' };
  if (item.stock_status === 'in_stock') return { label: 'In stock', tone: 'inStock' };
  if (item.is_available === false) return { label: 'Out of stock', tone: 'outOfStock' };
  return { label: 'Awaiting', tone: 'awaiting' };
}

export function statusBadgeClass(tone) {
  switch (tone) {
    case 'given':
      return 'bg-emerald-100 text-emerald-900';
    case 'notGiven':
      return 'bg-rose-100 text-rose-900';
    case 'outOfStock':
      return 'bg-rose-100 text-rose-900';
    case 'lowStock':
      return 'bg-amber-100 text-amber-900';
    case 'inStock':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function pendingItems(items) {
  return (items || []).filter((i) => !i.dispensed_at);
}

export function stockSummary(items) {
  const pending = pendingItems(items);
  return {
    outOfStock: pending.filter((i) => i.stock_status === 'out_of_stock').length,
    lowStock: pending.filter((i) => i.stock_status === 'low_stock').length,
    inStock: pending.filter((i) => i.stock_status === 'in_stock').length,
    pending: pending.length,
  };
}

export function isOutOfStock(item) {
  return item.stock_status === 'out_of_stock' || (item.is_available === false && !item.dispensed_at);
}

export function prescriptionListSummary(lines) {
  const normalized = (lines || []).map((l) => ({
    ...l,
    stock_status: doctorStockDisplayStatus(l),
  }));
  return {
    outOfStock: normalized.filter((l) => l.stock_status === 'out_of_stock').length,
    inStock: normalized.filter((l) => l.stock_status === 'in_stock').length,
    total: normalized.length,
  };
}

export function allPrescriptionLinesOutOfStock(lines) {
  const normalized = (lines || []).map((l) => ({
    ...l,
    stock_status: doctorStockDisplayStatus(l),
  }));
  return normalized.length > 0 && normalized.every((l) => l.stock_status === 'out_of_stock');
}

export function prescriptionHasDispensableStock(lines) {
  return (lines || []).some((l) => doctorStockDisplayStatus(l) !== 'out_of_stock');
}

/** Toast after API returns skippedPharmacy — visit end / billing when no more stops. */
export function formatSkippedPharmacyPatientToast(patientName, result) {
  if (!result?.skippedPharmacy) return null;
  const who = patientName ? `${patientName} — ` : '';
  if (result?.routedToBilling) {
    return `${who}prescription recorded, pharmacy skipped; sent to billing`;
  }
  if (result?.visitCompleted) {
    return `${who}prescription recorded, consultation completed`;
  }
  return `${who}prescription recorded, pharmacy skipped (all medications out of stock)`;
}

export function doctorLineStockStatus(item) {
  const display = doctorStockDisplayStatus(item);
  return {
    label: display === 'out_of_stock' ? 'Out of stock' : 'In stock',
    tone: display === 'out_of_stock' ? 'outOfStock' : 'inStock',
  };
}
