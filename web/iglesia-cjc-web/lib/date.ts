const TZ = "America/Costa_Rica";

/** Fecha actual en Costa Rica como "YYYY-MM-DD" */
export function todayCR(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Ayer en Costa Rica como "YYYY-MM-DD" */
export function yesterdayCR(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

/** Hora actual en Costa Rica (0-23) */
export function hourCR(): number {
  return parseInt(
    new Intl.DateTimeFormat("es", { timeZone: TZ, hour: "numeric", hour12: false }).format(new Date()),
    10
  );
}

/** Formatea una fecha ISO o Date con zona horaria de Costa Rica */
export function formatDateCR(
  date: string | Date,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleDateString("es", { timeZone: TZ, ...options });
}
