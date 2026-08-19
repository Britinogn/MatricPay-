import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreateStudentPayload, Student } from "../types";

export type StudentsQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type StudentsListResult = {
  students: Student[];
  total: number;
  page: number;
  limit: number;
};

export function useStudents(
  campaignId: string | undefined,
  query: StudentsQuery = {}
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const search = query.search?.trim() || undefined;

  return useQuery({
    queryKey: ["campaigns", campaignId, "students", { page, limit, search }],
    queryFn: async (): Promise<StudentsListResult> => {
      const res = await api.get(`/campaigns/${campaignId}/students`, {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      });

      const payload = res.data.data ?? res.data;
      const students = payload.students ?? payload;
      return {
        students: Array.isArray(students) ? students : [],
        total: payload.total ?? (Array.isArray(students) ? students.length : 0),
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
      };
    },
    enabled: !!campaignId,
  });
}

export function useAddStudent(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const res = await api.post(`/campaigns/${campaignId}/students`, {
        students: [payload],
      });
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateStudent(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      payload,
    }: {
      studentId: string;
      payload: Partial<CreateStudentPayload>;
    }) => {
      const res = await api.patch(
        `/campaigns/${campaignId}/students/${studentId}`,
        payload
      );
      return res.data.student ?? res.data.data ?? res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteStudent(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await api.delete(
        `/campaigns/${campaignId}/students/${studentId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkDeleteStudents(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentIds: string[]) => {
      const res = await api.post(
        `/campaigns/${campaignId}/students/bulk-delete`,
        { studentIds }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useImportStudentsCsv(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post(
        `/campaigns/${campaignId}/students/import/csv`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
    },
  });
}