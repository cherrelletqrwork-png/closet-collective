"use client";

// One-shot burst of hearts floating up the screen — used on the order
// success page. Values are derived from the index (not Math.random) so the
// server and client render identical markup.
const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 61) % 100}%`,
  delay: `${((i * 37) % 14) / 10}s`,
  duration: `${2.6 + ((i * 53) % 18) / 10}s`,
  size: `${14 + ((i * 29) % 18)}px`,
  glyph: i % 3 === 0 ? "🎀" : i % 3 === 1 ? "♡" : "💗",
}));

export function HeartConfetti() {
  return (
    <div aria-hidden>
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          className="confetti-heart"
          style={{
            left: heart.left,
            fontSize: heart.size,
            ["--heart-delay" as string]: heart.delay,
            ["--heart-duration" as string]: heart.duration,
          }}
        >
          {heart.glyph}
        </span>
      ))}
    </div>
  );
}
