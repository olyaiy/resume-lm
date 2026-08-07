import { sanitizeAnalyticsProperties } from "./events";

const MAX_LINK_TEXT_LENGTH = 120;

export interface OutboundLinkInput {
  href: string;
  linkId?: string | null;
  placement?: string | null;
  text?: string | null;
  pathname?: string | null;
  opensInNewTab?: boolean;
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, MAX_LINK_TEXT_LENGTH) : undefined;
}

export function isExternalHttpLink(href: string, currentOrigin: string): boolean {
  try {
    const url = new URL(href, currentOrigin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin !== currentOrigin
    );
  } catch {
    return false;
  }
}

export function buildOutboundLinkProperties(input: OutboundLinkInput) {
  const url = new URL(input.href, "https://resumelm.local");
  const destinationUtm = {
    destination_utm_source: url.searchParams.get("utm_source") ?? undefined,
    destination_utm_medium: url.searchParams.get("utm_medium") ?? undefined,
    destination_utm_campaign: url.searchParams.get("utm_campaign") ?? undefined,
    destination_utm_content: url.searchParams.get("utm_content") ?? undefined,
  };

  return sanitizeAnalyticsProperties({
    link_id: input.linkId,
    link_placement: input.placement ?? input.linkId,
    link_text: normalizeText(input.text),
    destination_host: url.host,
    destination_path: url.pathname,
    destination_protocol: url.protocol.replace(":", ""),
    current_pathname: input.pathname,
    opens_in_new_tab: input.opensInNewTab,
    ...destinationUtm,
  });
}
