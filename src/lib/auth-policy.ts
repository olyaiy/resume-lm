export const EMAIL_SIGNUP_BLOCKED_MESSAGE =
  "Email signup is currently unavailable. You can still continue with Google.";

export function isEmailSignupAllowed() {
  return true;
}

export function getEmailSignupBlockedMessage() {
  return EMAIL_SIGNUP_BLOCKED_MESSAGE;
}
