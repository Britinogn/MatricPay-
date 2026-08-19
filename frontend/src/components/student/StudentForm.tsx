import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const studentSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(120),
  matricNumber: z.string().min(2, "Matric number is required").max(80),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  department: z.string().max(120).optional().or(z.literal("")),
  level: z.string().max(30).optional().or(z.literal("")),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  isSubmitting?: boolean;
  initialValues?: Partial<StudentFormValues>;
  submitLabel?: string;
  onSubmit: (values: StudentFormValues) => void;
}

export function StudentForm({
  isSubmitting = false,
  initialValues,
  submitLabel = "Add student",
  onSubmit,
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: initialValues?.fullName ?? "",
      matricNumber: initialValues?.matricNumber ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      department: initialValues?.department ?? "",
      level: initialValues?.level ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
      })}
      className="space-y-4"
    >
      {/* Form fields remain unchanged */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Full name
          </label>
          <input
            {...register("fullName")}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            placeholder="Jane Smith"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Matric number
          </label>
          <input
            {...register("matricNumber")}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
            placeholder="FCP/CSC/20/1001"
          />
          {errors.matricNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.matricNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Email <span className="text-(--text-muted)">(optional)</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-(--text-primary)">
            Department <span className="text-(--text-muted)">(optional)</span>
          </label>
          <input
            {...register("department")}
            className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-2.5 text-sm outline-none focus:border-(--primary)"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--primary-hover) disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}