import React from "react";
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from "remotion";
import {FPS} from "../lib/stopMotion";
import {cue} from "../lib/vo";
import type {Shot} from "../types";

/** Ganti ke "mp3" jika SFX hasil AI Anda berformat mp3 (nama file tetap = sound_name). */
export const SFX_EXT = "wav";

type Cat = "ambience" | "music" | "sfx";
const CATEGORY: Record<string, Cat> = {
  soft_nature_ambient: "ambience",
  river_waves_soft: "ambience",
  fire_torch_crackle: "ambience",
  traditional_sape_intro: "music",
  tense_drone_synth: "music",
  suspense_drone_synth: "music",
  sad_flute_solo: "music",
  epic_orchestra_settle: "music",
};
// overall_mix dari JSON: Ambience 30%, SFX 40%, Music 60%
const MIX: Record<Cat, number> = {ambience: 0.3, sfx: 0.4, music: 0.6};

/**
 * SFX yang harus jatuh tepat pada kata tertentu di narasi (kata awal, jeda dalam detik).
 * Selain itu dipakai offset time_sec - timestamp_start_sec dari JSON, dihitung dari awal shot yang sudah disinkronkan.
 */
const SFX_CUES: Record<string, {word: string; lag?: number}> = {
  fire_torch_crackle: {word: "Pertumpahan"},
  suspense_drone_synth: {word: "cemas"},
  fabric_flapping_wind: {word: "membentangkan"},
  sad_flute_solo: {word: "putus"},
  massive_water_splash: {word: "menenggelamkan", lag: 1.7},
  cloth_rip_thunder: {word: "trik"},
  book_close_fade: {word: "pernah"},
};

/**
 * Memicu sfx_commands milik satu shot.
 * Aksi "trigger" = sekali putar, "play" = loop sampai akhir shot dengan fade in/out.
 */
export const ShotSfx: React.FC<{shot: Shot}> = ({shot}) => {
  const {durationInFrames} = useVideoConfig();
  return (
    <>
      {shot.sfx_commands.map((c, i) => {
        const sc = SFX_CUES[c.sound_name];
        const from = sc
          ? cue(shot.shot_id, sc.word) + Math.round((sc.lag ?? 0) * FPS)
          : Math.round((c.time_sec - shot.timestamp_start_sec) * FPS);
        const gain = c.volume * MIX[CATEGORY[c.sound_name] ?? "sfx"];
        const src = staticFile(`sfx/${c.sound_name}.${SFX_EXT}`);
        const len = durationInFrames - from;
        if (len <= 0) return null;
        if (c.action === "trigger") {
          return (
            <Sequence key={i} from={from} layout="none" name={`SFX ${c.sound_name}`}>
              <Audio src={src} volume={gain} />
            </Sequence>
          );
        }
        return (
          <Sequence key={i} from={from} durationInFrames={len} layout="none" name={`SFX ${c.sound_name}`}>
            <Audio
              src={src}
              loop
              volume={(f) =>
                gain *
                interpolate(f, [0, 12, Math.max(len - 24, 13), Math.max(len, 14)], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              }
            />
          </Sequence>
        );
      })}
    </>
  );
};
