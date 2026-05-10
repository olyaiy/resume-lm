export const EMAIL_SIGNUP_BLOCKED_MESSAGE =
  "New accounts must be created with Google. Existing users can still sign in with email and password.";

export function isEmailSignupAllowed() {
  return false;
}

export function getEmailSignupBlockedMessage() {
  return EMAIL_SIGNUP_BLOCKED_MESSAGE;
}
