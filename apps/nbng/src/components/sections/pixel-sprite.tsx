import { pixelSprite } from "@ghom/core";

/** Sprite pixel unique par jeu, rendu en SVG net (crispEdges). */
export function PixelSprite({
  seed,
  color,
  className,
}: {
  seed: string;
  color: string;
  className?: string;
}) {
  const grid = pixelSprite(seed, 11, 9);
  return (
    <svg viewBox="-1 -1 13 11" shapeRendering="crispEdges" className={className} aria-hidden>
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null,
        ),
      )}
      {/* les "yeux" */}
      <rect x={3} y={3} width={1} height={1} fill="#050307" />
      <rect x={7} y={3} width={1} height={1} fill="#050307" />
    </svg>
  );
}
