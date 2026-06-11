const GOOGLE_IDENTITY_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

let googleIdentityPromise = null;

function ensureGoogleWindow() {
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services did not load correctly.");
  }
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (googleIdentityPromise) {
    return googleIdentityPromise;
  }

  googleIdentityPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Google Identity Services.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Identity Services."));
    document.head.appendChild(script);
  });

  return googleIdentityPromise;
}

export async function requestGoogleCalendarAccessToken(clientId) {
  if (!clientId) {
    throw new Error("Enter a Google OAuth client ID first.");
  }

  await loadGoogleIdentityScript();
  ensureGoogleWindow();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      callback: (response) => {
        if (response?.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

async function googleApiFetch(accessToken, url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}

export async function listGoogleCalendars(accessToken) {
  const payload = await googleApiFetch(
    accessToken,
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader"
  );

  return (payload.items || []).map((item) => ({
    id: item.id,
    summary: item.summary || item.id,
    primary: Boolean(item.primary),
  }));
}

export async function listGoogleCalendarEvents(accessToken, calendarId, timeMin, timeMax) {
  if (!calendarId) {
    throw new Error("Choose a Google Calendar first.");
  }

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  if (timeMin) url.searchParams.set("timeMin", `${timeMin}T00:00:00.000Z`);
  if (timeMax) url.searchParams.set("timeMax", `${timeMax}T23:59:59.999Z`);

  const payload = await googleApiFetch(accessToken, url.toString());
  return payload.items || [];
}

export async function createGoogleCalendarEvent(accessToken, calendarId, event) {
  if (!calendarId) {
    throw new Error("Choose a Google Calendar first.");
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar create event failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}
