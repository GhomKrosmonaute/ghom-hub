import { hashString } from "@ghom/core";

/**
 * "Photo produit" générative : un emblème unique et stable par projet
 * (polygones imbriqués + anneaux de données), coloré par l'accent du projet.
 */
export function ProductGlyph({
  slug,
  code,
  className,
}: {
  slug: string;
  code: string;
  className?: string;
}) {
  const h = hashString(slug);
  const sides = 3 + (h % 6);
  const layers = 3 + ((h >> 3) % 3);
  const rot = (h >> 6) % 360;
  const dash = 2 + ((h >> 9) % 8);

  const poly = (r: number, offset: number) =>
    Array.from({ length: sides }, (_, i) => {
      const a = ((Math.PI * 2) / sides) * i + (offset * Math.PI) / 180;
      return `${(100 + Math.cos(a) * r).toFixed(2)},${(100 + Math.sin(a) * r).toFixed(2)}`;
    }).join(" ");

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <g className="origin-center transition-transform duration-700 group-hover/card:rotate-[30deg]">
        {Array.from({ length: layers }, (_, i) => (
          <polygon
            key={i}
            points={poly(78 - i * 16, rot + i * (180 / sides))}
            fill="none"
            stroke="var(--glow)"
            strokeWidth={i === 0 ? 1.5 : 1}
            opacity={1 - i * 0.18}
          />
        ))}
      </g>
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="var(--glow)"
        strokeDasharray={`${dash} ${dash * 2}`}
        opacity=".4"
        className="origin-center animate-[spin_30s_linear_infinite]"
      />
      <text
        x="100"
        y="108"
        textAnchor="middle"
        className="fill-[var(--glow)] font-display text-[26px] font-black tracking-widest"
        style={{ filter: "drop-shadow(0 0 6px var(--glow))" }}
      >
        {code}
      </text>
    </svg>
  );
}
