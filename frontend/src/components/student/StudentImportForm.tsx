import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileUploadIcon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";

interface StudentImportFormProps {
  isSubmitting?: boolean;
  onImport: (file: File) => void;
}

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function StudentImportForm({
  isSubmitting = false,
  onImport,
}: StudentImportFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Use CSV or Excel.");
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Max 5 MB.");
      return;
    }

    setSelectedFile(file);
    onImport(file);
  };

  return (
    <div className="rounded-2xl border border-dashed border-(--border) bg-(--surface) p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-(--text-primary)">Import students</p>
          <p className="mt-1 text-xs text-(--text-muted)">
            Upload a CSV or Excel file (.csv, .xlsx)
          </p>

          {selectedFile && (
            <p className="mt-2 truncate text-xs text-(--text-primary)">
              <span className="text-(--text-muted)">Selected:</span>{" "}
              {selectedFile.name}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => inputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition hover:bg-(--background) disabled:opacity-60 sm:w-auto"
        >
          <HugeiconsIcon
            icon={FileUploadIcon}
            size={16}
            className={isSubmitting ? "animate-pulse" : ""}
          />
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
          handleFileChange(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}