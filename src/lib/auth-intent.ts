export type AuthPlan = "free" | "pro";

export interface AuthIntent {
  next?: string;
  plan?: AuthPlan;
}

export const AUTH_ERROR_CODES = {
  emailConfirmation: "email_confirmation",
  oauthMissingCode: "oauth_missing_code",
  oauthProviderDenied: "oauth_provider_denied",
  oauthProviderError: "oauth_provider_error",
  oauthStateMismatch: "oauth_state_mismatch",
  oauthExchangeFailed: "oauth_exchange_failed",
  oauthStartFailed: "oauth_start_failed",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export function getSafeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(path)
  ) {
    return fallback;
  }

  try {
    const resolvedUrl = new URL(path, "https://resumelm.invalid");
    if (resolvedUrl.origin !== "https://resumelm.invalid") {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return path;
}

export function parseAuthPlan(plan: string | null | undefined): AuthPlan | undefined {
  return plan === "free" || plan === "pro" ? plan : undefined;
}

export function normalizeAuthIntent(intent?: AuthIntent | null): AuthIntent {
  const next = intent?.next ? getSafeRedirectPath(intent.next, "") || undefined : undefined;
  const plan = parseAuthPlan(intent?.plan);

  return {
    ...(next ? { next } : {}),
    ...(plan ? { plan } : {}),
  };
}

export function getAuthIntentFromParams(params: {
  next?: string | null;
  plan?: string | null;
}): AuthIntent {
  return normalizeAuthIntent({
    next: params.next ?? undefined,
    plan: parseAuthPlan(params.plan),
  });
}

export function getAuthIntentFromSearchParams(searchParams: URLSearchParams): AuthIntent {
  return getAuthIntentFromParams({
    next: searchParams.get("next"),
    plan: searchParams.get("plan"),
  });
}

export function addAuthIntentToUrl(url: URL, intent?: AuthIntent | null): URL {
  const normalized = normalizeAuthIntent(intent);

  if (normalized.next) {
    url.searchParams.set("next", normalized.next);
  }
  if (normalized.plan) {
    url.searchParams.set("plan", normalized.plan);
  }

  return url;
}

export function buildAuthCallbackUrl(siteUrl: string, intent?: AuthIntent | null): string {
  return addAuthIntentToUrl(new URL("/auth/callback", siteUrl), intent).toString();
}

export function getAuthRedirectPath(intent?: AuthIntent | null, fallback = "/"): string {
  const normalized = normalizeAuthIntent(intent);

  if (normalized.next) {
    return normalized.next;
  }

  if (normalized.plan === "pro") {
    return "/subscription";
  }

  return fallback;
}

export function classifyOAuthError(params: {
  providerError?: string | null;
  providerErrorCode?: string | null;
  providerErrorDescription?: string | null;
  message?: string | null;
}): AuthErrorCode {
  const providerError = params.providerError?.toLowerCase();
  const providerErrorCode = params.providerErrorCode?.toLowerCase();
  const providerErrorDescription = params.providerErrorDescription?.toLowerCase();
  const message = params.message?.toLowerCase() ?? "";

  const stateSignals = [providerErrorCode, providerErrorDescription, message].filter(
    (value): value is string => Boolean(value),
  );

  if (stateSignals.some((value) => value.includes("state") || value.includes("flow_state"))) {
    return AUTH_ERROR_CODES.oauthStateMismatch;
  }

  if (providerError === "access_denied") {
    return AUTH_ERROR_CODES.oauthProviderDenied;
  }

  if (providerError) {
    return AUTH_ERROR_CODES.oauthProviderError;
  }

  return AUTH_ERROR_CODES.oauthExchangeFailed;
}
