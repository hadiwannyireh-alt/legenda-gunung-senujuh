import timing from "../data/voTiming.json";
import {FPS} from "./stopMotion";

/**
 * Waktu bicara VO hasil pengukuran audio (scripts/align-vo.py).
 * Timestamp di storyboard.json adalah rencana kasar; VO sebenarnya lebih lambat,
 * jadi batas shot, subtitle, SFX, dan animasi di-cue dari data ini.
 */
type Word = {w: string; start: number; end: number};
type ShotTiming = {
  shot_id: number;
  seq_start: number;
  seq_end: number;
  speech_start: number;
  speech_end: number;
  words: Word[];
};

const SHOTS = (timing as unknown as {shots: ShotTiming[]}).shots;

export const shotTiming = (id: number): ShotTiming => {
  const s = SHOTS.find((x) => x.shot_id === id);
  if (!s) throw new Error(`voTiming: shot ${id} tidak ada`);
  return s;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z-]/g, "");

/** Detik (relatif awal shot) saat kata berawalan `kw` mulai (atau selesai) diucapkan. */
export const cueSec = (id: number, kw: string, nth = 0, edge: "start" | "end" = "start"): number => {
  const t = shotTiming(id);
  const k = norm(kw);
  const hits = t.words.filter((w) => norm(w.w).startsWith(k));
  const h = hits[nth] ?? hits[0];
  if (!h) return 0;
  return (edge === "start" ? h.start : h.end) - t.seq_start;
};

/** Sama seperti cueSec tetapi dalam frame 24 fps. */
export const cue = (id: number, kw: string, nth = 0, edge: "start" | "end" = "start"): number =>
  Math.round(cueSec(id, kw, nth, edge) * FPS);

export type Piece = {text: string; from: number; to: number};

/** Memecah `subtitles` menjadi potongan 1-2 baris yang muncul tepat saat diucapkan. */
export const subtitlePieces = (id: number, seqFrames: number): Piece[] => {
  const t = shotTiming(id);
  const groups: Word[][] = [];
  let cur: Word[] = [];
  const len = (ws: Word[]) => ws.map((w) => w.w).join(" ").length;
  t.words.forEach((w, i) => {
    cur.push(w);
    const L = len(cur);
    const sentenceEnd = /[.!?]["”]?$/.test(w.w);
    const comma = /[,:;]$/.test(w.w);
    if ((sentenceEnd && L >= 18) || (comma && L >= 42) || L >= 76 || i === t.words.length - 1) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  const starts = groups.map((g, i) =>
    i === 0 ? 0 : Math.max(0, Math.round((g[0].start - t.seq_start) * FPS) - 3),
  );
  return groups.map((g, i) => ({
    text: g.map((w) => w.w).join(" "),
    from: starts[i],
    to: i < groups.length - 1 ? starts[i + 1] : seqFrames,
  }));
};
