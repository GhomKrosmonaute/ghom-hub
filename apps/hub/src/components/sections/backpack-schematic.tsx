"use client";

import { useId, useState } from "react";

type System = { code: string; label: string };
/** `under` : zone qui en contient d'autres, dessinée dessous pour ne pas leur voler le survol. */
type Zone = { d: string; x: number; y: number; under?: boolean };

/**
 * Zones du sac, dans l'ordre des systèmes du profil (SYS.01, SYS.02…) : chaque compétence
 * occupe la pièce qui lui correspond. Repère (x, y) = point visé par l'étiquette.
 */
const ZONES: Zone[] = [
  { d: "M196 302h68v20h-68Z", x: 230, y: 312 }, // TypeScript : la cellule d'énergie qui alimente tout
  { d: "M190 236h80v58h-80Z", x: 230, y: 265 }, // React / Next.js : la poche frontale, le front
  { d: "M290 148h20v112h-20Z", x: 300, y: 204 }, // three.js / WebGL : poche latérale droite, le moteur de rendu
  { d: "M150 148h20v112h-20Z", x: 160, y: 204 }, // PostgreSQL / Prisma : poche latérale gauche, le stockage
  { d: "M182 72h96l14 40H168Z", x: 230, y: 92 }, // Game design : le rabat, la vue d'ensemble
  { d: "M310 160h12v58h-12Z", x: 316, y: 190 }, // DevOps / Docker : le tube d'alimentation, le pipeline
  { d: "M184 126h30v16h-30Z", x: 199, y: 134 }, // UI : le panneau de diodes, l'interface
  { d: "M174 118h112v108H174Z", x: 230, y: 172, under: true }, // UX : le compartiment principal, autour de l'UI
  { d: "M262 30h22v18h-22Z", x: 273, y: 39 }, // Cybersec : l'antenne, ce qui surveille les ondes
  { d: "M204 50h52v14h-52Z", x: 230, y: 57 }, // poignée (libre)
  { d: "M240 242h24v14h-24Z", x: 252, y: 249 }, // badge de la poche frontale (libre)
  { d: "M160 120h10v24h-10Z", x: 165, y: 132 }, // attache de sangle (libre)
];

/** Le sac est dessiné autour de x = 230 ; il est décalé de DX dans la vue large. */
const DX = 70;
const W = 600;
const TOP = 30;
const BOTTOM = 330;

type Item = System & { i: number; zone: Zone; isLeft: boolean; ly: number };

/** Répartit les systèmes à gauche / à droite du sac, triés par hauteur du repère. */
function layout(systems: System[]): Item[] {
  const items = systems.map((s, i) => ({ ...s, i, zone: ZONES[i % ZONES.length] as Zone }));
  const left: typeof items = [];
  const right: typeof items = [];
  for (const it of items) {
    if (it.zone.x < 230) left.push(it);
    else if (it.zone.x > 230) right.push(it);
    else (left.length <= right.length ? left : right).push(it);
  }
  const place = (side: typeof items, isLeft: boolean) =>
    side
      .sort((a, b) => a.zone.y - b.zone.y)
      .map((it, k) => ({ ...it, isLeft, ly: TOP + ((BOTTOM - TOP) * (k + 0.5)) / side.length }));
  return [...place(left, true), ...place(right, false)];
}

function Pack({ dim }: { dim: boolean }) {
  return (
    <g
      fill="none"
      stroke="var(--neon-1)"
      strokeWidth="1.2"
      className="transition-opacity duration-300"
      opacity={dim ? 0.55 : 0.9}
    >
      <path d="M206 72c0-22 48-22 48 0" strokeWidth="3" />
      <path d="M273 48v24M266 30l-10-14M280 30l10-14" opacity=".7" />
      <path
        d="M182 72h96l14 40 6 8v176l-14 30H176l-14-30V120l6-8Z"
        fill="#05060b"
        strokeWidth="1.6"
      />
      <path d="M150 148h20v112h-20ZM290 148h20v112h-20Z" fill="#05060b" />
      <path d="M168 112h124M174 118h112v108H174ZM190 236h80v58h-80ZM196 302h68v20h-68Z" />
      <path d="M210 112v10M250 112v10M190 250h80M200 236v-6h60v6" opacity=".6" />
      <path d="M184 126h30v16h-30ZM240 242h24v14h-24ZM160 120h10v24h-10Z" />
      <path d="M188 134h4M196 134h4M204 134h4" stroke="var(--neon-2)" strokeWidth="2">
        <animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite" />
      </path>
      <path d="M200 302v20M214 302v20M228 302v20M242 302v20" opacity=".5" />
      <path d="M310 160c14 8 14 50 0 58" stroke="var(--neon-2)" strokeDasharray="3 3" />
    </g>
  );
}

