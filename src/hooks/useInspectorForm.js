import { useState } from 'react';
import {
  EMPTY_INSPECTOR,
  clearCurrentInspector,
  loadCurrentInspector,
  saveCurrentInspector,
  validateInspector,
} from '../utils/inspector';

export function useInspectorForm() {
  const [values, setValues] = useState(loadCurrentInspector);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const { cleaned, errors } = validateInspector(values);
  const isVisible = (field) => submitAttempted || touched[field];

  return {
    values,
    visibleErrors: Object.fromEntries(
      Object.entries(errors).filter(([field]) => isVisible(field))
    ),
    change: (field, value) => setValues(prev => ({ ...prev, [field]: value })),
    blur: (field) => setTouched(prev => ({ ...prev, [field]: true })),
    // Reveals every message and returns the cleaned details, or null if invalid.
    validate: () => {
      setSubmitAttempted(true);
      return Object.keys(errors).length === 0 ? cleaned : null;
    },
    remember: (inspector) => {
      saveCurrentInspector(inspector);
      setValues(inspector);
    },
    clear: () => {
      clearCurrentInspector();
      setValues(EMPTY_INSPECTOR);
      setTouched({});
      setSubmitAttempted(false);
    },
  };
}
