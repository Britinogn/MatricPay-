export function normalizeMatricNumber(matricNumber: string): string {
  return matricNumber.trim().replace(/\s+/g, "").toUpperCase();
}

export function isBlankStudentRow(row: Record<string, unknown>): boolean {
  return Object.values(row).every((value) => {
    return value === undefined || value === null || String(value).trim() === "";
  });
}