/** Schéma de sac à dos cyberpunk : chaque système pointe une zone, réaction au survol. */
export function BackpackSchematic({ systems }: { systems: System[] }) {
  const [active, setActive] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const items = layout(systems);
  const activeZones = new Set(items.filter((it) => it.i === active).map((it) => it.zone));
  const hatch = `bp-hatch-${uid}`;
  const glow = `bp-glow-${uid}`;

  const defs = (
    <defs>
      <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 6 6 0" stroke="var(--neon-2)" strokeWidth=".8" opacity=".6" />
      </pattern>
      <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  // Survoler une pièce du sac active le système qui l'occupe (les pièces libres ne réagissent pas).
  const systemOf = new Map(items.map((it) => [it.zone, it.i]));
  const zones = [...ZONES]
    .sort((a, b) => Number(!!b.under) - Number(!!a.under))
    .map((z) => {
      const on = activeZones.has(z);
      const i = systemOf.get(z);
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: survol décoratif, la liste accessible est rendue à part
        <path
          key={z.d}
          d={z.d}
          fill={on ? `url(#${hatch})` : "transparent"}
          stroke={on ? "var(--neon-2)" : "transparent"}
          strokeWidth="1.6"
          filter={on ? `url(#${glow})` : undefined}
          pointerEvents={i === undefined ? "none" : undefined}
          onMouseEnter={i === undefined ? undefined : () => setActive(i)}
          onClick={i === undefined ? undefined : () => setActive(active === i ? null : i)}
          className={`transition-all duration-300 ${i === undefined ? "" : "cursor-crosshair"}`}
        />
      );
    });

  const marker = (it: Item, withNumber: boolean) => {
    const on = active === it.i;
    const color = on ? "var(--neon-2)" : "var(--neon-1)";
    return (
      <g key={`m${it.code}`} pointerEvents="none">
        {on && (
          <circle cx={it.zone.x} cy={it.zone.y} r="5" fill="none" stroke={color}>
            <animate attributeName="r" values="5;11;5" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx={it.zone.x} cy={it.zone.y} r={withNumber ? 7 : on ? 4.5 : 3} fill={color} />
        {withNumber && (
          <text
            x={it.zone.x}
            y={it.zone.y + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#05060b"
            className="font-mono"
          >
            {it.i + 1}
          </text>
        )}
      </g>
    );
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: fin du survol décoratif
    <div onMouseLeave={() => setActive(null)}>
      {/* Vue large : étiquettes reliées au sac */}
      <svg
        viewBox={`0 0 ${W} 360`}
        className="hidden h-auto w-full select-none md:block"
        aria-hidden
      >
        {defs}
        <g transform={`translate(${DX} 0)`}>
          <Pack dim={active !== null} />
          {zones}
        </g>
        {items.map((it) => {
          const on = active === it.i;
          const dim = active !== null && !on;
          const ax = it.zone.x + DX;
          const elbowX = it.isLeft ? 214 : 404;
          const textX = it.isLeft ? 204 : 414;
          const color = on ? "var(--neon-2)" : "var(--neon-1)";
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: survol décoratif, la liste accessible est rendue à part
            <g
              key={it.code}
              onMouseEnter={() => setActive(it.i)}
              className="cursor-crosshair transition-opacity duration-300"
              opacity={dim ? 0.45 : 1}
            >
              <rect
                x={it.isLeft ? 0 : textX - 8}
                y={it.ly - 22}
                width={it.isLeft ? textX + 8 : W - textX + 8}
                height="38"
                fill="transparent"
              />
              <polyline
                points={`${ax},${it.zone.y} ${elbowX},${it.ly} ${textX + (it.isLeft ? 6 : -6)},${it.ly}`}
                fill="none"
                stroke={color}
                strokeWidth={on ? 1.6 : 1}
                strokeDasharray={on ? undefined : "4 3"}
                opacity={on ? 1 : 0.7}
                className="transition-all duration-300"
              />
              <text
                x={textX}
                y={it.ly - 6}
                textAnchor={it.isLeft ? "end" : "start"}
                className="font-mono"
                fontSize="10"
                letterSpacing="2"
                fill={on ? "var(--neon-2)" : "var(--neon-1)"}
                opacity=".75"
              >
                {it.code}
              </text>
              <text
                x={textX}
                y={it.ly + 11}
                textAnchor={it.isLeft ? "end" : "start"}
                className="font-mono uppercase"
                fontSize="14"
                letterSpacing="1"
                fill={on ? "#fff" : "currentColor"}
              >
                {it.label}
              </text>
            </g>
          );
        })}
        <g transform={`translate(${DX} 0)`}>{items.map((it) => marker(it, false))}</g>
      </svg>

      {/* Vue étroite : repères numérotés + liste */}
      <svg
        viewBox="130 10 210 330"
        className="mx-auto h-auto w-full max-w-72 select-none md:hidden"
        aria-hidden
      >
        {defs}
        <Pack dim={active !== null} />
        {zones}
        {items.map((it) => marker(it, true))}
      </svg>
      <ol className="mt-5 grid grid-cols-2 gap-2 font-mono text-xs uppercase md:hidden">
        {[...items]
          .sort((a, b) => a.i - b.i)
          .map((it) => {
            const on = active === it.i;
            return (
              <li key={it.code}>
                <button
                  type="button"
                  data-lock={it.label}
                  onMouseEnter={() => setActive(it.i)}
                  onFocus={() => setActive(it.i)}
                  onClick={() => setActive(on ? null : it.i)}
                  className={`flex w-full items-center gap-2 border px-2 py-1.5 text-left transition-colors ${
                    on
                      ? "border-neon-2 bg-neon-2/10 text-foreground"
                      : "border-white/10 text-foreground/80"
                  }`}
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold text-void ${
                      on ? "bg-neon-2" : "bg-neon-1"
                    }`}
                  >
                    {it.i + 1}
                  </span>
                  <span className="leading-tight">{it.label}</span>
                </button>
              </li>
            );
          })}
      </ol>
      <ul className="sr-only max-md:hidden">
        {systems.map((s) => (
          <li key={s.code}>{s.label}</li>
        ))}
      </ul>
    </div>
  );
}
