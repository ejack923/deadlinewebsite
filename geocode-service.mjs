const GEOCODE_CACHE_TTL_MS = 10 * 60 * 1000;
const geocodeCache = new Map();
const inflightRequests = new Map();

function normalizeQuery(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

function getPlaceOnly(query) {
  return normalizeQuery(query)
    .replace(/\bmagistrates'? courts?\b/gi, "")
    .replace(/\bcounty courts?\b/gi, "")
    .replace(/\bsupreme courts?\b/gi, "")
    .replace(/\bchildren'?s courts?\b/gi, "")
    .replace(/\bcoroners? courts?\b/gi, "")
    .replace(/\bof victoria\b/gi, "")
    .replace(/\blaw courts?\b/gi, "")
    .trim();
}

function buildQueryVariants(query) {
  const cleaned = normalizeQuery(query);
  const placeOnly = getPlaceOnly(cleaned);
  return Array.from(new Set([
    cleaned,
    `${cleaned}, Victoria`,
    placeOnly && placeOnly !== cleaned ? placeOnly : "",
    placeOnly && placeOnly !== cleaned ? `${placeOnly}, Victoria` : "",
    cleaned.replace(/\blaw courts?\b/gi, "court"),
    cleaned.replace(/\bmagistrates'? courts?\b/gi, ""),
    cleaned.replace(/\bcounty courts?\b/gi, ""),
    cleaned.replace(/\bsupreme courts?\b/gi, ""),
  ].filter(Boolean)));
}

function getCached(query) {
  const cached = geocodeCache.get(query);
  if (!cached) return null;
  if (Date.now() - cached.at > GEOCODE_CACHE_TTL_MS) {
    geocodeCache.delete(query);
    return null;
  }
  return cached.results;
}

function setCached(query, results) {
  geocodeCache.set(query, { at: Date.now(), results });
}

async function fetchPhotonVariant(variant) {
  const photonUrl = new URL("https://photon.komoot.io/api/");
  photonUrl.searchParams.set("q", variant);
  photonUrl.searchParams.set("limit", "6");
  photonUrl.searchParams.set("lang", "en");

  const response = await fetch(photonUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "LACW-TravelClaims/1.0 (local-geocoder-service)",
    },
  });

  if (!response.ok) return [];

  const payload = await response.json();
  const features = Array.isArray(payload?.features) ? payload.features : [];

  return features
    .map((feature) => {
      const props = feature?.properties || {};
      const coords = Array.isArray(feature?.geometry?.coordinates) ? feature.geometry.coordinates : [];
      const placeName = [props.name].filter(Boolean).join(", ");
      const streetLine = [props.housenumber, props.street].filter(Boolean).join(" ");
      const localityLine = [props.suburb, props.city || props.county, props.postcode, props.state, props.country]
        .filter(Boolean)
        .join(", ");
      const addressLine = [streetLine, localityLine].filter(Boolean).join(", ");
      const label = [placeName, addressLine].filter(Boolean).join(" - ");
      const countryCode = String(props.countrycode || "").toLowerCase();
      if (!label || (countryCode && countryCode !== "au")) return null;
      return {
        label,
        lat: Number(coords[1]),
        lon: Number(coords[0]),
      };
    })
    .filter((item) => item && Number.isFinite(item.lat) && Number.isFinite(item.lon));
}

async function performGeocodeSearch(query) {
  const queryVariants = buildQueryVariants(query);
  const seen = new Set();
  const results = [];

  const addResult = (item) => {
    if (!item?.label || seen.has(item.label)) return;
    seen.add(item.label);
    results.push(item);
  };

  for (const variant of queryVariants.slice(0, 4)) {
    try {
      const matches = await fetchPhotonVariant(variant);
      matches.forEach(addResult);
    } catch {
      // Ignore transient upstream errors and keep trying the remaining variants.
    }

    if (results.length >= 8) break;
  }

  const victorianResults = results.filter((result) => /victoria/i.test(result.label));
  return (victorianResults.length ? victorianResults : results).slice(0, 8);
}

export async function geocodeSearch(query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];

  const cached = getCached(normalizedQuery);
  if (cached) return cached;

  if (inflightRequests.has(normalizedQuery)) {
    return inflightRequests.get(normalizedQuery);
  }

  const request = performGeocodeSearch(normalizedQuery)
    .then((results) => {
      setCached(normalizedQuery, results);
      inflightRequests.delete(normalizedQuery);
      return results;
    })
    .catch((error) => {
      inflightRequests.delete(normalizedQuery);
      throw error;
    });

  inflightRequests.set(normalizedQuery, request);
  return request;
}
