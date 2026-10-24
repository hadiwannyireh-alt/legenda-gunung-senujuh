import React from "react";
import {random} from "remotion";
import {C, EDGE} from "./Paper";
import {STEP, useHeld} from "../lib/stopMotion";

export type Mood = "neutral" | "angry" | "smile" | "sad" | "sly" | "worried";
export type ArmsPose = "down" | "up" | "point" | "spread" | "carry" | "push";
export type Prop = "none" | "spear" | "torch" | "rock";

const ARMS: Record<ArmsPose, [number, number]> = {
  down: [8, -8],
  up: [165, -165],
  spread: [100, -100],
  point: [8, -92],
  carry: [158, -158],
  push: [-96, -96],
};

export const Flame: React.FC<{x: number; y: number; s?: number; seed?: string}> = ({
  x,
  y,
  s = 1,
  seed = "flame",
}) => {
  const h = useHeld();
  const k = Math.floor(h / STEP);
  const sx = 1 + (random(`${seed}-a-${k}`) - 0.5) * 0.35;
  const sy = 1 + (random(`${seed}-b-${k}`) - 0.5) * 0.3;
  const lean = (random(`${seed}-c-${k}`) - 0.5) * 16;
  return (
    <g transform={`translate(${x},${y}) scale(${s * sx},${s * sy})`}>
      <path d={`M0 0 Q-28 -30 ${-8 + lean} -84 Q${lean} -52 12 -94 Q42 -42 0 0Z`} fill="#d7261e" />
      <path d={`M0 -4 Q-15 -24 ${lean * 0.5} -58 Q24 -24 0 -4Z`} fill="#ffc83d" />
    </g>
  );
};

export type PersonProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  cloth?: string;
  trim?: string;
  headband?: string;
  skin?: string;
  mood?: Mood;
  arms?: ArmsPose;
  prop?: Prop;
  bob?: number;
  lean?: number;
  leader?: boolean;
  sil?: boolean;
  seed?: string;
};

