const BUNDLE_KEY = "lacw_form_bundle";

export function getBundle() {
  try {
    return JSON.parse(localStorage.getItem(BUNDLE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToBundle(formName, content) {
  const bundle = getBundle();
  // Replace if already in bundle
  const idx = bundle.findIndex(f => f.formName === formName);
  if (idx > -1) {
    bundle[idx] = { formName, content, addedAt: new Date().toISOString() };
  } else {
    bundle.push({ formName, content, addedAt: new Date().toISOString() });
  }
  localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  window.dispatchEvent(new Event("bundle-updated"));
}

export function removeFromBundle(formName) {
  const bundle = getBundle().filter(f => f.formName !== formName);
  localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  window.dispatchEvent(new Event("bundle-updated"));
}

export function clearBundle() {
  localStorage.removeItem(BUNDLE_KEY);
  window.dispatchEvent(new Event("bundle-updated"));
}