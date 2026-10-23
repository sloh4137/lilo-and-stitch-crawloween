// Occasional cyan lightning behind the page. Styles and timing live in
// globals.css; reduced motion leaves it hidden.
export default function Lightning() {
  return (
    <div aria-hidden className="storm">
      <div className="strike strike-left">
        <div className="strike-glow" />
        <Bolt />
      </div>
      <div className="strike strike-right">
        <div className="strike-glow" />
        <Bolt />
      </div>
    </div>
  );
}

const MAIN = "M38 0 L24 46 L36 50 L16 100 L30 104 L10 160";
const FORKS = "M36 50 L52 76 M16 100 L3 120 M24 46 L12 62";

function Bolt() {
  return (
    <svg className="strike-bolt" viewBox="0 0 60 160" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Wide soft cyan halo under a thin white-hot core. */}
      <path d={`${MAIN} ${FORKS}`} stroke="var(--stitch)" strokeOpacity="0.5" strokeWidth="6" />
      <path d={MAIN} stroke="var(--moon)" strokeWidth="2.25" />
      <path d={FORKS} stroke="var(--moon)" strokeWidth="1.25" />
    </svg>
  );
}
