// ResumeLM hosted service sunset (October 2026).
// The open-source code stays available for anyone to fork and self-host.

export const SUNSET_DATE_LABEL = "October 31, 2026";
export const SUNSET_REPO_URL = "https://github.com/olyaiy/resume-lm";

// Flip to true only if the hosted service is ever revived.
export const NEW_CHECKOUTS_ENABLED: boolean = false;

export const SUNSET_CHECKOUT_MESSAGE =
  `ResumeLM is shutting down on ${SUNSET_DATE_LABEL}, so new subscriptions are closed. ` +
  "The code is open source if you want to self-host it.";
