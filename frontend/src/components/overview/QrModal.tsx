import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

interface QrModalProps {
  isOpen: boolean;
  paymentLink: string;
  onClose: () => void;
  onCopyLink: () => void;
}

export function QrModal({ isOpen, paymentLink, onClose, onCopyLink }: QrModalProps) {
  if (!isOpen || !paymentLink) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-(--border) bg-(--surface) p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-(--text-primary)">Payment QR</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-(--text-muted) hover:bg-(--background)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`}
            alt="Payment QR code"
            className="h-48 w-48 rounded-xl bg-white p-2"
          />
          <p className="break-all text-center text-xs text-(--text-muted)">{paymentLink}</p>
          <button
            type="button"
            onClick={onCopyLink}
            className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-medium text-white"
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}