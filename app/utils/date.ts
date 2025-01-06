export function getOrdinalSuffix(day: number): string {
  const j = day % 10;
  const k = day % 100;
  
  if (j === 1 && k !== 11) {
    return day + "st";
  }
  if (j === 2 && k !== 12) {
    return day + "nd";
  }
  if (j === 3 && k !== 13) {
    return day + "rd";
  }
  return day + "th";
}

export function getDayFromOrdinal(ordinal: string): number {
  // Handle both formats: "1st" and "1"
  const match = ordinal.match(/^(\d+)(st|nd|rd|th)?$/);
  if (!match) return NaN;
  
  const day = parseInt(match[1], 10);
  if (isNaN(day) || day < 1 || day > 31) return NaN;
  
  return day;
} 