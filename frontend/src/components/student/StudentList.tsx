import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import type { Student } from "../../types";
import { useDeleteStudent } from "../../hooks/useStudents";

interface StudentListProps {
  campaignId: string;
  students: Student[];
  isLoading?: boolean;
}

export function StudentList({
  campaignId,
  students,
  isLoading,
}: StudentListProps) {
  const deleteStudent = useDeleteStudent(campaignId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-muted)">
        Loading students…
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-muted)">
        No students yet. Add students manually or import a file.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
      <div className="divide-y divide-(--border)">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-(--text-primary)">
                {student.fullName}
              </p>
              <p className="text-xs text-(--text-muted)">
                {student.matricNumber}
                {student.department ? ` · ${student.department}` : ""}
              </p>
            </div>

            <button
              type="button"
              title="Remove student"
              disabled={deleteStudent.isPending}
              onClick={() => {
                if (!window.confirm(`Remove ${student.fullName}?`)) return;

                deleteStudent.mutate(student.id, {
                  onSuccess: () => toast.success("Student removed"),
                  onError: (err: unknown) => {
                    const axiosError = err as {
                      response?: { data?: { message?: string } };
                    };
                    toast.error(
                      axiosError.response?.data?.message ||
                        "Failed to remove student"
                    );
                  },
                });
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-(--text-muted) transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}