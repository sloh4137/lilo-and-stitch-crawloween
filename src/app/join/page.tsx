import type { Metadata } from "next";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
  title: "Join the hunt · Lilo & Stitch Crawl-o-ween",
};

// Reads the request (searchParams), so it renders per request.
export const instant = false;

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="font-display text-lg tracking-wide text-stitch">
          Lilo &amp; Stitch
        </p>
        <h1 className="font-spooky text-5xl leading-none text-pumpkin">
          Crawl-o-ween
        </h1>
        <p className="max-w-sm text-mist">
          Aloha! Tell us who&apos;s hunting so we can keep track of your finds.
        </p>
      </header>
      <JoinForm next={typeof next === "string" ? next : undefined} />
    </main>
  );
}
