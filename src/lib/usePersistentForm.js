import { useEffect, useState } from "react";

export function usePersistentForm(storageKey, initialValue) {
  const [form, setForm] = useState(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? { ...initialValue, ...JSON.parse(raw) } : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(form));
    } catch {
      // ignore persistence failures
    }
  }, [storageKey, form]);

  const resetForm = () => {
    setForm(initialValue);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore persistence failures
    }
  };

  return { form, setForm, resetForm };
}
