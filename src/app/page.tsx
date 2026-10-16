export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="font-display text-xl tracking-wide text-stitch">
        Lilo &amp; Stitch
      </p>
      <h1 className="font-spooky text-6xl leading-none text-pumpkin sm:text-7xl">
        Crawl-o-ween
      </h1>
      <p className="max-w-sm text-lg text-mist">
        Experiment 626 and friends are hiding all over the house. Find them
        all for <span className="font-display text-hibiscus">ʻOhana!</span>
      </p>
      <p className="rounded-full border border-stitch/40 bg-dusk/60 px-5 py-2 font-display text-stitch">
        The hunt opens soon
      </p>
    </main>
  );
}
