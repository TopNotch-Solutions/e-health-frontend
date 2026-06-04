import { submitButtonClass as baseSubmitButtonClass } from '../nurse/utils/submitButtonClasses';

export const INTERVENTION_OPTIONS = [
  {
    value: 'subdermal',
    label: 'Subdermal interventions',
    description: 'Record implant insertion or replacement.',
  },
  {
    value: 'device',
    label: 'Intrauterine / barrier devices',
    description: 'Log device insertion or removal procedures.',
  },
  {
    value: 'oral',
    label: 'Oral contraceptives — distribution & refills',
    description: 'Track tablet distributions and refill cycles.',
  },
];

export const DEVICE_TYPES = [
  { value: '', label: 'Select device type…' },
  { value: 'iud', label: 'Intrauterine device (IUD)' },
  { value: 'barrier', label: 'Barrier device' },
  { value: 'other', label: 'Other' },
];

export function emptyOralLogEntry() {
  return {
    id: `oral-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    distributed_date: '',
    tablet_count: '',
    is_refill: false,
    notes: '',
  };
}

function inferTypeFromRecord(record) {
  if (record?.intervention_type) return record.intervention_type;
  const oral = Array.isArray(record?.oral_contraceptive_log) ? record.oral_contraceptive_log : [];
  if (oral.length > 0) return 'oral';
  if (record?.device_insertion_notes || record?.device_removal_notes) return 'device';
  if (record?.subdermal_insertion_notes || record?.subdermal_replacement_notes) return 'subdermal';
  return '';
}

export function emptyPlanningForm(record) {
  const oral = Array.isArray(record?.oral_contraceptive_log) && record.oral_contraceptive_log.length
    ? record.oral_contraceptive_log.map((e, i) => ({
      id: e.id || `oral-${i}`,
      distributed_date: e.distributed_date || '',
      tablet_count: e.tablet_count != null ? String(e.tablet_count) : '',
      is_refill: !!e.is_refill,
      notes: e.notes || '',
    }))
    : [];

  return {
    intervention_type: inferTypeFromRecord(record),
    subdermal_insertion_date: record?.subdermal_insertion_date || '',
    subdermal_insertion_notes: record?.subdermal_insertion_notes || '',
    subdermal_replacement_date: record?.subdermal_replacement_date || '',
    subdermal_replacement_notes: record?.subdermal_replacement_notes || '',
    device_type: record?.device_type || '',
    device_insertion_date: record?.device_insertion_date || '',
    device_insertion_notes: record?.device_insertion_notes || '',
    device_removal_date: record?.device_removal_date || '',
    device_removal_notes: record?.device_removal_notes || '',
    oral_contraceptive_log: oral,
  };
}

function hasContentForType(type, form) {
  if (type === 'subdermal') {
    return Boolean(
      form.subdermal_insertion_notes?.trim()
      || form.subdermal_replacement_notes?.trim()
    );
  }
  if (type === 'device') {
    return Boolean(
      form.device_insertion_notes?.trim()
      || form.device_removal_notes?.trim()
    );
  }
  if (type === 'oral') {
    return (form.oral_contraceptive_log || []).some(
      (e) => e.distributed_date || e.tablet_count || e.notes?.trim()
    );
  }
  return false;
}

export function validatePlanningForm(form) {
  const errors = {};
  if (!form.intervention_type) {
    errors.intervention_type = 'Select one intervention type';
    return errors;
  }
  if (!hasContentForType(form.intervention_type, form)) {
    if (form.intervention_type === 'subdermal') {
      errors._form = 'Document subdermal insertion or replacement details';
    } else if (form.intervention_type === 'device') {
      errors._form = 'Document device insertion or removal details';
    } else {
      errors._form = 'Add at least one oral contraceptive log entry';
    }
  }
  return errors;
}

export function buildRecordPayload(form, visitId, queueEntryId) {
  const type = form.intervention_type;
  const base = {
    visit_id: visitId,
    queue_entry_id: queueEntryId,
    intervention_type: type,
  };

  if (type === 'subdermal') {
    return {
      ...base,
      subdermal_insertion_date: form.subdermal_insertion_date || null,
      subdermal_insertion_notes: form.subdermal_insertion_notes,
      subdermal_replacement_date: form.subdermal_replacement_date || null,
      subdermal_replacement_notes: form.subdermal_replacement_notes,
      oral_contraceptive_log: [],
    };
  }

  if (type === 'device') {
    return {
      ...base,
      device_type: form.device_type || null,
      device_insertion_date: form.device_insertion_date || null,
      device_insertion_notes: form.device_insertion_notes,
      device_removal_date: form.device_removal_date || null,
      device_removal_notes: form.device_removal_notes,
      oral_contraceptive_log: [],
    };
  }

  const oral = (form.oral_contraceptive_log || [])
    .filter((e) => e.distributed_date || e.tablet_count || e.notes?.trim())
    .map((e) => ({
      distributed_date: e.distributed_date || null,
      tablet_count: e.tablet_count ? Number(e.tablet_count) : null,
      is_refill: !!e.is_refill,
      notes: e.notes?.trim() || null,
    }));

  return {
    ...base,
    oral_contraceptive_log: oral,
  };
}

export function submitButtonClass(hasPrescription) {
  return baseSubmitButtonClass(hasPrescription ? 'lab' : 'primary');
}

export function submitButtonLabel(loading, hasPrescription) {
  if (loading) return 'Saving…';
  if (hasPrescription) return 'Save & send to Pharmacy';
  return 'Save & complete session';
}
