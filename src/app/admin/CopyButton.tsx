"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard needs a secure context (https or localhost); the URL is still
      // on screen to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-full border border-stitch/50 px-3 py-1 text-sm text-stitch hover:bg-stitch hover:text-night cursor-pointer"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
