// Player names. Each player has:
// - a username, shown in the game and typed to rejoin. Its normalized form is
//   the nameKey: the Firestore doc id (players/{nameKey}) and the cookie value,
//   so "Lilo", " lilo " and "LILO" are all the same player.
// - a full name, seen only on the admin dashboard.

export const MAX_USERNAME_LENGTH = 20;
export const MAX_FULL_NAME_LENGTH = 50;

// Letters (any script), digits, spaces and a little punctuation. This also keeps
// keys valid as Firestore doc ids: no "/", and never just dots.
const USERNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '.&-]*$/u;

// Trims and collapses runs of whitespace; keeps the player's capitalization.
export function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeUsername(username: string): string {
  return cleanName(username).toLowerCase();
}

// Returns an error message, or undefined if the username is fine.
export function validateUsername(username: string): string | undefined {
  const cleaned = cleanName(username);
  if (!cleaned) return "Pick a username";
  if (cleaned.length > MAX_USERNAME_LENGTH) {
    return `Keep your username to ${MAX_USERNAME_LENGTH} characters or fewer`;
  }
  if (!USERNAME_PATTERN.test(cleaned)) {
    return "Use letters, numbers and spaces in your username";
  }
  return undefined;
}

// Only ever rendered as text on the admin page, so any characters are fine.
export function validateFullName(fullName: string): string | undefined {
  const cleaned = cleanName(fullName);
  if (!cleaned) return "Enter your full name";
  if (cleaned.length > MAX_FULL_NAME_LENGTH) {
    return `Keep your full name to ${MAX_FULL_NAME_LENGTH} characters or fewer`;
  }
  return undefined;
}

// True for a well-formed key, e.g. from the player cookie.
export function isNameKey(value: string): boolean {
  return normalizeUsername(value) === value && validateUsername(value) === undefined;
}
