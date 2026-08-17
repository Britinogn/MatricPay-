import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { CreateStudentPayload, } from "../types";

// export function useStudents(campaignId: string | undefined) {
//   return useQuery({
//     queryKey: ["campaigns", campaignId, "students"],
//     queryFn: async () => {
//       const { data } = await api.get<{ data: Student[] }>(
//         `/campaigns/${campaignId}/students`
//       );
//       return data.data;
//     },
//     enabled: !!campaignId,
//   });
// }

export function useStudents(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaigns", campaignId, "students"],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${campaignId}/students`);
      const payload = res.data.data ?? res.data;
      return payload.students ?? payload;
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
      const data = res.data.data ?? res.data;
      return data;
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

// export function useValidateStudent() {
//   return useMutation({
//     mutationFn: async ({
//       slug,
//       matricNumber,
//     }: {
//       slug: string;
//       matricNumber: string;
//     }) => {
//       const { data } = await api.post(`/campaigns/slug/${slug}/students/validate`, {
//         matricNumber,
//       });
//       return data.data;
//     },
//   });
// }


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