export function parseTimeStringToDate(timeString: string): Date {
  if (typeof timeString === "object") {
    const date = new Date();
    date.setHours(0, 10);
    date.setMinutes(0, 10);
    date.setSeconds(1, 10);
    date.setMilliseconds(0);
    return date;
  }
  const parts = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(parts[0], 10));
  date.setMinutes(parseInt(parts[1], 10));
  date.setSeconds(parseInt(parts[2], 10));
  date.setMilliseconds(0);
  return date;
}

export function formatDateToTimeString(date: Date): string {
  if (!date) {
    return "00:00:00";
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
