import moment from "moment-timezone";

export const generateUsername = (fullName: string): string => {
  const names = fullName.toLowerCase().trim().split(/\s+/); // Split into parts
  let base = "";

  // Use first letter of first and last name if possible
  if (names.length >= 2) {
    base = names[0].charAt(0) + names[1].substring(0, 2); // e.g. "stu"
  } else {
    base = names[0].substring(0, 3); // fallback to first 3 letters of first name
  }

  // Add random letters or numbers to reach 5–6 characters
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const targetLength = Math.floor(Math.random() * 2) + 5; // 5 or 6
  while (base.length < targetLength) {
    base += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return base;
};

export const getFirstLetterFromName = (name: string) => {
  return name.slice(0, 1).toUpperCase();
};

/**
 * Format number into short form:
 *  - 10 -> "10"
 *  - 100 -> "100"
 *  - 1000 -> "1k"
 *  - 1200000 -> "1.2M"
 * Works for both numbers and numeric strings.
 */
export function formatValue(value: number | string): string {
  // Ensure number
  const num = typeof value === "string" ? Number(value) : value;

  if (isNaN(num)) return String(value); // return original if not a number

  if (num < 1000) return num.toString();

  if (num < 1_000_000) {
    return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
  }

  if (num < 1_000_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  }

  return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + "B";
}

// Time format 24 Hour to 12 Hour
export function formatTimeTo12Hour(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  let hourNum = parseInt(hours, 10);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  hourNum = hourNum % 12 || 12; // Convert "0" to "12"
  return `${hourNum}:${minutes} ${ampm}`;
}

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function displayValue(value?: string | null, fallback: string = "NA") {
  if (!value || value.trim() === "") {
    return fallback;
  }
  return value.trim();
}

export const limitText = (text: string = "", limit: number = 25): string => {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

// Get all available time zone strings like "Asia/Kolkata", "America/New_York"
export const timeZones = moment.tz.names();

// Get device’s current time zone
export const getSystemTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const today = new Date();
today.setDate(today.getDate());

export const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Get date one month from today
export const oneMonthFromNow = new Date();
oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
