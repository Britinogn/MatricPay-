import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreateStudentPayload, Student } from "../types";

export function useStudents(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaigns", campaignId, "students"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Student[] }>(
        `/campaigns/${campaignId}/students`
      );
      return data.data;
    },
    enabled: !!campaignId,
  });
}

export function useAddStudent(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const { data } = await api.post<{ data: Student }>(
        `/campaigns/${campaignId}/students`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", campaignId, "students"],
      });
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

export function useValidateStudent() {
  return useMutation({
    mutationFn: async ({
      slug,
      matricNumber,
    }: {
      slug: string;
      matricNumber: string;
    }) => {
      const { data } = await api.post(`/campaigns/slug/${slug}/students/validate`, {
        matricNumber,
      });
      return data.data;
    },
  });
}