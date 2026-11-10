// A symmetric botanical line ornament: one stem, leaves and small buds,
// drawn in a single fine stroke. Decorative only.
const half = (
  <>
    <path d="M118 30 C 112 18, 102 12, 92 12 C 98 20, 106 27, 118 30 Z" />
    <path d="M108 33 C 100 27, 90 26, 82 30 C 90 34, 99 35, 108 33 Z" />
    <path d="M94 34 C 88 22, 76 18, 66 20 C 72 28, 82 33, 94 34 Z" />
    <path d="M78 35 C 70 31, 60 32, 52 37 C 61 40, 70 39, 78 35 Z" />
    <path d="M62 34 C 56 24, 46 20, 37 22 C 42 29, 51 33, 62 34 Z" />
    <path d="M37 31 C 31 31, 26 28, 24 23 C 30 22, 35 25, 37 31 Z" />
    <circle cx="21" cy="29" r="2.4" />
  </>
);

export function Sprig({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 30 C 60 38, 100 38, 120 30 C 140 38, 180 38, 220 30" />
      <g>{half}</g>
      <g transform="matrix(-1 0 0 1 240 0)">{half}</g>
      <circle cx="120" cy="26" r="2.8" />
    </svg>
  );
}
