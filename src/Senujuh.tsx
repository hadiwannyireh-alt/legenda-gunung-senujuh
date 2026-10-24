import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig} from "remotion";
import data from "./data/storyboard.json";
import type {Shot, Storyboard} from "./types";
import {FPS, tween, useHeld} from "./lib/stopMotion";
import {Kraft, PaperGrain, W} from "./components/Paper";
import {Subtitle} from "./components/Subtitle";
import {KineticTitle} from "./components/KineticTitle";
import {ShotSfx} from "./components/ShotSfx";
import {SCENES} from "./scenes/Scenes";
import {cue, shotTiming} from "./lib/vo";

export const storyboard = data as unknown as Storyboard;
export const TOTAL_FRAMES = storyboard.project_metadata.total_duration_seconds * FPS; // 136 * 24 = 3264

/** Panel kertas yang bergeser (stop-motion) sebagai transisi antar shot. */
const PaperWipe: React.FC = () => {
  const f = useHeld();
  if (f > 12) return null;
  const x = tween(f, 0, 12, 0, -W - 80);
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      <div style={{position: "absolute", inset: 0, transform: `translateX(${x}px)`, filter: "drop-shadow(14px 0 16px rgba(40,20,5,0.6))"}}>
        <Kraft />
      </div>
    </AbsoluteFill>
  );
};

const TITLE_CUE: Record<number, string> = {
  1: "Pada", 2: "menemukan", 3: "keserakahan", 4: "Pertumpahan", 5: "Mari", 6: "siang", 7: "tipu",
  8: "kain", 9: "putus", 10: "menenggelamkan", 11: "mengetahui", 12: "berdiri", 13: "Kisah",
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const Scene = SCENES[shot.shot_id];
  // judul muncul tepat sebelum kata kuncinya diucapkan, tampil ±5 dtk; shot 12-13 bertahan sampai akhir
  const inAt = Math.max(5, cue(shot.shot_id, TITLE_CUE[shot.shot_id] ?? "") - 6);
  const hold = shot.shot_id >= 12 ? 9999 : inAt + 5 * FPS;
  return (
    <AbsoluteFill>
      <Kraft />
      {Scene ? <Scene /> : null}
      <PaperGrain />
      <KineticTitle text={shot.dynamic_typography.text} style={shot.dynamic_typography.style} hold={hold} inAt={inAt} />
      <Subtitle shotId={shot.shot_id} text={shot.subtitles} />
      {shot.shot_id > 1 && <PaperWipe />}
      <ShotSfx shot={shot} />
    </AbsoluteFill>
  );
};

export const Senujuh: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  // Batas shot mengikuti jeda nyata di audio VO (bukan timestamp rencana di JSON).
  const froms = storyboard.storyboard.map((s) => Math.round(shotTiming(s.shot_id).seq_start * FPS));
  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {storyboard.storyboard.map((shot, i) => {
        const from = froms[i];
        const end = i < froms.length - 1 ? froms[i + 1] : durationInFrames;
        return (
          <Sequence key={shot.shot_id} from={from} durationInFrames={end - from} name={`Shot ${shot.shot_id} · ${shot.act}`}>
            <ShotView shot={shot} />
          </Sequence>
        );
      })}
      {/* Voice over utama 0 – 136 dtk (volume 100%) */}
      <Audio
        src={staticFile("audio/vo.mp3")}
        endAt={durationInFrames}
        volume={(f) => interpolate(f, [durationInFrames - 4, durationInFrames], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}
      />
    </AbsoluteFill>
  );
};
