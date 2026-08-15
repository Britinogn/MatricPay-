import * as XLSX from "xlsx";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";
import { isBlankStudentRow } from "../utils/matric-number";
import type { StudentInput } from "../validators/student.validator";

type RawExcelRow = Record<string, string | number | undefined>;

const HEADER_ALIASES: Record<keyof StudentInput, string[]> = {
  matricNumber: ["matricnumber", "matric_number", "matric no", "matric_no", "matric", "matriculationnumber", "matriculation_number"],
  fullName: ["fullname", "full_name", "name", "studentname", "student_name"],
  email: ["email", "emailaddress", "email_address"],
  phone: ["phone", "phonenumber", "phone_number", "mobile"],
  department: ["department", "dept"],
  level: ["level", "year"],
};

function normalizeHeader(header: string): string {
  return String(header).trim().toLowerCase().replace(/\s+/g, " ");
}

function getValue(row: RawExcelRow, field: keyof StudentInput): string | undefined {
  for (const alias of HEADER_ALIASES[field]) {
    const value = row[alias];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return undefined;
}

export function parseStudentsExcel(buffer: Buffer): StudentInput[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new HttpError(400, "Excel file is empty or corrupted");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: "",
  });

  if (rawData.length === 0) {
    throw new HttpError(400, "Excel sheet contains no data");
  }

  if (rawData.length > env.MAX_UPLOAD_ROWS) {
    throw new HttpError(400, `Excel file cannot exceed ${env.MAX_UPLOAD_ROWS} rows`);
  }

  // Normalize column keys for each row
  const rows: RawExcelRow[] = rawData.map((row) => {
    const normalizedRow: RawExcelRow = {};
    for (const [key, value] of Object.entries(row)) {
      normalizedRow[normalizeHeader(key)] = value;
    }
    return normalizedRow;
  });

  return rows
    .filter((row) => !isBlankStudentRow(row as any))
    .map((row, index) => {
      const matricNumber = getValue(row, "matricNumber");
      const fullName = getValue(row, "fullName");

      if (!matricNumber || !fullName) {
        throw new HttpError(400, `Excel row ${index + 2} must include matric number and full name`);
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
