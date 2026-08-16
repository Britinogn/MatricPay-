import type { StudentImportMethod, StudentImportStatus } from "./enums";

export interface Student {
    id: string;
    campaignId: string;
    matricNumber: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    department: string | null;
    level: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudentPayload {
    matricNumber: string;
    fullName: string;
    email?: string;
    phone?: string;
    department?: string;
    level?: string;
}

export interface StudentImport {
    id: string;
    campaignId: string;
    importedById: string;
    method: StudentImportMethod;
    status: StudentImportStatus;
    originalName: string | null;
    totalRows: number;
    processedRows: number;
    successfulRows: number;
    failedRows: number;
    skippedRows: number;
    errors: unknown;
    createdAt: string;
    completedAt: string | null;
}