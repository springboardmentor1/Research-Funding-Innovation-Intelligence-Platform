export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export function validateEmail(value) {
  if (!value) return "Email is required.";
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (!PASSWORD_REGEX.test(value)) {
    return "Password needs 8+ characters with an uppercase, lowercase, number, and symbol.";
  }
  return null;
}

export function validateUsername(value) {
  if (!value) return "Username is required.";
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (!USERNAME_REGEX.test(value)) return "Only letters, numbers, dots, hyphens and underscores allowed.";
  return null;
}

export function validateFullName(value) {
  if (!value || value.trim().length < 2) return "Full name must be at least 2 characters.";
  return null;
}

export function extractErrorMessage(error) {
  const detail = error?.response?.data?.error || error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg).join(" ");
  }
  return detail || error?.message || "Something went wrong. Please try again.";
}
