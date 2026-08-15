"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStudentsExcel = parseStudentsExcel;
const XLSX = __importStar(require("xlsx"));
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
    return String(header).trim().toLowerCase().replace(/\s+/g, " ");
}
function getValue(row, field) {
    for (const alias of HEADER_ALIASES[field]) {
        const value = row[alias];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return String(value).trim();
        }
    }
    return undefined;
}
function parseStudentsExcel(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new http_error_1.HttpError(400, "Excel file is empty or corrupted");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
    });
    if (rawData.length === 0) {
        throw new http_error_1.HttpError(400, "Excel sheet contains no data");
    }
    if (rawData.length > env_1.env.MAX_UPLOAD_ROWS) {
        throw new http_error_1.HttpError(400, `Excel file cannot exceed ${env_1.env.MAX_UPLOAD_ROWS} rows`);
    }
    // Normalize column keys for each row
    const rows = rawData.map((row) => {
        const normalizedRow = {};
        for (const [key, value] of Object.entries(row)) {
            normalizedRow[normalizeHeader(key)] = value;
        }
        return normalizedRow;
    });
    return rows
        .filter((row) => !(0, matric_number_1.isBlankStudentRow)(row))
        .map((row, index) => {
        const matricNumber = getValue(row, "matricNumber");
        const fullName = getValue(row, "fullName");
        if (!matricNumber || !fullName) {
            throw new http_error_1.HttpError(400, `Excel row ${index + 2} must include matric number and full name`);
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
//# sourceMappingURL=excel.parser.js.map