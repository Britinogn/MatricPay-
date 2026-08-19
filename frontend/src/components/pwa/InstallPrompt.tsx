import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function isIOSDevice() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !("MSStream" in window)
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  /*
   * Determine the initial iOS state during state initialization.
   * This avoids calling setState synchronously inside useEffect.
   */
  const [showPrompt, setShowPrompt] = useState(() => {
    if (typeof window === "undefined") return false;

    return isIOSDevice() && !isStandalone();
  });

  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // cspell:disable-next-line
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      // cspell:disable-next-line
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    // Android / Chrome
    if (installEvent) {
      await installEvent.prompt();

      const { outcome } = await installEvent.userChoice;

      if (outcome === "accepted") {
        setShowPrompt(false);
      }

      setInstallEvent(null);
      return;
    }

    // iOS / Safari
    if (isIOSDevice()) {
      setShowIOSInstructions(true);
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-[2px]" />

      {/* Install card */}
      <div className="fixed left-1/2 top-1/2 z-9999 w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-(--border) bg-(--surface) shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <img
            src="/pwa-192x192.png"
            alt="MatricPay"
            className="h-12 w-12 rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-(--text-primary)">
              Install MatricPay App
            </h2>

            <p className="text-sm text-(--text-muted)">
              Open faster from your Home Screen.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPrompt(false)}
            className="rounded-full p-2 text-(--text-muted) transition hover:bg-(--background) hover:text-(--text-primary)"
            aria-label="Close install prompt"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <p className="text-sm leading-6 text-(--text-muted)">
            Install MatricPay on your device for quick access to your student
            payments and receipts.
          </p>

          {/* Install button */}
          <button
            type="button"
            onClick={handleInstall}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-(--primary) px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-(--primary-hover) active:scale-[0.98]"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />

            Install
          </button>
        </div>
      </div>

      {/* iOS instructions */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-10000 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-(--text-primary)">
                  Install MatricPay
                </h3>

                <p className="mt-1 text-sm text-(--text-muted)">
                  Add MatricPay to your Home Screen
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                className="rounded-full p-2 text-(--text-muted) transition hover:bg-(--background)"
                aria-label="Close instructions"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.8}
                />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <InstallStep
                number="1"
                title="Tap the Share button"
                description="Tap the Share button in Safari."
                icon={Share01Icon}
              />

              <InstallStep
                number="2"
                title='Select "Add to Home Screen"'
                description="Scroll through the Share menu if you don't see it."
              />

              <InstallStep
                number="3"
                title='Tap "Add"'
                description="MatricPay will appear on your Home Screen."
              />
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full rounded-full bg-(--primary) py-3.5 text-sm font-semibold text-white transition hover:bg-(--primary-hover)"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface InstallStepProps {
  number: string;
  title: string;
  description: string;
  icon?: typeof Share01Icon;
}

function InstallStep({
  number,
  title,
  description,
  icon,
}: InstallStepProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--primary) text-sm font-bold text-white">
        {number}
      </div>

      <div className="min-w-0">
        <p className="font-medium text-(--text-primary)">
          {title}
        </p>

        <div className="mt-1 flex items-center gap-2 text-sm text-(--text-muted)">
          {icon && (
            <HugeiconsIcon
              icon={icon}
              size={17}
              color="currentColor"
              strokeWidth={1.8}
            />
          )}

          <span>{description}</span>
        </div>
      </div>
    </div>
  );
}