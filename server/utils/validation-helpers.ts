export function validateNumericString(value: string, minLength: number, maxLength: number): boolean {
  if (typeof value !== "string") return false;
  if (value.length < minLength || value.length > maxLength) return false;
  return /^\d+$/.test(value);
}

export function sanitizeNumericInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateMonth(month: unknown): number | null {
  if (month === null || month === undefined) return null;
  const num = Number(month);
  if (isNaN(num) || num < 1 || num > 12) {
    throw createError({ statusCode: 400, message: "Invalid month. Must be 1-12" });
  }
  return num;
}

export function validateDay(day: unknown): string | null {
  if (!day) return null;
  if (day !== "1" && day !== "16") {
    throw createError({ statusCode: 400, message: "Invalid day. Must be '1' or '16'" });
  }
  return day as string;
}
