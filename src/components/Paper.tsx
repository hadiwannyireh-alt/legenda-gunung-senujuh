import React from "react";
import {AbsoluteFill, random} from "remotion";
import {SLOW_STEP, STEP, flick, useHeld, wobble} from "../lib/stopMotion";

export const W = 1920;
export const H = 1080;
export const GROUND = 740;

export const C = {
  kraft: "#c9a374",
  cream: "#f4e7c8",
  ink: "#3a2214",
  earth: "#8a5a34",
  earthDark: "#5e3b21",
  skin: "#c68a5a",
  skinDark: "#a56d42",
  red: "#b3261e",
  gold: "#e0a93a",
  rock: "#8d8a82",
  rockDark: "#66635c",
  cloth: "#1f3d2c",
  clothLight: "#2f5a40",
};

/** Tepi kertas yang agak terang, memberi kesan potongan kertas. */
export const EDGE = {
  stroke: "rgba(255,246,226,0.45)",
  strokeWidth: 3,
  strokeLinejoin: "round" as const,
};

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
    style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}
  >
    {children}
  </svg>
);

/** Satu lapisan kertas: drop-shadow + getaran stop-motion. */
export const Layer: React.FC<{
  children: React.ReactNode;
  depth?: number;
  seed?: string;
  amp?: number;
  step?: number;
  dx?: number;
  dy?: number;
  opacity?: number;
}> = ({children, depth = 6, seed = "layer", amp = 1.5, step = STEP, dx = 0, dy = 0, opacity = 1}) => {
  const h = useHeld(step);
  const w = wobble(seed, h, amp, step);
  const shadow =
    depth > 0
      ? `drop-shadow(${depth * 0.4}px ${depth}px ${depth * 1.2}px rgba(45,25,8,0.5))`
      : "none";
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: W,
        height: H,
        opacity,
        transform: `translate(${dx + w.x}px, ${dy + w.y}px) rotate(${w.r}deg)`,
        filter: shadow,
      }}
    >
      {children}
    </div>
  );
};

/** Latar kertas kraft (tekstur serat dibuat prosedural, tanpa aset). */
export const Kraft: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.kraft}}>
    <svg width={W} height={H} style={{position: "absolute", left: 0, top: 0}}>
      <defs>
        <filter id="kraftFiber" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves={3} seed={4} />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.9 -0.25"
          />
        </filter>
      </defs>
      <rect width={W} height={H} filter="url(#kraftFiber)" />
    </svg>
  </AbsoluteFill>
);

/** Butiran kertas di atas seluruh frame. */
export const PaperGrain: React.FC = () => (
  <AbsoluteFill style={{mixBlendMode: "multiply", pointerEvents: "none"}}>
    <svg width={W} height={H}>
      <defs>
        <filter id="paperGrain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={8} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={0} intercept={0.22} />
          </feComponentTransfer>
        </filter>
        <radialGradient id="vig" cx="50%" cy="50%" r="75%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0d05" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} filter="url(#paperGrain)" />
      <rect width={W} height={H} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>
);

/* ----------------------------- Bentuk dasar ----------------------------- */

export const Sky: React.FC<{id: string; colors: [string, string]}> = ({id, colors}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={colors[0]} />
        <stop offset="1" stopColor={colors[1]} />
      </linearGradient>
    </defs>
    <rect x={-20} y={-20} width={W + 40} height={H + 40} fill={`url(#${id})`} />
  </>
);

/** Bukit/lembah dari poligon bersudut (potongan gunting). */
export const Hill: React.FC<{
  base: number;
  amp: number;
  color: string;
  seed?: number;
  step?: number;
}> = ({base, amp, color, seed = 1, step = 140}) => {
  const pts: string[] = [];
  for (let x = -step; x <= W + step; x += step) {
    const i = Math.round(x / step);
    const y = base + Math.sin(i * 0.9 + seed * 2.3) * amp * 0.6 + (random(`hill-${seed}-${i}`) - 0.5) * amp * 0.8;
    pts.push(`${x},${y}`);
  }
  return (
    <polygon
      points={`${pts.join(" ")} ${W + step},${H + 60} ${-step},${H + 60}`}
      fill={color}
      {...EDGE}
    />
  );
};

export const Mountain: React.FC<{
  x: number;
  base: number;
  w: number;
  h: number;
  color: string;
  dark: string;
}> = ({x, base, w, h, color, dark}) => (
  <g>
    <polygon
      points={`${x - w / 2},${base} ${x - w * 0.1},${base - h * 0.78} ${x},${base - h} ${x + w * 0.13},${base - h * 0.8} ${x + w / 2},${base}`}
      fill={color}
      {...EDGE}
    />
    <polygon
      points={`${x},${base - h} ${x + w * 0.13},${base - h * 0.8} ${x + w / 2},${base} ${x + w * 0.05},${base}`}
      fill={dark}
    />
  </g>
);

export const Sun: React.FC<{x: number; y: number; r?: number; rot?: number; color?: string}> = ({
  x,
  y,
  r = 90,
  rot = 0,
  color = "#f2b632",
}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {Array.from({length: 14}).map((_, i) => (
      <polygon
        key={i}
        points={`${-r * 0.22},${-r * 1.15} 0,${-r * 1.75} ${r * 0.22},${-r * 1.15}`}
        transform={`rotate(${(i * 360) / 14})`}
        fill={color}
        opacity={0.85}
      />
    ))}
    <circle r={r} fill={color} {...EDGE} />
    <circle r={r * 0.72} fill="#ffdc6e" />
  </g>
);

