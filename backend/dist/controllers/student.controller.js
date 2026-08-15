"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentController = exports.StudentController = void 0;
const csv_parser_1 = require("../parsers/csv.parser");
const excel_parser_1 = require("../parsers/excel.parser");
const student_service_1 = require("../services/student.service");
const http_error_1 = require("../utils/http-error");
const student_validator_1 = require("../validators/student.validator");
function requireAuthenticatedUser(request) {
    if (!request.user) {
        throw new http_error_1.HttpError(401, "Unauthorized");
    }
    return request.user;
}
class StudentController {
    async addStudents(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = student_validator_1.CampaignIdParamSchema.parse(request.params);
        const data = student_validator_1.CreateStudentsSchema.parse(request.body);
        const result = await student_service_1.studentService.addStudents(user, id, data, {
            method: "manual",
        });
        response.status(201).json(result);
    }
    async importCsv(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = student_validator_1.CampaignIdParamSchema.parse(request.params);
        if (!request.file) {
            throw new http_error_1.HttpError(400, "CSV file is required");
        }
        const students = (0, csv_parser_1.parseStudentsCsv)(request.file.buffer);
        const data = student_validator_1.CreateStudentsSchema.parse({ students });
        const result = await student_service_1.studentService.addStudents(user, id, data, {
            method: "csv",
            originalName: request.file.originalname,
        });
        response.status(201).json(result);
    }
    async importExcel(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = student_validator_1.CampaignIdParamSchema.parse(request.params);
        if (!request.file) {
            throw new http_error_1.HttpError(400, "Excel file is required");
        }
        const students = (0, excel_parser_1.parseStudentsExcel)(request.file.buffer);
        const data = student_validator_1.CreateStudentsSchema.parse({ students });
        const result = await student_service_1.studentService.addStudents(user, id, data, {
            method: "xlsx",
            originalName: request.file.originalname,
        });
        response.status(201).json(result);
    }
    async listStudents(request, response) {
        const user = requireAuthenticatedUser(request);
        const { id } = student_validator_1.CampaignIdParamSchema.parse(request.params);
        const query = student_validator_1.StudentListQuerySchema.parse(request.query);
        const result = await student_service_1.studentService.listStudents(user, id, query);
        response.status(200).json(result);
    }
    async validateStudent(request, response) {
        const { slug } = student_validator_1.CampaignSlugParamSchema.parse(request.params);
        const data = student_validator_1.ValidateStudentSchema.parse(request.body);
        const result = await student_service_1.studentService.validateStudent(slug, data);
        response.status(200).json(result);
    }
}
exports.StudentController = StudentController;
exports.studentController = new StudentController();
//# sourceMappingURL=student.controller.js.map