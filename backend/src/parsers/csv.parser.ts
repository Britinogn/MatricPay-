import { parse } from "csv-parse/sync";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";
import { isBlankStudentRow } from "../utils/matric-number";
import type { StudentInput } from "../validators/student.validator";

type RawCsvRow = Record<string, string | undefined>;

const HEADER_ALIASES: Record<keyof StudentInput, string[]> = {
  matricNumber: ["matricnumber", "matric_number", "matric no", "matric_no", "matric", "matriculationnumber", "matriculation_number"],
  fullName: ["fullname", "full_name", "name", "studentname", "student_name"],
  email: ["email", "emailaddress", "email_address"],
  phone: ["phone", "phonenumber", "phone_number", "mobile"],
  department: ["department", "dept"],
  level: ["level", "year"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function getValue(row: RawCsvRow, field: keyof StudentInput): string | undefined {
  for (const alias of HEADER_ALIASES[field]) {
    const value = row[alias];

    if (value !== undefined && value.trim() !== "") {
      return value.trim();
    }
  }

  return undefined;
}

export function parseStudentsCsv(buffer: Buffer): StudentInput[] {
  const rows = parse(buffer, {
    columns: (headers: string[]) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  }) as RawCsvRow[];

  if (rows.length > env.MAX_UPLOAD_ROWS) {
    throw new HttpError(400, `CSV cannot exceed ${env.MAX_UPLOAD_ROWS} rows`);
  }

  return rows
    .filter((row) => !isBlankStudentRow(row))
    .map((row, index) => {
      const matricNumber = getValue(row, "matricNumber");
      const fullName = getValue(row, "fullName");

      if (!matricNumber || !fullName) {
        throw new HttpError(400, `CSV row ${index + 2} must include matric number and full name`);
      }

      return {
        matricNumber,
        fullName,
        email: getValue(row, "email") ?? null,
        phone: getValue(row, "phone") ?? null,
        department: getValue(row, "department") ?? null,
        level: getValue(row, "level") ?? null,
      };
    });
}
