function ensureApiBase(apiEndpoint) {
  if (!apiEndpoint) return "";
  const trimmed = apiEndpoint.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

const OAUTH_DRAFT_KEY = "aid-planner-actionstep-oauth-draft";

export const ACTIONSTEP_ENVIRONMENTS = {
  production: {
    authorizeUrl: "https://go.actionstep.com/api/oauth/authorize",
    tokenUrl: "https://api.actionstep.com/api/oauth/token",
  },
  staging: {
    authorizeUrl: "https://go.actionstepstaging.com/api/oauth/authorize",
    tokenUrl: "https://api.actionstepstaging.com/api/oauth/token",
  },
};

function getArrayPayload(json) {
  if (Array.isArray(json?.actions)) return json.actions;
  if (Array.isArray(json?.data)) return json.data;

  const firstArray = Object.values(json || {}).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? firstArray : [];
}

function getLinkedName(record, key) {
  const value = record?.[key];
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.displayName || value.name || value.label || "";
}

function getLinkedId(record, key) {
  const value = record?.[key];
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return value.id ? String(value.id) : "";
}

function firstString(record, keys) {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function normalizeDate(value) {
  if (!value || typeof value !== "string") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitFullName(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return { firstName: "", lastName: "", fullName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "", fullName: trimmed };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
    fullName: trimmed,
  };
}

function inferMatterType(...values) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  if (!text) return "";
  if (text.includes("family violence")) return "Family Violence";
  if (text.includes("criminal") || text.includes("bail") || text.includes("plea") || text.includes("sentence") || text.includes("committal") || text.includes("appeal")) {
    return "Criminal";
  }
  if (text.includes("family")) return "Family";
  if (text.includes("civil")) return "Civil";
  return "";
}

function inferCourt(...values) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  if (!text) return "";
  if (text.includes("children")) return "Children's Court";
  if (text.includes("magistrates")) return "Magistrates' Court";
  if (text.includes("county")) return "County Court";
  if (text.includes("supreme")) return "Supreme Court";
  if (text.includes("family court")) return "Family Court";
  if (text.includes("federal circuit") || text.includes("fcfcoa")) return "Federal Circuit and Family Court";
  return "";
}

function inferAppearanceType(...values) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  if (!text) return "";
  if (text.includes("contest mention")) return "Contest Mention";
  if (text.includes("bail")) return "Bail Application";
  if (text.includes("committal")) return "Committal";
  if (text.includes("sentence")) return "Sentence";
  if (text.includes("plea")) return "Plea";
  if (text.includes("appeal")) return "Appeal";
  if (text.includes("trial")) return "Trial";
  if (text.includes("conference")) return "Conference";
  if (text.includes("mention")) return "Mention";
  return "";
}

function uniqueMatters(matters) {
  const seen = new Set();
  return matters.filter((matter) => {
    const key = matter.externalId || `${matter.client.fileNumber}|${matter.client.fullName}|${matter.matter.summary}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mapActionstepMatter(record) {
  const summary = firstString(record, ["name", "displayName", "title", "description"]);
  const clientName = firstString(record, ["clientName", "contactName", "displayName", "name", "title"]);
  const parsedClient = splitFullName(clientName);

  const reference =
    firstString(record, ["reference", "number", "fileNumber", "code", "displayCode"]) ||
    (record?.id ? `AS-${record.id}` : "");

  const actionTypeName = getLinkedName(record, "actionType");
  const responsibleLawyer = getLinkedName(record, "assignedTo") || getLinkedName(record, "owner");
  const rateName = getLinkedName(record, "rate");
  const courtName = firstString(record, ["courtName", "court"]) || inferCourt(actionTypeName, summary);
  const appearanceType = inferAppearanceType(actionTypeName, summary);
  const nextAppearanceDate = normalizeDate(
    firstString(record, [
      "nextAppearanceDate",
      "nextCourtDate",
      "startDate",
      "startTimestamp",
      "createdAt",
      "createdTimestamp",
      "modifiedAt",
      "modifiedTimestamp",
    ])
  );

  const matterType = /criminal/i.test(actionTypeName)
    ? "Criminal"
    : inferMatterType(actionTypeName, summary, courtName, appearanceType);

  return {
    externalId: String(record?.id || reference || crypto.randomUUID()),
    actionstep: {
      assignedToId: getLinkedId(record, "assignedTo") || getLinkedId(record, "owner"),
      actionTypeId: getLinkedId(record, "actionType"),
      rateId: getLinkedId(record, "rate"),
      rateName,
      importedReview: {
        inferredMatterType: matterType,
        inferredCourt: courtName,
        inferredAppearanceType: appearanceType,
      },
    },
    client: {
      firstName: parsedClient.firstName,
      lastName: parsedClient.lastName,
      fullName: parsedClient.fullName || summary,
      fileNumber: reference,
    },
    matter: {
      matterType,
      court: courtName || actionTypeName,
      appearanceType,
      nextAppearanceDate,
      lawyer: responsibleLawyer,
      summary: summary || "Imported from Actionstep matter search.",
    },
  };
}

async function fetchActionstepSearch(url, accessToken) {
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${accessToken.trim()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Actionstep search failed (${response.status}). ${errorText.slice(0, 240)}`.trim());
  }

  const json = await response.json();
  return getArrayPayload(json).map(mapActionstepMatter);
}