export const Moon: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill="#eef0e4" {...EDGE} />
    <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.18} fill="#cfd3c4" />
    <circle cx={r * 0.32} cy={r * 0.25} r={r * 0.24} fill="#cfd3c4" />
  </g>
);

export const Stars: React.FC<{f: number}> = ({f}) => (
  <g>
    {Array.from({length: 26}).map((_, i) => {
      const x = random(`star-x-${i}`) * W;
      const y = random(`star-y-${i}`) * 420 + 30;
      const s = 6 + random(`star-s-${i}`) * 9;
      const on = flick(`star-${i}`, f, SLOW_STEP) > 0.25;
      return (
        <polygon
          key={i}
          points={`${x},${y - s} ${x + s * 0.5},${y} ${x},${y + s} ${x - s * 0.5},${y}`}
          fill="#fff6c9"
          opacity={on ? 0.95 : 0.35}
        />
      );
    })}
  </g>
);

export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string}> = ({
  x,
  y,
  s = 1,
  color = "#fff4de",
}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={color} {...EDGE}>
    <ellipse cx={0} cy={0} rx={90} ry={34} />
    <ellipse cx={-40} cy={-24} rx={46} ry={34} />
    <ellipse cx={30} cy={-34} rx={54} ry={42} />
  </g>
);

export const Birds: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const flap = Math.floor(f / STEP + i) % 2 === 0 ? 1 : 0.45;
      return (
        <path
          key={i}
          d="M-22 0 Q-11 -16 0 0 Q11 -16 22 0"
          transform={`translate(${x + i * 70},${y + (i % 2) * 34}) scale(1,${flap})`}
          stroke="#3a2a1c"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      );
    })}
  </g>
);

/** Rumah panggung khas Melayu Sambas. */
export const Hut: React.FC<{
  x: number;
  y: number;
  s?: number;
  roof?: string;
  wall?: string;
  lit?: boolean;
}> = ({x, y, s = 1, roof = "#7a4a2a", wall = "#b98552", lit = false}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[-60, -20, 20, 60].map((px) => (
      <rect key={px} x={px - 4} y={-70} width={8} height={70} fill="#5e3b21" />
    ))}
    <rect x={-80} y={-95} width={160} height={28} fill="#7a5230" {...EDGE} />
    <rect x={-68} y={-170} width={136} height={76} fill={wall} {...EDGE} />
    <rect x={-18} y={-150} width={36} height={44} fill={lit ? "#ffd36b" : "#3b2616"} />
    <polygon points="-100,-166 0,-250 100,-166" fill={roof} {...EDGE} />
  </g>
);

export const Tree: React.FC<{
  x: number;
  y: number;
  s?: number;
  color: string;
  kind?: "palm" | "round";
}> = ({x, y, s = 1, color, kind = "palm"}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <polygon points="-9,0 9,0 5,-150 -5,-150" fill="#6b4528" />
    {kind === "palm" ? (
      <g>
        {[-170, -130, -90, -50, -10, 20, 160].map((a) => (
          <ellipse
            key={a}
            cx={55}
            cy={0}
            rx={62}
            ry={14}
            fill={color}
            transform={`translate(0,-150) rotate(${a})`}
            {...EDGE}
          />
        ))}
      </g>
    ) : (
      <g fill={color} {...EDGE}>
        <circle cx={0} cy={-190} r={70} />
        <circle cx={-55} cy={-150} r={50} />
        <circle cx={58} cy={-152} r={52} />
      </g>
    )}
  </g>
);

export const River: React.FC<{y: number; h: number; color: string; light: string; f: number}> = ({
  y,
  h,
  color,
  light,
  f,
}) => {
  const pts: string[] = [];
  for (let x = -80, i = 0; x <= W + 80; x += 80, i++) pts.push(`${x},${y + (i % 2) * 9}`);
  return (
    <g>
      <polygon points={`${pts.join(" ")} ${W + 80},${y + h} -80,${y + h}`} fill={color} {...EDGE} />
      {Array.from({length: 7}).map((_, i) => {
        const x = ((i * 330 + f * 4) % (W + 300)) - 150;
        const yy = y + 26 + (i % 3) * 26;
        return <rect key={i} x={x} y={yy} width={120} height={9} rx={4.5} fill={light} opacity={0.75} />;
      })}
    </g>
  );
};

/** Percikan kertas (untuk air). */
export const Splash: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <g>
    {Array.from({length: 14}).map((_, i) => {
      const ang = -Math.PI * (0.1 + (i / 13) * 0.8);
      const sp = 140 + random(`sp-${i}`) * 260;
      const px = x + Math.cos(ang) * sp * t * 1.1;
      const py = y + Math.sin(ang) * sp * t * 1.6 + 520 * t * t;
      const r = 14 + random(`spr-${i}`) * 14;
      return <circle key={i} cx={px} cy={py} r={r * (1 - t * 0.4)} fill="#bfe4ee" opacity={1 - t * 0.6} {...EDGE} />;
    })}
  </g>
);
