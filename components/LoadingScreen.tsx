// Branded full-screen splash. Rendered by app/loading.tsx during route
// transitions and server data fetching. Pure CSS animation so it paints
// instantly with no JavaScript.
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cream">
      {/* ambient sparkles */}
      <span className="sparkle pointer-events-none absolute left-[18%] top-[22%] text-2xl text-rose/40">
        ✦
      </span>
      <span className="sparkle sparkle-delay-1 pointer-events-none absolute right-[20%] top-[30%] text-3xl text-rose/30">
        ♡
      </span>
      <span className="sparkle sparkle-delay-2 pointer-events-none absolute bottom-[26%] left-[26%] text-2xl text-rose/35">
        ✧
      </span>
      <span className="sparkle pointer-events-none absolute bottom-[22%] right-[24%] text-xl text-rose/40">
        ♡
      </span>

      {/* logo with pulsing rings + orbiting bow */}
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="splash-ring absolute h-32 w-32 rounded-full border border-rose/40" />
        <span className="splash-ring splash-ring-2 absolute h-32 w-32 rounded-full border border-rose/40" />
        <span className="splash-orbit absolute text-lg">🎀</span>
        <img
          src="/brand/logo.jpg"
          alt="Closet Collective"
          className="splash-logo h-28 w-28 rounded-full border-4 border-white object-cover shadow-soft"
        />
      </div>

      <p className="splash-title mt-7 font-script text-5xl">Closet Collective</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.35em] text-cocoa-light">
        loading the closet
      </p>

      {/* shimmer progress bar */}
      <div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-blush">
        <div className="splash-bar-fill h-full w-1/2 rounded-full bg-rose" />
      </div>
    </div>
  );
}
