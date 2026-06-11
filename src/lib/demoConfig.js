const APP_ENV = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const APP_MODE = APP_ENV.VITE_APP_MODE || "app";

export const isDemoMode = APP_MODE === "demo";

export const brand = {
  appName: isDemoMode ? "Legal Support Hub Demo" : "Law and Advocacy Centre for Women",
  appSubtitle: isDemoMode ? "Demo workspace for legal operations workflows" : "Staff portal for legal aid and casework workflows",
  wordmarkPrimary: isDemoMode ? "Legal Support" : "LACW",
  wordmarkSecondary: isDemoMode ? "Hub Demo" : "Portal",
  badgeText: isDemoMode ? "DEMO" : "LACW",
  intakeOrgName: isDemoMode ? "Demo Legal Services" : "Law and Advocacy Centre for Women",
  memoOrgName: isDemoMode ? "Demo Legal Services" : "Law and Advocacy Centre for Women",
  genericContactLine: isDemoMode ? "demo@legalsupporthub.test" : "ejackson@completelawsupport.com",
  genericWebsite: isDemoMode ? "www.legalsupporthub.demo" : "www.lacw.org.au",
};
