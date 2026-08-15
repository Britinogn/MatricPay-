"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRepository = exports.StudentRepository = void 0;
const prisma_1 = require("../lib/prisma");
function toStudentUpdateInput(data) {
    const update = {
        fullName: data.fullName,
    };
    if (data.email !== undefined) {
        update.email = data.email;
    }
    if (data.phone !== undefined) {
        update.phone = data.phone;
    }
    if (data.department !== undefined) {
        update.department = data.department;
    }
    if (data.level !== undefined) {
        update.level = data.level;
    }
    return update;
}
class StudentRepository {
    async findCampaignById(id) {
        return prisma_1.prisma.campaign.findUnique({ where: { id } });
    }
    async findCampaignBySlug(slug) {
        return prisma_1.prisma.campaign.findUnique({ where: { slug } });
    }
    async findByCampaignAndMatricNumber(campaignId, matricNumber) {
        return prisma_1.prisma.student.findUnique({
            where: {
                campaignId_matricNumber: {
                    campaignId,
                    matricNumber,
                },
            },
        });
    }
    async upsertStudent(data) {
        return prisma_1.prisma.student.upsert({
            where: {
                campaignId_matricNumber: {
                    campaignId: data.campaignId,
                    matricNumber: data.matricNumber,
                },
            },
            create: data,
            update: toStudentUpdateInput(data),
        });
    }
    async upsertManyStudents(students) {
        return prisma_1.prisma.$transaction(async (transaction) => {
            const savedStudents = [];
            for (const student of students) {
                const savedStudent = await transaction.student.upsert({
                    where: {
                        campaignId_matricNumber: {
                            campaignId: student.campaignId,
                            matricNumber: student.matricNumber,
                        },
                    },
                    create: student,
                    update: toStudentUpdateInput(student),
                });
                savedStudents.push(savedStudent);
            }
            return savedStudents;
        });
    }
    async listByCampaign(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {
            campaignId: filters.campaignId,
        };
        if (filters.search) {
            where.OR = [
                { matricNumber: { contains: filters.search, mode: "insensitive" } },
                { fullName: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
                { department: { contains: filters.search, mode: "insensitive" } },
            ];
        }
        const [students, total] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.student.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.student.count({ where }),
        ]);
        return {
            students,
            total,
            page,
            limit,
        };
    }
    async countByCampaign(campaignId) {
        return prisma_1.prisma.student.count({ where: { campaignId } });
    }
    async createStudentImport(data) {
        return prisma_1.prisma.studentImport.create({ data });
    }
}
exports.StudentRepository = StudentRepository;
exports.studentRepository = new StudentRepository();
//# sourceMappingURL=student.repository.js.map