const PHRASES = ["sustainable", "stylish", "preloved", "loved again"];

export function Marquee() {
  const row = PHRASES.map((phrase, index) => (
    <span key={index} className="mx-5 inline-flex items-center gap-5">
      <span>{phrase}</span>
      <span className="text-blush-deep">{index % 2 === 0 ? "✦" : "♡"}</span>
    </span>
  ));

  return (
    <div className="overflow-hidden border-y border-blush-deep/40 bg-blush py-3">
      <div className="marquee-track flex w-max whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.3em] text-rose-deep">
        {/* Track holds two copies so the loop is seamless. */}
        <div aria-hidden="false">{row}</div>
        <div aria-hidden="true">{row}</div>
        <div aria-hidden="true">{row}</div>
        <div aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
