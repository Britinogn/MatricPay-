import type { Student } from "../../types";

interface StudentListProps {
  students: Student[];
  isLoading?: boolean;
}

export function StudentList({ students, isLoading }: StudentListProps) {
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
            {student.email && (
              <p className="hidden text-xs text-(--text-muted) sm:block">
                {student.email}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}