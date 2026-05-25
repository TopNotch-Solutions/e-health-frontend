/** Shared stock labels — aligned with backend pharmacyStockStatus.js */

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
  return {
    outOfStock: (lines || []).filter((l) => l.stock_status === 'out_of_stock').length,
    lowStock: (lines || []).filter((l) => l.stock_status === 'low_stock').length,
    inStock: (lines || []).filter((l) => l.stock_status === 'in_stock').length,
    total: (lines || []).length,
  };
}