export async function searchActionstepMatters({ apiEndpoint, accessToken, query }) {
  const baseUrl = ensureApiBase(apiEndpoint);
  if (!baseUrl) {
    throw new Error("Actionstep API endpoint is required.");
  }

  if (!accessToken?.trim()) {
    throw new Error("Actionstep access token is required.");
  }

  const searchTerm = query?.trim();
  if (!searchTerm) {
    throw new Error("Enter a matter search query first.");
  }

  const searchConfigs = [
    { name_ilike: `*${searchTerm}*` },
    { reference_ilike: `*${searchTerm}*` },
    { filter: `name ilike '%${searchTerm.replace(/'/g, "''")}%' OR reference ilike '%${searchTerm.replace(/'/g, "''")}%'` },
  ];

  const allResults = [];

  for (const filters of searchConfigs) {
    try {
      const url = new URL("rest/actions", baseUrl);
      url.searchParams.set("pageSize", "25");
      url.searchParams.set("include", "actionType,assignedTo,owner,rate");
      url.searchParams.set("fields[actions]", ":default,reference,number,fileNumber,code,displayCode,name,displayName,title,description,startDate,startTimestamp,createdAt,createdTimestamp,modifiedAt,modifiedTimestamp");
      url.searchParams.set("fields[actiontypes]", ":default,displayName,name");
      url.searchParams.set("fields[participants]", ":default,displayName,firstName,lastName");
      url.searchParams.set("fields[rates]", ":default,displayName,name");

      Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const results = await fetchActionstepSearch(url, accessToken);
      allResults.push(...results);
    } catch (error) {
      if (allResults.length === 0) {
        throw error;
      }
    }
  }

  return uniqueMatters(allResults);
}

export async function listAllActionstepMatters({ apiEndpoint, accessToken }) {
  const baseUrl = ensureApiBase(apiEndpoint);
  if (!baseUrl) throw new Error("Actionstep API endpoint is required.");
  if (!accessToken?.trim()) throw new Error("Actionstep access token is required.");

  const url = new URL("rest/actions", baseUrl);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("include", "actionType,assignedTo,owner,rate");
  url.searchParams.set("fields[actions]", ":default,reference,number,fileNumber,code,displayCode,name,displayName,title,description,startDate,startTimestamp,createdAt,createdTimestamp,modifiedAt,modifiedTimestamp");
  url.searchParams.set("fields[actiontypes]", ":default,displayName,name");
  url.searchParams.set("fields[participants]", ":default,displayName,firstName,lastName");
  url.searchParams.set("fields[rates]", ":default,displayName,name");

  return fetchActionstepSearch(url, accessToken);
}

export function saveActionstepOAuthDraft(draft) {
  window.sessionStorage.setItem(OAUTH_DRAFT_KEY, JSON.stringify(draft));
}

export function loadActionstepOAuthDraft() {
  try {
    const raw = window.sessionStorage.getItem(OAUTH_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearActionstepOAuthDraft() {
  window.sessionStorage.removeItem(OAUTH_DRAFT_KEY);
}

export function buildActionstepAuthorizeUrl({
  environment,
  clientId,
  scopes,
  redirectUri,
}) {
  const config = ACTIONSTEP_ENVIRONMENTS[environment] || ACTIONSTEP_ENVIRONMENTS.production;
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId.trim());
  url.searchParams.set("scope", scopes.trim());
  url.searchParams.set("redirect_uri", redirectUri.trim());
  return url.toString();
}

export async function exchangeActionstepCode({
  environment,
  clientId,
  clientSecret,
  redirectUri,
  code,
}) {
  const config = ACTIONSTEP_ENVIRONMENTS[environment] || ACTIONSTEP_ENVIRONMENTS.production;
  const body = new URLSearchParams({
    code: code.trim(),
    client_id: clientId.trim(),
    client_secret: clientSecret.trim(),
    grant_type: "authorization_code",
    redirect_uri: redirectUri.trim(),
  });

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Actionstep token exchange failed (${response.status}). ${errorText.slice(0, 240)}`.trim());
  }

  return response.json();
}

export async function createActionstepFileNote({
  apiEndpoint,
  accessToken,
  actionId,
  text,
  source = "Aid Planner",
}) {
  const baseUrl = ensureApiBase(apiEndpoint);
  if (!baseUrl) throw new Error("Actionstep API endpoint is required.");
  if (!accessToken?.trim()) throw new Error("Actionstep access token is required.");
  if (!actionId) throw new Error("Actionstep matter ID is required.");
  if (!text?.trim()) throw new Error("A file note message is required.");

  const url = new URL("rest/filenotes", baseUrl);
  const payload = {
    filenotes: {
      text: text.trim(),
      source,
      noteTimestamp: new Date().toISOString(),
      links: {
        action: String(actionId),
      },
    },
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${accessToken.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Actionstep file note failed (${response.status}). ${errorText.slice(0, 240)}`.trim());
  }

  return response.json();
}

export async function createActionstepTask({
  apiEndpoint,
  accessToken,
  actionId,
  name,
  assigneeId,
  rateId,
  dueDate,
  priority = "Normal",
}) {
  const baseUrl = ensureApiBase(apiEndpoint);
  if (!baseUrl) throw new Error("Actionstep API endpoint is required.");
  if (!accessToken?.trim()) throw new Error("Actionstep access token is required.");
  if (!actionId) throw new Error("Actionstep matter ID is required.");
  if (!name?.trim()) throw new Error("Task title is required.");
  if (!assigneeId?.trim()) throw new Error("Actionstep assignee ID is required.");
  if (!rateId?.trim()) throw new Error("Actionstep rate ID is required.");

  const url = new URL("rest/tasks", baseUrl);
  const task = {
    name: name.trim(),
    status: "Incomplete",
    priority,
    links: {
      action: String(actionId),
      assignee: assigneeId.trim(),
      rate: rateId.trim(),
    },
  };

  if (dueDate?.trim()) {
    task.dueDate = dueDate.trim();
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${accessToken.trim()}`,
    },
    body: JSON.stringify({ tasks: task }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Actionstep task creation failed (${response.status}). ${errorText.slice(0, 240)}`.trim());
  }

  return response.json();
}
