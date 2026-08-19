import { CampaignStatus, CampaignType, StudentImportMethod, UserRole } from "@prisma/client";
import { studentRepository } from "../repositories/student.repository";
import { HttpError } from "../utils/http-error";
import { normalizeMatricNumber } from "../utils/matric-number";
import type {
  CreateStudentsInput,
  StudentInput,
  StudentListQueryInput,
  ValidateStudentInput,
  UpdateStudentInput,
  BulkDeleteStudentsInput,
} from "../validators/student.validator";

type AuthUser = {
  id: string;
  role: UserRole;
};

type AddStudentsOptions = {
  method: StudentImportMethod;
  originalName?: string;
};

function isCampaignExpired(campaign: { status: CampaignStatus; expiresAt: Date | null }) {
  return (
    campaign.status === CampaignStatus.active &&
    campaign.expiresAt !== null &&
    campaign.expiresAt.getTime() < Date.now()
  );
}

function normalizeStudentInput(student: StudentInput) {
  return {
    matricNumber: normalizeMatricNumber(student.matricNumber),
    fullName: student.fullName.trim(),
    email: student.email?.trim().toLowerCase() || null,
    phone: student.phone?.trim() || null,
    department: student.department?.trim() || null,
    level: student.level?.trim() || null,
  };
}

function dedupeStudents(students: StudentInput[]) {
  const seen = new Set<string>();
  const deduped: ReturnType<typeof normalizeStudentInput>[] = [];
  let skippedRows = 0;

  for (const student of students) {
    const normalized = normalizeStudentInput(student);

    if (!normalized.matricNumber || !normalized.fullName) {
      skippedRows += 1;
      continue;
    }

    if (seen.has(normalized.matricNumber)) {
      skippedRows += 1;
      continue;
    }

    seen.add(normalized.matricNumber);
    deduped.push(normalized);
  }

  return { deduped, skippedRows };
}

export class StudentService {
  async addStudents(
    user: AuthUser,
    campaignId: string,
    input: CreateStudentsInput,
    options: AddStudentsOptions
  ) {
    const campaign = await this.getOwnedCampaign(user, campaignId);

    if (campaign.campaignType !== CampaignType.restricted) {
      throw new HttpError(400, "Students can only be imported into restricted campaigns");
    }

    if (campaign.status !== CampaignStatus.draft) {
      throw new HttpError(400, "Students can only be imported before campaign activation");
    }

    const { deduped, skippedRows } = dedupeStudents(input.students);

    if (deduped.length === 0) {
      throw new HttpError(400, "No valid students were provided");
    }

    try {
      const students = await studentRepository.upsertManyStudents(
        deduped.map((student) => ({
          campaignId: campaign.id,
          matricNumber: student.matricNumber,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          department: student.department,
          level: student.level,
        }))
      );

      await studentRepository.createStudentImport({
        campaignId: campaign.id,
        importedById: user.id,
        method: options.method,
        status: "completed",
        originalName: options.originalName ?? null,
        totalRows: input.students.length,
        processedRows: input.students.length,
        successfulRows: students.length,
        failedRows: 0,
        skippedRows,
      });

      return {
        message: "Students imported successfully",
        totalRows: input.students.length,
        successfulRows: students.length,
        skippedRows,
        students,
      };
    } catch (error) {
      await studentRepository.createStudentImport({
        campaignId: campaign.id,
        importedById: user.id,
        method: options.method,
        status: "failed",
        originalName: options.originalName ?? null,
        totalRows: input.students.length,
        processedRows: 0,
        successfulRows: 0,
        failedRows: input.students.length,
        skippedRows,
        errors: {
          message: error instanceof Error ? error.message : "Student import failed",
        },
      });

      throw error;
    }
  }

  async listStudents(user: AuthUser, campaignId: string, query: StudentListQueryInput) {
    const campaign = await this.getOwnedCampaign(user, campaignId);

    return studentRepository.listByCampaign({
      campaignId: campaign.id,
      ...(query.search ? { search: query.search } : {}),
      page: query.page,
      limit: query.limit,
    });
  }

