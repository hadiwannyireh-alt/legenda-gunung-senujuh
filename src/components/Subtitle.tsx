import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {STEP, tween, useHeld} from "../lib/stopMotion";
import {subtitlePieces} from "../lib/vo";
import {C} from "./Paper";
import {lora} from "./fonts";

/**
 * Subtitle bottom-center. Teks dari field `subtitles`, dipecah per frasa
 * dan ditampilkan sinkron dengan VO (waktu kata dari src/data/voTiming.json).
 */
export const Subtitle: React.FC<{shotId: number; text: string}> = ({shotId, text}) => {
  const f = useHeld();
  const {durationInFrames: d} = useVideoConfig();
  const pieces = React.useMemo(() => subtitlePieces(shotId, d), [shotId, d]);
  const piece = pieces.find((p) => f >= p.from && f < p.to) ?? pieces[pieces.length - 1];
  const shown = piece ? piece.text : text;
  const local = piece ? f - piece.from : 0;
  const opacity = Math.min(tween(local, 0, 6, 0, 1), tween(f, d - 6, d, 1, 0));
  const lift = tween(local, 0, 6, 18, 0);
  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 70, pointerEvents: "none"}}>
      <div
        style={{
          opacity,
          transform: `translateY(${lift}px) rotate(${Math.floor(f / STEP) % 2 ? -0.35 : 0.2}deg)`,
          filter: "drop-shadow(0 8px 10px rgba(40,20,5,0.55))",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            padding: "26px 48px",
            background: C.cream,
            color: C.ink,
            fontFamily: lora,
            fontWeight: 600,
            fontSize: 48,
            lineHeight: 1.32,
            textAlign: "center",
            clipPath:
              "polygon(0% 8%,6% 0%,18% 5%,34% 0%,52% 4%,70% 0%,86% 5%,96% 0%,100% 10%,99% 45%,100% 78%,96% 100%,84% 95%,66% 100%,48% 96%,30% 100%,14% 95%,4% 100%,0% 90%,1% 50%)",
          }}
        >
          {shown}
        </div>
      </div>
    </AbsoluteFill>
  );
};
