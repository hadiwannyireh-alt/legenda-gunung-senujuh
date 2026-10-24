import React from "react";
import {AbsoluteFill, random, useVideoConfig} from "remotion";
import {STEP, easeOut, easeOutBack, flick, tween, useHeld} from "../lib/stopMotion";
import {C} from "./Paper";
import {alfa, lora} from "./fonts";

type Variant =
  | "bold" | "slide" | "rough" | "tear" | "quote" | "tick"
  | "creep" | "flicker" | "fade" | "drop" | "glitch" | "elegant" | "credits";

/** Memetakan field `dynamic_typography.style` dari JSON ke varian animasi. */
export const variantOf = (style: string): Variant => {
  const t = style.toLowerCase();
  if (t.includes("slide-in")) return "slide";
  if (t.includes("red-edged")) return "rough";
  if (t.includes("aggressive")) return "tear";
  if (t.includes("quotation")) return "quote";
  if (t.includes("ticking")) return "tick";
  if (t.includes("creeping")) return "creep";
  if (t.includes("flicker")) return "flicker";
  if (t.includes("fading grey")) return "fade";
  if (t.includes("splash")) return "drop";
  if (t.includes("glitch")) return "glitch";
  if (t.includes("elegant")) return "elegant";
  if (t.includes("credits")) return "credits";
  return "bold";
};

/** Lebar maksimum teks satu baris (px); plate menambah padding 112px sehingga total < 1920 */
const MAX_LINE_W = 1560;

const PLATE: Partial<Record<Variant, string>> = {
  flicker: "rgba(31,58,42,0.92)",
  fade: "#d9d5cc",
  creep: "#e6d6b0",
};

