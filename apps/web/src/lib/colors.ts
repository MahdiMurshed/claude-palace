// Curated palette of perceptually distinct hues (HSL h, s, l triples).
// Picked by hand to stay recognizable on neutral backgrounds.
// Collisions past N=18 get a diagonal-stripe overlay via css variable.
const PALETTE: readonly [number, number, number][] = [
  [6, 78, 57], // red
  [16, 80, 58], // orange
  [34, 88, 56], // amber
  [48, 90, 55], // yellow
  [80, 60, 50], // lime
  [142, 55, 42], // green
  [162, 58, 44], // teal
  [178, 65, 45], // cyan
  [198, 70, 52], // sky
  [214, 75, 58], // blue
  [230, 70, 62], // indigo
  [252, 62, 62], // violet
  [270, 55, 60], // purple
  [288, 55, 58], // fuchsia
  [320, 62, 58], // pink
  [345, 70, 60], // rose
  [20, 35, 50], // warm brown
  [200, 20, 55], // cool slate
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export type TileColor = {
  /** Solid fill for the tile background. */
  background: string;
  /** Slightly darker border. */
  border: string;
  /** Foreground text color that reads on `background`. */
  foreground: string;
  /** True if this project hashed to the same slot as another (overflow). */
  striped: boolean;
};

export function projectColor(id: string, allIds: string[] = []): TileColor {
  const idx = hash(id) % PALETTE.length;
  const palette = PALETTE[idx]!;
  const [h, s, l] = palette;

  // Detect collision — if any other id also hashes to this slot, stripe overflow.
  const striped = allIds.some((other) => other !== id && hash(other) % PALETTE.length === idx);

  return {
    background: `hsl(${h} ${s}% ${l}%)`,
    border: `hsl(${h} ${s}% ${Math.max(l - 15, 10)}%)`,
    foreground: l < 60 ? "hsl(0 0% 98%)" : "hsl(0 0% 10%)",
    striped,
  };
}
