"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = exports.StudentService = void 0;
const client_1 = require("@prisma/client");
const student_repository_1 = require("../repositories/student.repository");
const http_error_1 = require("../utils/http-error");
const matric_number_1 = require("../utils/matric-number");
function isCampaignExpired(campaign) {
    return (campaign.status === client_1.CampaignStatus.active &&
        campaign.expiresAt !== null &&
        campaign.expiresAt.getTime() < Date.now());
}
function normalizeStudentInput(student) {
    return {
        matricNumber: (0, matric_number_1.normalizeMatricNumber)(student.matricNumber),
        fullName: student.fullName.trim(),
        email: student.email?.trim().toLowerCase() || null,
        phone: student.phone?.trim() || null,
        department: student.department?.trim() || null,
        level: student.level?.trim() || null,
    };
}
function dedupeStudents(students) {
    const seen = new Set();
    const deduped = [];
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
class StudentService {
    async addStudents(user, campaignId, input, options) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.campaignType !== client_1.CampaignType.restricted) {
            throw new http_error_1.HttpError(400, "Students can only be imported into restricted campaigns");
        }
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Students can only be imported before campaign activation");
        }
        const { deduped, skippedRows } = dedupeStudents(input.students);
        if (deduped.length === 0) {
            throw new http_error_1.HttpError(400, "No valid students were provided");
        }
        try {
            const students = await student_repository_1.studentRepository.upsertManyStudents(deduped.map((student) => ({
                campaignId: campaign.id,
                matricNumber: student.matricNumber,
                fullName: student.fullName,
                email: student.email,
                phone: student.phone,
                department: student.department,
                level: student.level,
            })));
            await student_repository_1.studentRepository.createStudentImport({
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
        }
        catch (error) {
            await student_repository_1.studentRepository.createStudentImport({
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
    async listStudents(user, campaignId, query) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        return student_repository_1.studentRepository.listByCampaign({
            campaignId: campaign.id,
            ...(query.search ? { search: query.search } : {}),
            page: query.page,
            limit: query.limit,
        });
    }
    async validateStudent(slug, input) {
        const campaign = await student_repository_1.studentRepository.findCampaignBySlug(slug);
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        if (campaign.campaignType !== client_1.CampaignType.restricted) {
            throw new http_error_1.HttpError(400, "Student validation is only available for restricted campaigns");
        }
        if (campaign.status !== client_1.CampaignStatus.active || isCampaignExpired(campaign)) {
            throw new http_error_1.HttpError(400, "Campaign is not accepting payments");
        }
        const matricNumber = (0, matric_number_1.normalizeMatricNumber)(input.matricNumber);
        const student = await student_repository_1.studentRepository.findByCampaignAndMatricNumber(campaign.id, matricNumber);
        if (!student) {
            throw new http_error_1.HttpError(404, "Student not found for this campaign");
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
    async getOwnedCampaign(user, campaignId) {
        const campaign = await student_repository_1.studentRepository.findCampaignById(campaignId);
        if (!campaign) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        if (user.role !== client_1.UserRole.admin && campaign.organizerId !== user.id) {
            throw new http_error_1.HttpError(404, "Campaign not found");
        }
        return campaign;
    }
    async deleteStudent(user, campaignId, studentId) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        // Only allow edits on draft campaigns (same rule as add/import)
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Students can only be removed before campaign activation");
        }
        const student = await student_repository_1.studentRepository.findByIdAndCampaignId(studentId, campaign.id);
        if (!student) {
            throw new http_error_1.HttpError(404, "Student not found");
        }
        await student_repository_1.studentRepository.deleteById(student.id);
        return {
            success: true,
            message: "Student removed",
        };
    }
    async updateStudent(user, campaignId, studentId, input) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Students can only be edited before campaign activation");
        }
        const student = await student_repository_1.studentRepository.findByIdAndCampaignId(studentId, campaign.id);
        if (!student) {
            throw new http_error_1.HttpError(404, "Student not found");
        }
        const data = {};
        if (input.fullName !== undefined) {
            data.fullName = input.fullName.trim();
        }
        if (input.matricNumber !== undefined) {
            const matricNumber = (0, matric_number_1.normalizeMatricNumber)(input.matricNumber);
            if (!matricNumber) {
                throw new http_error_1.HttpError(400, "Invalid matric number");
            }
            // uniqueness check if matric is changing
            if (matricNumber !== student.matricNumber) {
                const existing = await student_repository_1.studentRepository.findByCampaignAndMatricNumber(campaign.id, matricNumber);
                if (existing) {
                    throw new http_error_1.HttpError(400, "A student with this matric number already exists");
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
        const updated = await student_repository_1.studentRepository.updateById(student.id, data);
        return { student: updated };
    }
    async bulkDeleteStudents(user, campaignId, input) {
        const campaign = await this.getOwnedCampaign(user, campaignId);
        if (campaign.status !== client_1.CampaignStatus.draft) {
            throw new http_error_1.HttpError(400, "Students can only be removed before campaign activation");
        }
        const deleted = await student_repository_1.studentRepository.deleteManyByIds(campaign.id, input.studentIds);
        return {
            success: true,
            deleted,
            message: `${deleted} student(s) removed`,
        };
    }
}
exports.StudentService = StudentService;
exports.studentService = new StudentService();
//# sourceMappingURL=student.service.js.map