  async validateStudent(slug: string, input: ValidateStudentInput) {
    const campaign = await studentRepository.findCampaignBySlug(slug);

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    if (campaign.campaignType !== CampaignType.restricted) {
      throw new HttpError(400, "Student validation is only available for restricted campaigns");
    }

    if (campaign.status !== CampaignStatus.active || isCampaignExpired(campaign)) {
      throw new HttpError(400, "Campaign is not accepting payments");
    }

    const matricNumber = normalizeMatricNumber(input.matricNumber);
    const student = await studentRepository.findByCampaignAndMatricNumber(
      campaign.id,
      matricNumber
    );

    if (!student) {
      throw new HttpError(404, "Student not found for this campaign");
    }

    return {
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        fullName: student.fullName,
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
        amount: campaign.amount,
        amountType: campaign.amountType,
        currency: campaign.currency,
        slug: campaign.slug,
        campaignType: campaign.campaignType,
        status: campaign.status,
      },
    };
  }

  private async getOwnedCampaign(user: AuthUser, campaignId: string) {
    const campaign = await studentRepository.findCampaignById(campaignId);

    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    if (user.role !== UserRole.admin && campaign.organizerId !== user.id) {
      throw new HttpError(404, "Campaign not found");
    }

    return campaign;
  }

  async deleteStudent(user: AuthUser, campaignId: string, studentId: string) {
  const campaign = await this.getOwnedCampaign(user, campaignId);

  // Only allow edits on draft campaigns (same rule as add/import)
  if (campaign.status !== CampaignStatus.draft) {
    throw new HttpError(
      400,
      "Students can only be removed before campaign activation"
    );
  }

  const student = await studentRepository.findByIdAndCampaignId(
      studentId,
      campaign.id
    );

    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    await studentRepository.deleteById(student.id);

    return {
      success: true,
      message: "Student removed",
    };
  }

  async updateStudent(
    user: AuthUser,
    campaignId: string,
    studentId: string,
    input: UpdateStudentInput
  ) {
    const campaign = await this.getOwnedCampaign(user, campaignId);
  
    if (campaign.status !== CampaignStatus.draft) {
      throw new HttpError(400, "Students can only be edited before campaign activation");
    }
  
    const student = await studentRepository.findByIdAndCampaignId(
      studentId,
      campaign.id
    );
  
    if (!student) {
      throw new HttpError(404, "Student not found");
    }
  
    const data: {
      fullName?: string;
      matricNumber?: string;
      email?: string | null;
      phone?: string | null;
      department?: string | null;
      level?: string | null;
    } = {};
  
    if (input.fullName !== undefined) {
      data.fullName = input.fullName.trim();
    }
  
    if (input.matricNumber !== undefined) {
      const matricNumber = normalizeMatricNumber(input.matricNumber);
      if (!matricNumber) {
        throw new HttpError(400, "Invalid matric number");
      }
  
      // uniqueness check if matric is changing
      if (matricNumber !== student.matricNumber) {
        const existing = await studentRepository.findByCampaignAndMatricNumber(
          campaign.id,
          matricNumber
        );
        if (existing) {
          throw new HttpError(400, "A student with this matric number already exists");
        }
      }
  
      data.matricNumber = matricNumber;
    }
  
    if (input.email !== undefined) {
      data.email = input.email?.trim().toLowerCase() || null;
    }
    if (input.phone !== undefined) {
      data.phone = input.phone?.trim() || null;
    }
    if (input.department !== undefined) {
      data.department = input.department?.trim() || null;
    }
    if (input.level !== undefined) {
      data.level = input.level?.trim() || null;
    }
  
    const updated = await studentRepository.updateById(student.id, data);
  
    return { student: updated };
  }
  
  async bulkDeleteStudents(
    user: AuthUser,
    campaignId: string,
    input: BulkDeleteStudentsInput
  ) {
    const campaign = await this.getOwnedCampaign(user, campaignId);
  
    if (campaign.status !== CampaignStatus.draft) {
      throw new HttpError(400, "Students can only be removed before campaign activation");
    }
  
    const deleted = await studentRepository.deleteManyByIds(
      campaign.id,
      input.studentIds
    );
  
    return {
      success: true,
      deleted,
      message: `${deleted} student(s) removed`,
    };
  }

}

export const studentService = new StudentService();
