export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://resumelm.ca").replace(/\/+$/, "");

export const GITHUB_REPO_URL = "https://github.com/olyaiy/resume-lm";
export const CREATOR_X_URL = "https://x.com/alexfromvan";
export const CREATOR_LINKEDIN_URL = "https://linkedin.com/in/olyaiy";
export const SUPPORT_EMAIL = "resumelm@pm.me";

export function siteUrl(path = "") {
  if (!path) return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
