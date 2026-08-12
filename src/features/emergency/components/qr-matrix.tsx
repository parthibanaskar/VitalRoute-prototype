/**
 * Deterministic decorative QR-style matrix (mock handoff token).
 * No network, no dependency — renders as a high-contrast grid.
 */
const SIZE = 25;

function hash(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function isFinder(x: number, y: number) {
  const inBox = (ox: number, oy: number) =>
    x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const ring = (ox: number, oy: number) => {
    const dx = x - ox;
    const dy = y - oy;
    const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6;
    const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
    return edge || core;
  };
  if (inBox(0, 0)) return ring(0, 0);
  if (inBox(SIZE - 7, 0)) return ring(SIZE - 7, 0);
  if (inBox(0, SIZE - 7)) return ring(0, SIZE - 7);
  return false;
}

function isFinderArea(x: number, y: number) {
  return (
    (x < 8 && y < 8) || (x >= SIZE - 8 && y < 8) || (x < 8 && y >= SIZE - 8)
  );
}

export function QrMatrix({ seed = 7 }: { seed?: number }) {
  const cells: boolean[] = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      cells.push(isFinderArea(x, y) ? isFinder(x, y) : hash(x, y, seed) > 0.5);
    }
  }

  return (
    <div
      role="img"
      aria-label="Paramedic handoff code"
      className="grid aspect-square w-full max-w-[15rem] gap-0 rounded-xl bg-foreground p-3"
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
    >
      {cells.map((on, i) => (
        <span
          key={i}
          className={on ? "bg-background" : "bg-transparent"}
          style={{ aspectRatio: "1 / 1" }}
        />
      ))}
    </div>
  );
}
