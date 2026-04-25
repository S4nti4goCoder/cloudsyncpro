// Pragmatic email regex — covers ~99% of real addresses without false negatives.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

export function getPasswordError(value: string): string | null {
  if (!value) return "Ingresa una contraseña";
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  return null;
}
