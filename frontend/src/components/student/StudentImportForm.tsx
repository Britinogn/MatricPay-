import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileUploadIcon } from "@hugeicons/core-free-icons";
// if FileUploadIcon fails, try: Upload01Icon, Upload02Icon, or AttachmentIcon

interface StudentImportFormProps {
  isSubmitting?: boolean;
  onImport: (file: File) => void;
}

export function StudentImportForm({
  isSubmitting = false,
  onImport,
}: StudentImportFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface) p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-(--text-primary)">
            Import students
          </p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Upload a CSV or Excel file (.csv, .xlsx)
          </p>
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-medium text-(--text-primary) hover:bg-(--background) disabled:opacity-60"
        >
          <HugeiconsIcon icon={FileUploadIcon} size={16} />
          {isSubmitting ? "Uploading..." : "Choose file"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}