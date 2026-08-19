import { useState } from "react";

interface FlowImageProps {
  src: string;
  alt: string;
}

export function FlowImage({ src, alt }: FlowImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--surface) p-6 text-center">
        <p className="text-xs text-(--text-muted)">
          Add <code className="font-mono text-(--primary)">{src}</code> to show this image
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full rounded-2xl border border-(--border) object-cover shadow-lg ring-1 ring-(--accent)/20 md:aspect-video"
    />
  );
}