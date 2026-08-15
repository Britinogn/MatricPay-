"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMatricNumber = normalizeMatricNumber;
exports.isBlankStudentRow = isBlankStudentRow;
function normalizeMatricNumber(matricNumber) {
    return matricNumber.trim().replace(/\s+/g, "").toUpperCase();
}
function isBlankStudentRow(row) {
    return Object.values(row).every((value) => {
        return value === undefined || value === null || String(value).trim() === "";
    });
}
//# sourceMappingURL=matric-number.js.map