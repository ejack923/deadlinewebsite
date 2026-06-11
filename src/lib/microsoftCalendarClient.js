const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const MICROSOFT_GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
const MICROSOFT_CALENDAR_SCOPE = "openid profile offline_access User.Read Calendars.ReadWrite";

function randomString(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => chars[value % chars.length]).join("");
}

function base64UrlEncode(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function createCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  return base64UrlEncode(new Uint8Array(digest));
}

function buildMicrosoftRedirectUri() {
  return window.location.origin;
}

async function microsoftGraphFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft Calendar request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.status === 204 ? null : response.json();
}

function extractAuthCodeFromPopup(popup) {
  try {
    if (!popup || popup.closed) {
      throw new Error("Microsoft sign-in was closed before it finished.");
    }

    const href = popup.location.href;
    if (!href || popup.location.origin !== window.location.origin) {
      return null;
    }

    const url = new URL(href);
    const error = url.searchParams.get("error");
    if (error) {
      throw new Error(url.searchParams.get("error_description") || error);
    }

    const code = url.searchParams.get("code");
    if (!code) {
      return null;
    }

    popup.close();
    return code;
  } catch (error) {
    if (error instanceof DOMException) {
      return null;
    }
    throw error;
  }
}

async function exchangeMicrosoftCodeForToken(clientId, code, codeVerifier) {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: MICROSOFT_CALENDAR_SCOPE,
    code,
    redirect_uri: buildMicrosoftRedirectUri(),
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${MICROSOFT_AUTHORITY}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft token request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}

export async function requestMicrosoftCalendarAccessToken(clientId) {
  if (!clientId) {
    throw new Error("Enter a Microsoft OAuth client ID first.");
  }

  const codeVerifier = randomString(96);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = randomString(32);
  const redirectUri = buildMicrosoftRedirectUri();
  const authUrl = new URL(`${MICROSOFT_AUTHORITY}/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_mode", "query");
  authUrl.searchParams.set("scope", MICROSOFT_CALENDAR_SCOPE);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  const popup = window.open(authUrl.toString(), "aidPlannerMicrosoftCalendar", "width=520,height=720");
  if (!popup) {
    throw new Error("Microsoft sign-in popup was blocked. Allow popups and try again.");
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = window.setInterval(async () => {
      try {
        const code = extractAuthCodeFromPopup(popup);
        if (!code) {
          if (Date.now() - startedAt > 120000) {
            window.clearInterval(timer);
            try {
              popup.close();
            } catch {}
            reject(new Error("Microsoft sign-in took too long. Try again."));
          }
          return;
        }

        window.clearInterval(timer);
        const tokenPayload = await exchangeMicrosoftCodeForToken(clientId, code, codeVerifier);
        resolve(tokenPayload.access_token);
      } catch (error) {
        window.clearInterval(timer);
        try {
          popup.close();
        } catch {}
        reject(error instanceof Error ? error : new Error("Could not complete Microsoft sign-in."));
      }
    }, 500);
  });
}

export async function listOutlookCalendars(accessToken) {
  const payload = await microsoftGraphFetch(
    accessToken,
    `${MICROSOFT_GRAPH_ROOT}/me/calendars?$select=id,name,canEdit,isDefaultCalendar`
  );

  return (payload.value || []).map((item) => ({
    id: item.id,
    summary: item.name || item.id,
    canEdit: Boolean(item.canEdit),
    primary: Boolean(item.isDefaultCalendar),
  }));
}

export async function listOutlookCalendarEvents(accessToken, calendarId, timeMin, timeMax) {
  if (!calendarId) {
    throw new Error("Choose an Outlook calendar first.");
  }

  const url = new URL(`${MICROSOFT_GRAPH_ROOT}/me/calendars/${encodeURIComponent(calendarId)}/calendarView`);
  if (timeMin) url.searchParams.set("startDateTime", `${timeMin}T00:00:00.000Z`);
  if (timeMax) url.searchParams.set("endDateTime", `${timeMax}T23:59:59.999Z`);
  url.searchParams.set("$orderby", "start/dateTime");

  const payload = await microsoftGraphFetch(accessToken, url.toString());
  return payload.value || [];
}

export async function createOutlookCalendarEvent(accessToken, calendarId, event) {
  if (!calendarId) {
    throw new Error("Choose an Outlook calendar first.");
  }

  return microsoftGraphFetch(accessToken, `${MICROSOFT_GRAPH_ROOT}/me/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
}
