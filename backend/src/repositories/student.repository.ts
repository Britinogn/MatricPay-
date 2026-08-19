import type { Campaign, Prisma, Student } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type StudentListFilters = {
  campaignId: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type StudentListResult = {
  students: Student[];
  total: number;
  page: number;
  limit: number;
};

function toStudentUpdateInput(
  data: Prisma.StudentUncheckedCreateInput
): Prisma.StudentUncheckedUpdateInput {
  const update: Prisma.StudentUncheckedUpdateInput = {
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

export class StudentRepository {
  async findCampaignById(id: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({ where: { id } });
  }

  async findCampaignBySlug(slug: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({ where: { slug } });
  }

  async findByCampaignAndMatricNumber(
    campaignId: string,
    matricNumber: string
  ): Promise<Student | null> {
    return prisma.student.findUnique({
      where: {
        campaignId_matricNumber: {
          campaignId,
          matricNumber,
        },
      },
    });
  }

  async upsertStudent(data: Prisma.StudentUncheckedCreateInput): Promise<Student> {
    return prisma.student.upsert({
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

  async upsertManyStudents(students: Prisma.StudentUncheckedCreateInput[]): Promise<Student[]> {
    return prisma.$transaction(async (transaction) => {
      const savedStudents: Student[] = [];

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

  async listByCampaign(filters: StudentListFilters): Promise<StudentListResult> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
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

    const [students, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      total,
      page,
      limit,
    };
  }

  async countByCampaign(campaignId: string): Promise<number> {
    return prisma.student.count({ where: { campaignId } });
  }

  async createStudentImport(data: Prisma.StudentImportUncheckedCreateInput) {
    return prisma.studentImport.create({ data });
  }

  async findByIdAndCampaignId(studentId: string, campaignId: string) {
    return prisma.student.findFirst({
      where: {
        id: studentId,
        campaignId,
      },
    });
  }

  async deleteById(studentId: string) {
    return prisma.student.delete({
      where: { id: studentId },
    });
  }

  async updateById(
    studentId: string,
    data: {
      fullName?: string;
      matricNumber?: string;
      email?: string | null;
      phone?: string | null;
      department?: string | null;
      level?: string | null;
    }
  ) {
    return prisma.student.update({
      where: { id: studentId },
      data,
    });
  }
  
  async deleteManyByIds(campaignId: string, studentIds: string[]) {
    const result = await prisma.student.deleteMany({
      where: {
        campaignId,
        id: { in: studentIds },
      },
    });
    return result.count;
  }

}

export const studentRepository = new StudentRepository();
