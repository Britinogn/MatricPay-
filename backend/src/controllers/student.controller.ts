import type { Request, Response } from "express";
import { parseStudentsCsv } from "../parsers/csv.parser";
import { parseStudentsExcel } from "../parsers/excel.parser";
import { studentService } from "../services/student.service";
import { HttpError } from "../utils/http-error";
import {
  CampaignIdParamSchema,
  CampaignSlugParamSchema,
  CreateStudentsSchema,
  StudentListQuerySchema,
  ValidateStudentSchema,
} from "../validators/student.validator";

function requireAuthenticatedUser(request: Request) {
  if (!request.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return request.user;
}

export class StudentController {
  async addStudents(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const data = CreateStudentsSchema.parse(request.body);
    const result = await studentService.addStudents(user, id, data, {
      method: "manual",
    });

    response.status(201).json(result);
  }

  async importCsv(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);

    if (!request.file) {
      throw new HttpError(400, "CSV file is required");
    }

    const students = parseStudentsCsv(request.file.buffer);
    const data = CreateStudentsSchema.parse({ students });
    const result = await studentService.addStudents(user, id, data, {
      method: "csv",
      originalName: request.file.originalname,
    });

    response.status(201).json(result);
  }

  async importExcel(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);

    if (!request.file) {
      throw new HttpError(400, "Excel file is required");
    }

    const students = parseStudentsExcel(request.file.buffer);
    const data = CreateStudentsSchema.parse({ students });
    const result = await studentService.addStudents(user, id, data, {
      method: "xlsx",
      originalName: request.file.originalname,
    });

    response.status(201).json(result);
  }

  async listStudents(request: Request, response: Response): Promise<void> {
    const user = requireAuthenticatedUser(request);
    const { id } = CampaignIdParamSchema.parse(request.params);
    const query = StudentListQuerySchema.parse(request.query);
    const result = await studentService.listStudents(user, id, query);

    response.status(200).json(result);
  }

  async validateStudent(request: Request, response: Response): Promise<void> {
    const { slug } = CampaignSlugParamSchema.parse(request.params);
    const data = ValidateStudentSchema.parse(request.body);
    const result = await studentService.validateStudent(slug, data);

    response.status(200).json(result);
  }
}

export const studentController = new StudentController();
