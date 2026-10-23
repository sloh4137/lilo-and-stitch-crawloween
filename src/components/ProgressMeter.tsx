import type { CSSProperties } from "react";

function message(found: number, total: number) {
  if (found === 0) return "No experiments captured yet. They could be anywhere…";
  if (found === total) return "Every experiment captured! ʻOhana!";
  if (found === total - 1) return "Just one experiment left on the loose!";
  if (found * 2 >= total) return "Over halfway! Jumba is getting nervous.";
  return "Keep hunting, the experiments are still on the loose!";
}

export default function ProgressMeter({
  found,
  total,
  // Where the fill animates up from, e.g. the count before a fresh capture.
  from = 0,
}: {
  found: number;
  total: number;
  from?: number;
}) {
  const percent = Math.round((found / total) * 100);
  const fromPercent = Math.round((from / total) * 100);
  const complete = found === total;

  return (
    <div className="mt-2 flex w-full max-w-xs flex-col gap-1">
      <div className="flex items-baseline justify-between font-display">
        <span className="text-sm tracking-wider text-mist uppercase">Containment</span>
        <span className="text-xl text-stitch">
          {found} / {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Experiments captured"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={found}
        className="h-4 overflow-hidden rounded-full border border-stitch/40 bg-night/70"
      >
        <div
          className={`h-full rounded-full bg-linear-to-r motion-safe:animate-meter-fill ${
            complete
              ? "from-pumpkin to-hibiscus shadow-[0_0_14px_rgb(255_92_154/0.7)]"
              : "from-stitch-deep to-stitch shadow-[0_0_12px_rgb(63_196_214/0.6)]"
          }`}
          style={{ width: `${percent}%`, "--meter-from": `${fromPercent}%` } as CSSProperties}
        />
      </div>
      <p className="text-xs text-mist">{message(found, total)}</p>
    </div>
  );
}