export const KineticTitle: React.FC<{text: string; style: string; hold: number; inAt: number}> = ({text, style, hold, inAt}) => {
  const f = useHeld();
  const {durationInFrames: d} = useVideoConfig();
  const v = variantOf(style);
  const lines = text.split("\n");
  const outStart = Math.min(hold, d - 10);
  const out = tween(f, outStart, outStart + 10, 0, 1);
  const plateOpacity = Math.min(tween(f, inAt - 4, inAt + 8, 0, 1), 1 - out);
  const k = Math.floor(f / STEP);

  let total = 0;
  const renderLine = (line: string, li: number) => {
    const chars = Array.from(line);
    const big = li === 0;
    const size =
      v === "credits" ? (big ? 112 : 46) : v === "elegant" ? 108 : v === "slide" ? 92 : v === "creep" || v === "fade" ? 96 : v === "drop" || v === "glitch" || v === "quote" ? 112 : 118;
    const family = v === "slide" || v === "elegant" || v === "fade" || (v === "credits" && !big) ? lora : alfa;
    // auto-fit: perkecil font agar satu baris muat di lebar layar (lebar glyph rata-rata per em)
    const em = (family === alfa ? 0.74 : 0.56) + (v === "elegant" ? 0.12 : 0) + (v === "quote" && li === 0 ? 0.1 : 0);
    const fs = Math.floor(Math.min(size, MAX_LINE_W / (Math.max(chars.length, 1) * em)));
    return (
      <div key={li} style={{whiteSpace: "pre", fontFamily: family, fontSize: fs, lineHeight: 1.1, fontStyle: v === "slide" || (v === "credits" && !big) ? "italic" : "normal", fontWeight: family === lora ? 700 : 400}}>
        {v === "quote" && li === 0 ? "“" : null}
        {chars.map((ch, i) => {
          const idx = total++;
          const stag = v === "tick" ? 1.2 : v === "drop" ? 2.2 : v === "tear" ? 1.4 : 1.8;
          const st = inAt + idx * stag;
          const p = tween(f, st, st + 12, 0, 1);
          let o = p;
          let tx = 0, ty = 0, sc = 1, rot = 0, blur = 0;
          let color: string = C.ink;
          let shadow = "3px 3px 0 rgba(255,240,210,0.9)";
          switch (v) {
            case "bold":
              sc = tween(f, st, st + 12, 0.2, 1, easeOutBack);
              ty = (1 - p) * -60;
              rot = (random(`r-${idx}`) - 0.5) * 8 * p;
              break;
            case "slide":
              tx = (1 - tween(f, st, st + 14, 0, 1, easeOut)) * -120;
              shadow = "2px 2px 0 rgba(255,240,210,0.9)";
              break;
            case "rough":
              color = C.red;
              shadow = "4px 4px 0 #3a0d0a";
              tx = (random(`jx-${idx}-${k}`) - 0.5) * 6;
              ty = (random(`jy-${idx}-${k}`) - 0.5) * 6 + (1 - p) * 40;
              rot = (random(`jr-${idx}-${k}`) - 0.5) * 6;
              break;
            case "tear":
              color = "#7a1510";
              sc = tween(f, st, st + 8, 3, 1, easeOut);
              tx = (random(`sx-${k}`) - 0.5) * 5;
              ty = (random(`sy-${k}`) - 0.5) * 5;
              rot = (random(`tr-${idx}`) - 0.5) * 10;
              break;
            case "quote":
              sc = tween(f, st, st + 14, 0.6, 1, easeOutBack);
              break;
            case "tick":
              o = f >= st ? 1 : 0;
              break;
            case "creep":
              ty = (1 - p) * 24;
              blur = (1 - p) * 10;
              color = "#1b1b1b";
              shadow = "0 12px 18px rgba(0,0,0,0.5)";
              break;
            case "flicker":
              color = "#e8f5d8";
              shadow = "0 0 14px rgba(160,230,150,0.6)";
              o = p * (p >= 1 ? 0.45 + flick(`fk-${idx}`, f) * 0.55 : 1);
              break;
            case "fade":
              o = tween(f, inAt, inAt + 40, 0, 1);
              color = "#6b6b6b";
              shadow = "2px 2px 0 rgba(255,255,255,0.7)";
              break;
            case "drop": {
              const dp = tween(f, st, st + 14, 0, 1);
              ty = (1 - dp) * -320 + (dp > 0.85 && dp < 1 ? 8 : 0);
              color = "#1f5f7a";
              break;
            }
            case "glitch": {
              const hit = k % 7 < 2 && f > st;
              const dx = hit ? 4 + random(`gl-${idx}-${k}`) * 8 : 0;
              tx = hit ? (random(`gx-${idx}-${k}`) - 0.5) * 14 : 0;
              shadow = `${dx}px 0 #e0352b, ${-dx}px 0 #2bb3c0`;
              break;
            }
            case "elegant":
              o = tween(f, inAt, inAt + 30, 0, 1);
              shadow = "2px 2px 0 rgba(255,240,210,0.9)";
              break;
            case "credits":
              o = tween(f, inAt, inAt + 24, 0, 1);
              ty = (1 - o) * 20;
              break;
          }
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: o,
                color,
                textShadow: shadow,
                filter: blur ? `blur(${blur}px)` : undefined,
                transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sc})`,
                letterSpacing: v === "elegant" ? `${tween(f, inAt, inAt + 40, 0.02, 0.12)}em` : undefined,
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          );
        })}
        {v === "quote" && li === lines.length - 1 ? "”" : null}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: "center", paddingTop: 96, pointerEvents: "none"}}>
      <div
        style={{
          opacity: 1 - out,
          transform: `translateY(${out * -50}px) rotate(${k % 2 ? 0.3 : -0.3}deg)`,
          filter: "drop-shadow(0 10px 12px rgba(40,20,5,0.55))",
        }}
      >
        <div
          style={{
            padding: "20px 56px 26px",
            maxWidth: 1760,
            background: PLATE[v] ?? C.cream,
            opacity: plateOpacity,
            textAlign: "center",
            clipPath:
              "polygon(0% 6%,8% 0%,20% 5%,35% 0%,50% 4%,66% 0%,82% 5%,94% 0%,100% 8%,99% 40%,100% 70%,97% 100%,85% 95%,70% 100%,52% 96%,36% 100%,20% 95%,7% 100%,0% 92%,1% 55%)",
          }}
        >
          {lines.map(renderLine)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
