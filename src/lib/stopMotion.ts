import {Easing, interpolate, random, useCurrentFrame} from "remotion";

export const FPS = 24;

/**
 * Frame rate "gerak" stop-motion. Pilih 8-12 (pembagi 24 yang rapi: 8 atau 12).
 * Komposisi tetap 24 fps, tetapi semua animasi di-hold per STEP frame.
 */
export const STOP_FPS = 12;
export const STEP = Math.max(1, Math.round(FPS / STOP_FPS)); // 12 fps -> hold 2 frame
export const SLOW_STEP = 3; // 8 fps, dipakai layer latar yang "lebih malas"

/** Frame lokal (di dalam <Sequence>) yang di-hold, supaya gerak bertahap seperti stop-motion. */
export const useHeld = (step: number = STEP): number => {
  const f = useCurrentFrame();
  return Math.floor(f / step) * step;
};

/** Getaran kertas ("boil") deterministik, berubah tiap frame stop-motion. */
export const wobble = (seed: string, held: number, amp = 1.5, step: number = STEP) => {
  const k = Math.floor(held / step);
  return {
    x: (random(`${seed}-x-${k}`) - 0.5) * 2 * amp,
    y: (random(`${seed}-y-${k}`) - 0.5) * 2 * amp,
    r: (random(`${seed}-r-${k}`) - 0.5) * amp * 0.5,
  };
};

export const flick = (seed: string, held: number, step: number = STEP): number =>
  random(`${seed}-${Math.floor(held / step)}`);

export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(1.8));

/** Interpolasi ber-clamp. Pastikan a < b. */
export const tween = (
  f: number,
  a: number,
  b: number,
  from: number,
  to: number,
  easing?: (t: number) => number,
): number =>
  interpolate(f, [a, Math.max(b, a + 0.001)], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
