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
export const ANALYTICS_ANONYMOUS_ID_COOKIE = "resumelm:analytics-anonymous-id";
export const ATTRIBUTION_COOKIE = "resumelm:attribution";
export const LATEST_ATTRIBUTION_COOKIE = "resumelm:attribution-latest";
export const ANALYTICS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export interface AnalyticsAttributionContext {
  anonymousId?: string;
  currentAttribution: UtmParameters;
  firstTouchAttribution: UtmParameters;
}

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

export function normalizeAnalyticsAnonymousId(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized || normalized.length > MAX_VALUE_LENGTH) return undefined;

  return /^[a-zA-Z0-9._:-]+$/.test(normalized) ? normalized : undefined;
}

export function parseStoredAttributionValue(value: string | null | undefined): UtmParameters {
  if (!value) return {};

  try {
    let decoded = value;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      // Cookie stores may already return a decoded value.
    }
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
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

    return parseStoredAttributionValue(value);
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

export function getAnalyticsContextProperties(
  context: AnalyticsAttributionContext,
): Record<string, string> {
  return {
    ...(context.anonymousId
      ? { analytics_anonymous_id: context.anonymousId }
      : {}),
    ...getAttributionProperties(
      context.currentAttribution,
      context.firstTouchAttribution,
    ),
  };
}

function setBrowserCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${ANALYTICS_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function persistBrowserAnalyticsContext(
  context: AnalyticsAttributionContext,
): void {
  if (typeof document === "undefined") return;

  if (context.anonymousId) {
    setBrowserCookie(ANALYTICS_ANONYMOUS_ID_COOKIE, context.anonymousId);
  }

  if (Object.keys(context.firstTouchAttribution).length > 0) {
    setBrowserCookie(
      ATTRIBUTION_COOKIE,
      JSON.stringify(context.firstTouchAttribution),
    );
  }

  if (Object.keys(context.currentAttribution).length > 0) {
    setBrowserCookie(
      LATEST_ATTRIBUTION_COOKIE,
      JSON.stringify(context.currentAttribution),
    );
  }
}

export function readBrowserAnalyticsAnonymousId(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANALYTICS_ANONYMOUS_ID_COOKIE}=`));

  try {
    return normalizeAnalyticsAnonymousId(
      cookie
        ? decodeURIComponent(
            cookie.slice(ANALYTICS_ANONYMOUS_ID_COOKIE.length + 1),
          )
        : undefined,
    );
  } catch {
    return undefined;
  }
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