/** Boneka kertas: kaki, kain sarung, lengan, kepala + ikat kepala. Titik asal = telapak kaki. */
export const Person: React.FC<PersonProps> = ({
  x,
  y,
  s = 1.25,
  flip = false,
  cloth = "#2f5d8a",
  trim = C.gold,
  headband = C.red,
  skin = C.skin,
  mood = "neutral",
  arms = "down",
  prop = "none",
  bob = 0,
  lean = 0,
  leader = false,
  sil = false,
  seed = "person",
}) => {
  const dark = "#0e0e16";
  const cCloth = sil ? dark : cloth;
  const cSkin = sil ? dark : skin;
  const cTrim = sil ? dark : trim;
  const cBand = sil ? dark : headband;
  const [aL, aR] = ARMS[arms];

  const browAngry = mood === "angry";
  const browSad = mood === "sad" || mood === "worried";
  const mouth =
    mood === "smile"
      ? "M-11 -196 Q0 -184 11 -196"
      : mood === "angry" || mood === "sad" || mood === "worried"
        ? "M-10 -190 Q0 -200 10 -190"
        : mood === "sly"
          ? "M-13 -195 Q2 -186 15 -200"
          : "M-9 -193 L9 -193";

  const browL = browAngry ? "M-22 -229 L-5 -219" : browSad ? "M-22 -218 L-5 -228" : "M-22 -224 L-5 -224";
  const browR = browAngry ? "M5 -219 L22 -229" : browSad ? "M5 -228 L22 -218" : mood === "sly" ? "M5 -230 L22 -225" : "M5 -224 L22 -224";

  return (
    <g transform={`translate(${x},${y + bob}) rotate(${flip ? -lean : lean}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx={0} cy={4} rx={52} ry={9} fill="rgba(0,0,0,0.22)" />
      {/* kaki */}
      <rect x={-27} y={-72} width={19} height={72} rx={7} fill={sil ? dark : C.skinDark} />
      <rect x={8} y={-72} width={19} height={72} rx={7} fill={sil ? dark : C.skinDark} />
      {/* kain / badan */}
      <path d="M-46 -58 L-37 -182 Q0 -198 37 -182 L46 -58 Z" fill={cCloth} {...EDGE} />
      <path d="M-44 -98 L44 -98 L46 -80 L-45 -80 Z" fill={cTrim} />
      {/* lengan */}
      <g transform={`rotate(${aL} -34 -176)`}>
        <rect x={-42} y={-176} width={16} height={78} rx={8} fill={cSkin} {...EDGE} />
        <circle cx={-34} cy={-97} r={10} fill={cSkin} />
      </g>
      <g transform={`rotate(${aR} 34 -176)`}>
        <rect x={26} y={-176} width={16} height={78} rx={8} fill={cSkin} {...EDGE} />
        <circle cx={34} cy={-97} r={10} fill={cSkin} />
      </g>
      {/* properti */}
      {prop === "spear" && (
        <g>
          <line x1={54} y1={-8} x2={54} y2={-340} stroke="#5e3b21" strokeWidth={7} strokeLinecap="round" />
          <polygon points="46,-336 54,-376 62,-336" fill="#9aa0a6" {...EDGE} />
        </g>
      )}
      {prop === "torch" && (
        <g transform="translate(54,-251)">
          <line x1={0} y1={38} x2={0} y2={-64} stroke="#5e3b21" strokeWidth={9} strokeLinecap="round" />
          <Flame x={0} y={-62} s={0.85} seed={`${seed}-torch`} />
        </g>
      )}
      {prop === "rock" && (
        <polygon points="-56,-268 -30,-330 28,-338 62,-286 40,-258 -30,-256" fill={C.rock} {...EDGE} />
      )}
      {/* kepala */}
      <rect x={-8} y={-200} width={16} height={18} fill={cSkin} />
      <circle cx={0} cy={-215} r={34} fill={cSkin} {...EDGE} />
      <path d="M-35 -218 Q-38 -256 0 -259 Q38 -256 35 -218 Q20 -238 0 -238 Q-20 -238 -35 -218Z" fill={sil ? dark : "#2b1a10"} />
      <path d="M-36 -233 Q0 -247 36 -233 L35 -221 Q0 -235 -35 -221 Z" fill={cBand} />
      {leader && <path d="M33 -231 L60 -250 L52 -222 Z" fill={cBand} {...EDGE} />}
      {!sil && (
        <g>
          <ellipse cx={-12} cy={-212} rx={4.5} ry={5.5} fill="#1b1008" />
          <ellipse cx={12} cy={-212} rx={4.5} ry={5.5} fill="#1b1008" />
          <path d={browL} stroke="#1b1008" strokeWidth={4} strokeLinecap="round" />
          <path d={browR} stroke="#1b1008" strokeWidth={4} strokeLinecap="round" />
          <path d={mouth} stroke="#3a1a10" strokeWidth={4} strokeLinecap="round" fill="none" />
          {mood === "worried" && (
            <path d="M40 -238 Q50 -222 40 -214 Q30 -222 40 -238Z" fill="#8fd0e6" {...EDGE} />
          )}
        </g>
      )}
    </g>
  );
};

/** Sekumpulan warga yang "berjalan" (bob bergantian per frame stop-motion). */
export const Crowd: React.FC<{
  n: number;
  x0: number;
  x1: number;
  y: number;
  s?: number;
  flip?: boolean;
  clothes: string[];
  band?: string;
  prop?: Prop;
  arms?: ArmsPose;
  mood?: Mood;
  sil?: boolean;
  seed: string;
  shiftX?: number;
}> = ({n, x0, x1, y, s = 1, flip = false, clothes, band = C.red, prop = "none", arms = "down", mood = "neutral", sil = false, seed, shiftX = 0}) => {
  const h = useHeld();
  const k = Math.floor(h / STEP);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const px = n === 1 ? x0 : x0 + ((x1 - x0) * i) / (n - 1);
        const jitterY = (random(`${seed}-y-${i}`) - 0.5) * 36;
        return (
          <Person
            key={i}
            x={px + shiftX + (random(`${seed}-x-${i}`) - 0.5) * 30}
            y={y + jitterY}
            s={s * (0.92 + random(`${seed}-s-${i}`) * 0.16)}
            flip={flip}
            cloth={clothes[i % clothes.length]}
            headband={band}
            mood={mood}
            arms={arms}
            prop={prop}
            sil={sil}
            bob={((k + i) % 2) * -9}
            seed={`${seed}-${i}`}
          />
        );
      })}
    </g>
  );
};
