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