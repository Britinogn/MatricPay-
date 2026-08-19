import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import type { Student } from "../../types";
import {
  useBulkDeleteStudents,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "../../hooks/useStudents";
import { ConfirmModal } from "../ui/ConfirmModal";
import { StudentForm } from "./StudentForm";

interface StudentListProps {
  campaignId: string;
  /** Only draft campaigns can edit/delete */
  canManage?: boolean;
}

export function StudentList({
  campaignId,
  canManage = false,
}: StudentListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const { data, isLoading, isError, refetch } = useStudents(campaignId, {
    search,
    page,
    limit,
  });

  const deleteStudent = useDeleteStudent(campaignId);
  const bulkDelete = useBulkDeleteStudents(campaignId);
  const updateStudent = useUpdateStudent(campaignId);

  const students = useMemo(() => data?.students ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Debounce search input and reset page + selection
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
      setSelected(new Set());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const goToPage = (newPage: number) => {
    setPage(newPage);
    setSelected(new Set());
  };

  const allOnPageSelected = useMemo(
    () => students.length > 0 && students.every((s) => selected.has(s.id)),
    [students, selected]
  );

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        students.forEach((s) => next.delete(s.id));
      } else {
        students.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or matric number"
            className="w-full rounded-xl border border-(--border) bg-(--background) py-2.5 pl-9 pr-3 text-sm outline-none focus:border-(--primary)"
          />
        </div>

        {canManage && selected.size > 0 && (
          <button
            type="button"
            onClick={() => setShowBulkDelete(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            Delete selected ({selected.size})
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
        {isLoading ? (
          <p className="px-4 py-8 text-center text-sm text-(--text-muted)">
            Loading students…
          </p>
        ) : isError ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-(--text-muted)">Couldn’t load students.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-(--primary)"
            >
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-(--text-muted)">
            {search ? "No students match your search." : "No students yet."}
          </p>
        ) : (
          <>
            {canManage && (
              <div className="flex items-center gap-3 border-b border-(--border) px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="h-4 w-4 accent-(--primary)"
                />
                <span className="text-xs text-(--text-muted)">
                  Select page · {total} total
                </span>
              </div>
            )}

            <div className="divide-y divide-(--border)">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {canManage && (
                    <input
                      type="checkbox"
                      checked={selected.has(student.id)}
                      onChange={() => toggleOne(student.id)}
                      className="h-4 w-4 shrink-0 accent-(--primary)"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-(--text-primary)">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {student.matricNumber}
                      {student.department ? ` · ${student.department}` : ""}
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => setStudentToEdit(student)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) hover:bg-(--background) hover:text-(--text-primary)"
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setStudentToDelete(student)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-muted) hover:bg-red-50 hover:text-red-600"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-(--text-muted)">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              className="rounded-xl border border-(--border) px-3 py-1.5 text-(--text-primary) disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="rounded-xl border border-(--border) px-3 py-1.5 text-(--text-primary) disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Single delete modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Remove student?"
        message={
          studentToDelete
            ? `Remove “${studentToDelete.fullName}” (${studentToDelete.matricNumber}) from this campaign?`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={deleteStudent.isPending}
        onConfirm={() => {
          if (!studentToDelete) return;
          deleteStudent.mutate(studentToDelete.id, {
            onSuccess: () => {
              toast.success("Student removed");
              setStudentToDelete(null);
            },
            onError: (err: unknown) => {
              const axiosError = err as {
                response?: { data?: { message?: string } };
              };
              toast.error(
                axiosError.response?.data?.message || "Failed to remove student"
              );
            },
          });
        }}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* Bulk delete modal */}
      <ConfirmModal
        isOpen={showBulkDelete}
        title="Delete selected students?"
        message={`You are about to remove ${selected.size} student(s) from this campaign. This cannot be undone.`}
        confirmLabel="Delete selected"
        cancelLabel="Cancel"
        tone="danger"
        isLoading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate([...selected], {
            onSuccess: (res) => {
              toast.success(res?.message || "Students removed");
              setShowBulkDelete(false);
              setSelected(new Set());
            },
            onError: (err: unknown) => {
              const axiosError = err as {
                response?: { data?: { message?: string } };
              };
              toast.error(
                axiosError.response?.data?.message || "Failed to delete students"
              );
            },
          });
        }}
        onCancel={() => setShowBulkDelete(false)}
      />

      {/* Edit modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setStudentToEdit(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xl">
            <h2
              className="text-lg font-semibold text-(--text-primary)"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Edit student
            </h2>
            <div className="mt-4">
              <StudentForm
                isSubmitting={updateStudent.isPending}
                initialValues={{
                  fullName: studentToEdit.fullName,
                  matricNumber: studentToEdit.matricNumber,
                  email: studentToEdit.email || "",
                  phone: studentToEdit.phone || "",
                  department: studentToEdit.department || "",
                  level: studentToEdit.level || "",
                }}
                onSubmit={(values) => {
                  updateStudent.mutate(
                    {
                      studentId: studentToEdit.id,
                      payload: values,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Student updated");
                        setStudentToEdit(null);
                      },
                      onError: (err: unknown) => {
                        const axiosError = err as {
                          response?: { data?: { message?: string } };
                        };
                        toast.error(
                          axiosError.response?.data?.message ||
                            "Failed to update student"
                        );
                      },
                    }
                  );
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setStudentToEdit(null)}
              className="mt-3 w-full text-sm text-(--text-muted) hover:text-(--text-primary)"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}