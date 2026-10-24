import React from "react";
import {Birds, Cloud, GROUND, Hill, Layer, Moon, River, Sky, Stars, Sun, Svg, Tree} from "./Paper";
import {SLOW_STEP, useHeld} from "../lib/stopMotion";

export type Theme = "day" | "green" | "dusk" | "night" | "storm" | "gold";

type ThemeDef = {
  sky: [string, string];
  far: string;
  mid: string;
  ground: string;
  ground2: string;
  river: string;
  riverLight: string;
  tree: string;
  mountain: string;
  mountainDark: string;
};

export const THEMES: Record<Theme, ThemeDef> = {
  day: {sky: ["#f4c28a", "#fbe7b9"], far: "#8ea98a", mid: "#6d9a5c", ground: "#5a8a3f", ground2: "#476f32", river: "#5fa0b5", riverLight: "#a6d9e4", tree: "#3d7a35", mountain: "#7d8f6a", mountainDark: "#5d6e4f"},
  green: {sky: ["#bfe6f0", "#f3f1cf"], far: "#7fb383", mid: "#4f9f4a", ground: "#3f8f3a", ground2: "#2f742c", river: "#4fb0c4", riverLight: "#b4eaf0", tree: "#2f8a3a", mountain: "#6c9a64", mountainDark: "#4d7a48"},
  dusk: {sky: ["#7a4a6b", "#f08a4b"], far: "#6a4a64", mid: "#55405a", ground: "#4a3d46", ground2: "#3a2f38", river: "#7a5a7e", riverLight: "#d9a2a0", tree: "#2f3a35", mountain: "#6b5668", mountainDark: "#4a3a4a"},
  night: {sky: ["#0d1630", "#243b66"], far: "#1c2a4a", mid: "#16233f", ground: "#101b33", ground2: "#0b1427", river: "#233a66", riverLight: "#4a6aa0", tree: "#0f2330", mountain: "#26365a", mountainDark: "#182544"},
  storm: {sky: ["#22252f", "#59606e"], far: "#3a404c", mid: "#2f3540", ground: "#262b33", ground2: "#1c2027", river: "#3a4658", riverLight: "#7d8ba0", tree: "#1d262a", mountain: "#4a5160", mountainDark: "#323844"},
  gold: {sky: ["#f7c35f", "#fde9a8"], far: "#c9a35a", mid: "#8fa04a", ground: "#6f9a3a", ground2: "#55802c", river: "#6db2b5", riverLight: "#f4e2a0", tree: "#4a8a35", mountain: "#8a7a4a", mountainDark: "#5f5230"},
};

/** Langit, benda langit, bukit jauh & tengah beserta pohon. Gunung digambar sesudahnya oleh scene. */
export const Backdrop: React.FC<{
  theme: Theme;
  sun?: {x: number; y: number} | null;
  moon?: {x: number; y: number} | null;
  stars?: boolean;
  clouds?: boolean;
  birds?: boolean;
}> = ({theme, sun, moon, stars, clouds, birds}) => {
  const t = THEMES[theme];
  const f = useHeld(SLOW_STEP);
  return (
    <>
      <Layer depth={0} seed="sky" amp={0}>
        <Svg>
          <Sky id={`sky-${theme}`} colors={t.sky} />
        </Svg>
      </Layer>
      {(sun || moon || stars || clouds || birds) && (
        <Layer depth={5} seed="celestial" amp={1} step={SLOW_STEP}>
          <Svg>
            {stars && <Stars f={f} />}
            {sun && <Sun x={sun.x} y={sun.y} rot={f * 1.4} />}
            {moon && <Moon x={moon.x} y={moon.y} />}
            {clouds && (
              <>
                <Cloud x={((300 + f * 0.8) % 2300) - 200} y={210} s={1.2} />
                <Cloud x={((1300 + f * 0.5) % 2300) - 200} y={330} s={0.9} />
              </>
            )}
            {birds && <Birds x={((f * 5) % 2300) - 200} y={300} f={f} />}
          </Svg>
        </Layer>
      )}
      <Layer depth={6} seed="far" amp={1} step={SLOW_STEP}>
        <Svg>
          <Hill base={600} amp={90} color={t.far} seed={3} />
        </Svg>
      </Layer>
      <Layer depth={8} seed="mid" amp={1} step={SLOW_STEP}>
        <Svg>
          <Hill base={650} amp={40} color={t.mid} seed={5} />
          {[120, 430, 860, 1240, 1610, 1830].map((x, i) => (
            <Tree key={x} x={x} y={668} s={0.7 + (i % 3) * 0.12} color={t.tree} kind={i % 2 ? "round" : "palm"} />
          ))}
        </Svg>
      </Layer>
    </>
  );
};

/** Sungai/muara + tepian tanah di depan. Gambar SETELAH gunung (menyembunyikan dasar gunung). */
export const Foreground: React.FC<{theme: Theme}> = ({theme}) => {
  const t = THEMES[theme];
  const f = useHeld(SLOW_STEP);
  return (
    <>
      <Layer depth={10} seed="river" amp={1} step={SLOW_STEP}>
        <Svg>
          <River y={655} h={105} color={t.river} light={t.riverLight} f={f} />
        </Svg>
      </Layer>
      <Layer depth={14} seed="ground" amp={1} step={SLOW_STEP}>
        <Svg>
          <Hill base={GROUND + 22} amp={14} color={t.ground} seed={7} />
          <Hill base={GROUND + 150} amp={22} color={t.ground2} seed={9} />
        </Svg>
      </Layer>
    </>
  );
};
