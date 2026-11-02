import React, { useId } from 'react';

const fields = [
  { key: 'name', label: 'الاسم الكامل', type: 'text', autoComplete: 'name', placeholder: 'أدخل الاسم الكامل' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email', autoComplete: 'email', placeholder: 'أدخل البريد الإلكتروني', ltr: true },
  { key: 'inspectorId', label: 'الرقم التعريفي للمفتش', type: 'text', autoComplete: 'off', placeholder: 'أدخل الرقم التعريفي', ltr: true },
];

const InspectorFields = ({ form, disabled = false }) => {
  const baseId = useId();
  const hasValues = Object.values(form.values).some(Boolean);

  return (
    <fieldset aria-labelledby={`${baseId}-title`} className="border border-gray-200 rounded-2xl p-5" disabled={disabled}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 id={`${baseId}-title`} className="font-bold text-[#091040] text-base">بيانات المفتش</h3>
        {hasValues && !disabled && (
          <button
            type="button"
            onClick={form.clear}
            className="text-xs font-bold text-gray-500 hover:text-[#091040] transition-colors"
          >
            مسح البيانات
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {fields.map(({ key, label, type, autoComplete, placeholder, ltr }) => {
          const inputId = `${baseId}-${key}`;
          const errorId = `${inputId}-error`;
          const error = form.visibleErrors[key];
          return (
            <div key={key}>
              <label htmlFor={inputId} className="block text-sm font-bold text-gray-700 mb-2">
                {label} <span className="text-pink-500">*</span>
              </label>
              <input
                id={inputId}
                type={type}
                dir={ltr ? 'ltr' : undefined}
                autoComplete={autoComplete}
                value={form.values[key]}
                onChange={e => form.change(key, e.target.value)}
                onBlur={() => form.blur(key)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className={`w-full border rounded-xl px-5 py-3.5 text-sm text-gray-800 text-right bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#02c31e] focus:border-transparent placeholder:text-gray-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${error ? 'border-pink-500' : 'border-gray-200'}`}
              />
              {error && (
                <p id={errorId} className="mt-2 text-xs font-bold text-pink-600">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default InspectorFields;
