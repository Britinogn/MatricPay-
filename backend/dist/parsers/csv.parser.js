"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStudentsCsv = parseStudentsCsv;
const sync_1 = require("csv-parse/sync");
const env_1 = require("../config/env");
const http_error_1 = require("../utils/http-error");
const matric_number_1 = require("../utils/matric-number");
const HEADER_ALIASES = {
    matricNumber: ["matricnumber", "matric_number", "matric no", "matric_no", "matric", "matriculationnumber", "matriculation_number"],
    fullName: ["fullname", "full_name", "name", "studentname", "student_name"],
    email: ["email", "emailaddress", "email_address"],
    phone: ["phone", "phonenumber", "phone_number", "mobile"],
    department: ["department", "dept"],
    level: ["level", "year"],
};
function normalizeHeader(header) {
    return header.trim().toLowerCase().replace(/\s+/g, " ");
}
function getValue(row, field) {
    for (const alias of HEADER_ALIASES[field]) {
        const value = row[alias];
        if (value !== undefined && value.trim() !== "") {
            return value.trim();
        }
    }
    return undefined;
}
function parseStudentsCsv(buffer) {
    const rows = (0, sync_1.parse)(buffer, {
        columns: (headers) => headers.map(normalizeHeader),
        skip_empty_lines: true,
        trim: true,
    });
    if (rows.length > env_1.env.MAX_UPLOAD_ROWS) {
        throw new http_error_1.HttpError(400, `CSV cannot exceed ${env_1.env.MAX_UPLOAD_ROWS} rows`);
    }
    return rows
        .filter((row) => !(0, matric_number_1.isBlankStudentRow)(row))
        .map((row, index) => {
        const matricNumber = getValue(row, "matricNumber");
        const fullName = getValue(row, "fullName");
        if (!matricNumber || !fullName) {
            throw new http_error_1.HttpError(400, `CSV row ${index + 2} must include matric number and full name`);
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
//# sourceMappingURL=csv.parser.js.map