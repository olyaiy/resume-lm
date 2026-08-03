export const UTM_PARAMETER_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmParameterName = (typeof UTM_PARAMETER_NAMES)[number];
export type UtmParameters = Partial<Record<UtmParameterName, string>>;

export const ATTRIBUTION_STORAGE_KEY = "resumelm:attribution";

const MAX_VALUE_LENGTH = 120;
const SENSITIVE_QUERY_PARAMETERS = new Set([
  "access_token",
  "code",
  "refresh_token",
  "sb_flow_id",
  "session_id",
  "state",
  "token_hash",
]);

export function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeValue(value: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, MAX_VALUE_LENGTH) : undefined;
}

export function getUtmParameters(input: URLSearchParams | URL | string): UtmParameters {
  const searchParams =
    input instanceof URLSearchParams
      ? input
      : new URL(input.toString(), "https://resumelm.local").searchParams;

  return Object.fromEntries(
    UTM_PARAMETER_NAMES.flatMap((name) => {
      const value = normalizeValue(searchParams.get(name));
      return value ? [[name, value]] : [];
    }),
  ) as UtmParameters;
}

export function readStoredAttribution(storage: Pick<Storage, "getItem"> | null): UtmParameters {
  if (!storage) return {};

  try {
    const value = storage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!value) return {};

    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      UTM_PARAMETER_NAMES.flatMap((name) => {
        const candidate = typeof parsed[name] === "string" ? parsed[name] : null;
        const normalized = normalizeValue(candidate);
        return normalized ? [[name, normalized]] : [];
      }),
    ) as UtmParameters;
  } catch {
    return {};
  }
}

export function persistFirstTouchAttribution(
  current: UtmParameters,
  storage: Pick<Storage, "getItem" | "setItem"> | null,
): UtmParameters {
  const stored = readStoredAttribution(storage);
  if (Object.keys(stored).length > 0 || Object.keys(current).length === 0 || !storage) {
    return Object.keys(stored).length > 0 ? stored : current;
  }

  try {
    storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable in private browsing or when blocked by policy.
  }

  return current;
}

export function getAttributionProperties(
  current: UtmParameters,
  firstTouch: UtmParameters,
): Record<string, string> {
  const properties: Record<string, string> = {};

  for (const name of UTM_PARAMETER_NAMES) {
    const value = current[name] ?? firstTouch[name];
    if (value) properties[name] = value;

    const firstTouchValue = firstTouch[name];
    if (firstTouchValue) properties[`initial_${name}`] = firstTouchValue;
  }

  return properties;
}

export function withUtmParameters(
  input: string,
  parameters: UtmParameters,
): string {
  const isRelative = input.startsWith("/");
  const url = new URL(input, "https://resumelm.local");

  for (const name of UTM_PARAMETER_NAMES) {
    const value = normalizeValue(parameters[name] ?? null);
    if (value) url.searchParams.set(name, value);
  }

  if (isRelative) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return url.toString();
}

export function sanitizeAnalyticsUrl(input: string): string {
  const url = new URL(input, "https://resumelm.local");
  for (const parameter of SENSITIVE_QUERY_PARAMETERS) {
    url.searchParams.delete(parameter);
  }

  return url.toString();
}
