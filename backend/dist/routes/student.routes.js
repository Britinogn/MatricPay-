"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const auth_middleware_1 = require("../middleware/auth.middleware");
const student_controller_1 = require("../controllers/student.controller");
const http_error_1 = require("../utils/http-error");
const async_handler_1 = require("../utils/async-handler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: env_1.env.MAX_UPLOAD_SIZE,
    },
    fileFilter: (_request, file, callback) => {
        const filename = file.originalname.toLowerCase();
        const isCsv = file.mimetype === "text/csv" ||
            file.mimetype === "application/vnd.ms-excel" ||
            filename.endsWith(".csv");
        const isExcel = file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.mimetype === "application/wps-office.xlsx" ||
            filename.endsWith(".xlsx");
        if (!isCsv && !isExcel) {
            callback(new http_error_1.HttpError(400, "Only CSV (.csv) and Excel (.xlsx) files are allowed"));
            return;
        }
        callback(null, true);
    },
});
exports.studentRoutes = (0, express_1.Router)();
exports.studentRoutes.post("/slug/:slug/students/validate", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.validateStudent.bind(student_controller_1.studentController)));
exports.studentRoutes.use("/:id/students", auth_middleware_1.authMiddleware);
exports.studentRoutes.post("/:id/students", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.addStudents.bind(student_controller_1.studentController)));
exports.studentRoutes.get("/:id/students", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.listStudents.bind(student_controller_1.studentController)));
exports.studentRoutes.post("/:id/students/import/csv", upload.single("file"), (0, async_handler_1.asyncHandler)(student_controller_1.studentController.importCsv.bind(student_controller_1.studentController)));
exports.studentRoutes.post("/:id/students/import/excel", upload.single("file"), (0, async_handler_1.asyncHandler)(student_controller_1.studentController.importExcel.bind(student_controller_1.studentController)));
exports.studentRoutes.post("/:id/students/import/xlsx", upload.single("file"), (0, async_handler_1.asyncHandler)(student_controller_1.studentController.importExcel.bind(student_controller_1.studentController)));
exports.studentRoutes.delete("/:id/students/:studentId", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.removeStudent.bind(student_controller_1.studentController)));
// Update student
exports.studentRoutes.patch("/:id/students/:studentId", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.updateStudent.bind(student_controller_1.studentController)));
exports.studentRoutes.post("/:id/students/bulk-delete", (0, async_handler_1.asyncHandler)(student_controller_1.studentController.bulkDeleteStudents.bind(student_controller_1.studentController)));
//# sourceMappingURL=student.routes.js.map