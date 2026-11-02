// Remembers the inspector for the current tab only, so a later inspector on a
// shared device is not prefilled once the tab is closed.
const SESSION_KEY = 'ideaRatingCurrentInspector';

export const EMPTY_INSPECTOR = { name: '', email: '', inspectorId: '' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInspector(values) {
  const cleaned = {
    name: values.name.trim().replace(/\s+/g, ' '),
    email: values.email.trim(),
    inspectorId: values.inspectorId.trim(),
  };

  const errors = {};
  if (!cleaned.name) errors.name = 'يرجى إدخال الاسم الكامل';
  if (!cleaned.email) errors.email = 'يرجى إدخال البريد الإلكتروني';
  else if (!EMAIL_PATTERN.test(cleaned.email)) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة، مثال: name@example.com';
  }
  if (!cleaned.inspectorId) errors.inspectorId = 'يرجى إدخال الرقم التعريفي للمفتش';

  return { cleaned, errors };
}

export function loadCurrentInspector() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return parsed ? { ...EMPTY_INSPECTOR, ...parsed } : EMPTY_INSPECTOR;
  } catch {
    return EMPTY_INSPECTOR;
  }
}

export function saveCurrentInspector(inspector) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(inspector));
  } catch {
    // Remembering is a convenience: the inspector can simply retype the details.
  }
}

export function clearCurrentInspector() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
