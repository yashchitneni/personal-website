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
  return parseInt(ordinal.replace(/(st|nd|rd|th)$/, ''));
} 