import {
  createLegalAidApplicationStandalone,
  getLegalAidApplicationStandalone,
  invokeFunctionStandalone,
  invokeLlmStandalone,
  listLegalAidApplicationsStandalone,
  sendEmailStandalone,
  updateLegalAidApplicationStandalone,
  uploadFileStandalone,
  listConflictNamesStandalone,
  extractDataFromUploadedFileStandalone,
} from "@/lib/standaloneServices";

const localUser = {
  id: "local-user",
  email: "local@deadline-guard.test",
  full_name: "Local Operator",
  role: "admin",
};

const LOCAL_USER_KEY = "deadline_guard_local_user";

const APP_ENV = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const INTEGRATION_MODE = APP_ENV.VITE_APP_INTEGRATION_MODE || "standalone";
const API_BASE_URL = (APP_ENV.VITE_APP_API_BASE_URL || "").replace(/\/+$/, "");

function getStoredUser() {
  try {
    const stored = window.localStorage.getItem(LOCAL_USER_KEY);
    return stored ? { ...localUser, ...JSON.parse(stored) } : localUser;
  } catch {
    return localUser;
  }
}

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

async function sendBackendEmail(payload) {
  const response = await fetch(`${API_BASE_URL}/api/gmail/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const json = await readJson(response);
    throw new Error(json?.error || "Email send failed");
  }

  return (await readJson(response)) || { ok: true };
}

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await readJson(response);
  if (!response.ok || json?.ok === false) {
    throw new Error(json?.error || `Request failed: ${path}`);
  }
  return json;
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function isRemoteMode() {
  return INTEGRATION_MODE === "remote" && Boolean(API_BASE_URL);
}

export const base44 = {
  auth: {
    async me() {
      return getStoredUser();
    },
    async updateMe(updates = {}) {
      const nextUser = {
        ...getStoredUser(),
        ...updates,
      };
      window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    },
    logout(redirectUrl) {
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    },
    redirectToLogin(redirectUrl) {
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    },
  },
  appLogs: {
    async logUserInApp() {
      return { ok: true };
    },
  },
  functions: {
    async invoke(name, payload = {}) {
      if (isRemoteMode()) {
        const json = await postJson(`/api/app/functions/${encodeURIComponent(name)}`, payload);
        return { data: { ...json, ok: undefined } };
      }
      return { data: await invokeFunctionStandalone(name, payload) };
    },
  },
  entities: {
    LegalAidApplication: {
      async list(sort, limit) {
        return listLegalAidApplicationsStandalone(sort, limit);
      },
      async get(id) {
        return getLegalAidApplicationStandalone(id);
      },
      async create(payload) {
        return createLegalAidApplicationStandalone(payload);
      },
      async update(id, payload) {
        return updateLegalAidApplicationStandalone(id, payload);
      },
    },
    ConflictName: {
      async list(sort, limit) {
        return listConflictNamesStandalone(sort, limit);
      },
    },
  },
  integrations: {
    Core: {
      async SendEmail({ to, cc, subject, body, ...rest }) {
        if (isRemoteMode()) {
          return sendBackendEmail({ to, cc, subject, body, ...rest });
        }
        return sendEmailStandalone({ to, cc, subject, body, ...rest });
      },
      async UploadFile({ file }) {
        if (isRemoteMode()) {
          const data = await fileToDataUrl(file);
          const json = await postJson("/api/app/upload", {
            name: file.name,
            type: file.type,
            size: file.size,
            data,
          });
          return { file_url: json.file_url };
        }
        const upload = await uploadFileStandalone(file);
        return { file_url: upload.file_url };
      },
      async InvokeLLM(payload = {}) {
        if (isRemoteMode()) {
          const json = await postJson("/api/app/invoke-llm", payload);
          return json.result;
        }
        return invokeLlmStandalone(payload);
      },
      async ExtractDataFromUploadedFile(payload = {}) {
        if (isRemoteMode()) {
          return postJson("/api/app/extract-data", payload);
        }
        return extractDataFromUploadedFileStandalone(payload);
      },
    },
  },
};
