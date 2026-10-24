import React from "react";
import {random, useVideoConfig} from "remotion";
import {Backdrop, Foreground, THEMES, Theme} from "../components/Backdrop";
import {Crowd, Flame, Person} from "../components/Characters";
import {C, EDGE, H, Hut, Layer, Mountain, Splash, Svg, Tree, W} from "../components/Paper";
import {SLOW_STEP, STEP, easeIn, easeInOut, easeOut, easeOutBack, flick, tween, useHeld} from "../lib/stopMotion";
import {cue} from "../lib/vo";

const FOOT = 775; // posisi kaki karakter di tepian depan
const DATUK = {cloth: "#2f5d8a", headband: C.red, trim: C.gold, leader: true} as const;
const KISINU = {cloth: "#8a3b2f", headband: "#e0a93a", trim: "#f4e7c8", leader: true} as const;

const useDur = () => useVideoConfig().durationInFrames;

/** Muncul dengan "pop" kertas mulai frame `start`. */
const pop = (f: number, start: number) => tween(f, start, start + 10, 0, 1, easeOutBack);

/** Gunung di belakang sungai. */
const Mtn: React.FC<{theme: Theme; x: number; h: number; seed: string; dy?: number}> = ({theme, x, h, seed, dy = 0}) => {
  const t = THEMES[theme];
  return (
    <Layer depth={10} seed={seed} amp={1.5} dy={dy}>
      <Svg>
        <Mountain x={x} base={680} w={h * 1.45} h={h} color={t.mountain} dark={t.mountainDark} />
      </Svg>
    </Layer>
  );
};

/* 1 — Pembuka: alam dulu, lalu dua desa muncul saat disebut */
const S1: React.FC = () => {
  const f = useHeld(SLOW_STEP);
  const g = useHeld();
  const d = useDur();
  const cL = cue(1, "dua");
  const cR = cue(1, "hidup");
  const nameL = cue(1, "Sebatok");
  const nameR = cue(1, "Sinujuh");
  const bump = (start: number) => 1 + 0.12 * Math.max(0, 1 - Math.abs(g - start - 8) / 8);
  const hutsL: [number, number, number][] = [[250, 660, 0.9], [420, 668, 0.75], [560, 656, 0.8]];
  const hutsR: [number, number, number][] = [[1370, 660, 0.85], [1530, 668, 0.78], [1680, 656, 0.9]];
  return (
    <>
      <Backdrop theme="day" sun={{x: 960, y: tween(f, 0, d, 480, 320)}} clouds birds />
      <Layer depth={9} seed="villages" amp={1.2}>
        <Svg>
          {hutsL.map(([x, y, sc], i) => (
            <Hut key={`l${i}`} x={x} y={y} s={sc * pop(g, cL + i * 6) * bump(nameL)} lit={i === 2} />
          ))}
          {hutsR.map(([x, y, sc], i) => (
            <Hut key={`r${i}`} x={x} y={y} s={sc * pop(g, cR + i * 6) * bump(nameR)} roof="#6a3e22" wall="#a87a4a" lit={i === 1} />
          ))}
        </Svg>
      </Layer>
      <Foreground theme="day" />
    </>
  );
};

/* 2 — Berburu, lalu wilayah subur terungkap saat "Tanahnya sangat subur" */
const S2: React.FC = () => {
  const f = useHeld();
  const d = useDur();
  const k = Math.floor(f / STEP);
  const x1 = tween(f, 0, d - 20, 200, 1000);
  const rich = cue(2, "Tanahnya");
  const grow = tween(f, rich, rich + 40, 0.7, 1, easeOut);
  return (
    <>
      <Backdrop theme="green" sun={{x: 1500, y: 300}} clouds birds />
      <Layer depth={9} seed="flora" amp={1.2} step={SLOW_STEP}>
        <Svg>
          {[300, 700, 1100, 1500, 1750].map((x, i) => (
            <Tree key={x} x={x} y={690} s={(0.9 + (i % 2) * 0.25) * grow} color="#2f8a3a" kind={i % 2 ? "palm" : "round"} />
          ))}
        </Svg>
      </Layer>
      <Foreground theme="green" />
      <Layer depth={16} seed="sparkle" amp={0.5}>
        <Svg>
          {f >= rich &&
            Array.from({length: 9}).map((_, i) => {
              const x = 520 + i * 130;
              const y = 700 + (i % 3) * 18;
              const on = flick(`sp-${i}`, f) > 0.4;
              return on ? <polygon key={i} points={`${x},${y - 14} ${x + 6},${y} ${x},${y + 14} ${x - 6},${y}`} fill="#fff6c9" /> : null;
            })}
        </Svg>
      </Layer>
      <Layer depth={16} seed="hunters" amp={1}>
        <Svg>
          <Person x={x1} y={FOOT} {...DATUK} prop="spear" bob={(k % 2) * -9} seed="d2" mood={f >= rich ? "smile" : "neutral"} />
          <Person x={x1 + 260} y={FOOT + 6} {...KISINU} prop="spear" bob={((k + 1) % 2) * -9} seed="k2" mood="smile" />
        </Svg>
      </Layer>
    </>
  );
};

/* 3 — Keserakahan: wajah berubah saat "keserakahan", bayangan menutup peta pelan-pelan */
const S3: React.FC = () => {
  const f = useHeld();
  const d = useDur();
  const greed = cue(3, "keserakahan");
  const s0 = cue(3, "Masing-masing");
  const s1 = cue(3, "terelakkan") + 12;
  const sx = tween(f, s0, s1, -360, 250, easeInOut);
  const shadow = `-360,-190 ${sx},-190 ${sx - 60},-100 ${sx + 30},-20 ${sx - 70},70 ${sx + 20},190 -360,190`;
  const angry = f >= greed;
  return (
    <>
      <Backdrop theme={angry ? "storm" : "dusk"} clouds />
      <Foreground theme={angry ? "storm" : "dusk"} />
      <Layer depth={14} seed="map" amp={1.2}>
        <Svg>
          <g transform="translate(960,500) rotate(-2)">
            <rect x={-360} y={-190} width={720} height={380} fill="#efdcae" {...EDGE} />
            <polygon points="-300,-120 -120,-150 60,-110 150,-20 90,100 -80,140 -260,90 -320,-10" fill="#6aa84f" {...EDGE} />
            <path d="M-340 20 Q-120 -40 40 30 T340 -10" stroke="#5fa0b5" strokeWidth={26} fill="none" />
            <polygon points={shadow} fill="#1a1020" opacity={0.88} />
          </g>
        </Svg>
      </Layer>
      <Layer depth={16} seed="leaders3" amp={1}>
        <Svg>
          <Person x={tween(f, 0, 30, 300, 400)} y={FOOT} {...DATUK} mood={angry ? "angry" : "smile"} arms={f >= s0 ? "point" : "down"} seed="d3" />
          <Person x={tween(f, 0, 30, 1620, 1520)} y={FOOT} {...KISINU} mood={angry ? "angry" : "smile"} arms={f >= s0 ? "point" : "down"} flip seed="k3" />
        </Svg>
      </Layer>
      {angry && <div style={{position: "absolute", inset: 0, background: "rgba(120,10,10,0.10)", opacity: tween(f, greed, greed + 30, 0, 1)}} />}
    </>
  );
};

/* 4 — Pertumpahan darah: massa mendekat saat "bentrokan", api merah makin kuat saat "Pertumpahan" */
const S4: React.FC = () => {
  const f = useHeld();
  const clash = cue(4, "bentrokan");
  const blood = cue(4, "Pertumpahan");
  const push = tween(f, 0, blood + 30, -260, 150, easeInOut);
  const glow = tween(f, blood, blood + 30, 0.1, 0.26) + flick("glow4", f) * 0.08;
  return (
    <>
      <Backdrop theme="night" moon={{x: 1560, y: 230}} stars />
      <Foreground theme="night" />
      <Layer depth={14} seed="clash" amp={f >= clash ? 2.4 : 1.2}>
        <Svg>
          <Crowd n={5} x0={140} x1={800} y={FOOT} s={1.1} clothes={["#222"]} prop="torch" arms="up" mood="angry" sil seed="L4" shiftX={push} />
          <Crowd n={5} x0={1120} x1={1780} y={FOOT} s={1.1} flip clothes={["#222"]} prop="spear" arms="up" mood="angry" sil seed="R4" shiftX={-push} />
        </Svg>
      </Layer>
      <div style={{position: "absolute", inset: 0, background: `rgba(200,30,20,${glow})`, mixBlendMode: "screen"}} />
    </>
  );
};

/* 5 — Usul lomba: Ki Sinu maju saat namanya disebut, tangan terbentang saat "Mari kita berlomba" */
const S5: React.FC = () => {
  const f = useHeld();
  const gong = 12; // gong_stop_battle jatuh 0,5 dtk setelah awal shot
  const cK = cue(5, "Ki");
  const cMari = cue(5, "Mari");
  const kx = tween(f, cK, cK + 54, 1400, 1040, easeOut);
  const ring = (delay: number) => {
    const r = tween(f, gong + delay, gong + delay + 48, 40, 780);
    const o = tween(f, gong + delay, gong + delay + 48, 0.8, 0);
    return <circle cx={960} cy={480} r={r} fill="none" stroke="#f4e7c8" strokeWidth={14} opacity={f >= gong + delay ? o : 0} />;
  };
  return (
    <>
      <Backdrop theme="dusk" sun={{x: 300, y: 430}} clouds />
      <Foreground theme="dusk" />
      <Layer depth={4} seed="ring" amp={1}>
        <Svg>
          {ring(0)}
          {ring(10)}
          {ring(20)}
        </Svg>
      </Layer>
      <Layer depth={12} seed="watchers" amp={1}>
        <Svg>
          <Crowd n={3} x0={130} x1={420} y={FOOT - 5} s={0.9} clothes={["#4a3d46", "#5a4a50"]} prop="spear" mood="worried" sil seed="L5" />
          <Crowd n={3} x0={1560} x1={1790} y={FOOT - 5} s={0.9} flip clothes={["#4a3d46", "#5a4a50"]} prop="spear" mood="worried" sil seed="R5" />
        </Svg>
      </Layer>
      <Layer depth={16} seed="leaders5" amp={1}>
        <Svg>
          <Person x={620} y={FOOT} {...DATUK} mood={f >= cMari ? "worried" : "sad"} arms="down" s={1.3} seed="d5" />
          <Person x={kx} y={FOOT} {...KISINU} mood="smile" arms={f >= cMari ? "spread" : "point"} s={1.35} seed="k5" />
        </Svg>
      </Layer>
    </>
  );
};

/* 6 — Gotong royong: gunung tumbuh sepanjang narasi, siang-malam bergantian mulai "siang dan malam" */
const S6: React.FC = () => {
  const f = useHeld();
  const d = useDur();
  const c0 = cue(6, "dimulai");
  const cDay = cue(6, "siang");
  const phase = f < cDay ? 0 : Math.floor((f - cDay) / 84) % 2; // 3,5 dtk per fase
  const night = phase === 1;
  const theme: Theme = night ? "night" : "green";
  const prog = Math.floor(f / 8) * 8; // tumbuh bertahap
  const hL = tween(prog, c0, d - 20, 90, 300);
  const hR = tween(prog, c0, d - 20, 85, 305);
  const walk = (Math.floor(f / STEP) * 12) % 130;
  return (
    <>
      <Backdrop theme={theme} sun={night ? null : {x: tween(f, 0, d, 200, 1700), y: 300}} moon={night ? {x: 1500, y: 230} : null} stars={night} />
      <Mtn theme={theme} x={520} h={hL} seed="mL" />
      <Mtn theme={theme} x={1400} h={hR} seed="mR" />
      <Foreground theme={theme} />
      <Layer depth={14} seed="workers" amp={1.6}>
        <Svg>
          <Crowd n={4} x0={150} x1={700} y={FOOT} s={1} clothes={["#2f5d8a", "#4a7aa8"]} prop="rock" arms="carry" mood="neutral" seed="L6" shiftX={walk} />
          <Crowd n={4} x0={1000} x1={1560} y={FOOT} s={1} clothes={["#8a3b2f", "#a85a3a"]} prop="rock" arms="carry" mood="neutral" seed="R6" shiftX={walk} />
        </Svg>
      </Layer>
    </>
  );
};

/* 7 — Dua gunung seimbang, Ki Sinu masuk saat disebut, cemas lalu menyeringai saat "merencanakan" */
const S7: React.FC = () => {
  const f = useHeld();
  const d = useDur();
  const cKi = cue(7, "Ki");
  const cCemas = cue(7, "cemas");
  const cPlan = cue(7, "merencanakan");
  const sly = f >= cPlan;
  const x = tween(f, cKi, cKi + 40, 1900, 960, easeOut);
  return (
    <>
      <Backdrop theme="dusk" sun={{x: 960, y: tween(f, 0, d, 430, 580)}} />
      <Mtn theme="dusk" x={520} h={tween(f, 0, cue(7, "seimbang"), 250, 300)} seed="m7L" />
      <Mtn theme="dusk" x={1400} h={tween(f, 0, cue(7, "seimbang"), 250, 300)} seed="m7R" />
      <Foreground theme="dusk" />
      <Layer depth={18} seed="kisinu7" amp={1.5}>
        <Svg>
          <Person x={x} y={FOOT + 40} s={1.9} {...KISINU} mood={sly ? "sly" : f >= cCemas ? "worried" : "neutral"} arms={sly ? "down" : f >= cCemas ? "point" : "down"} lean={sly ? 3 : -2} seed="k7" />
        </Svg>
      </Layer>
    </>
  );
};

/* 8 — Malam: kain dibentangkan sepanjang "membentangkan kain ... di puncak gunung" */
const S8: React.FC = () => {
  const f = useHeld();
  const c0 = cue(8, "membentangkan");
  const c1 = cue(8, "membuat");
  const cWarga = cue(8, "warganya");
  const grow = tween(f, c0, c1, 0, 230, easeInOut);
  const flutter = f >= c0 ? (flick("flut", f) - 0.5) * 16 : 0;
  const px = 1330;
  const top = 680 - 300;
  const show = f >= c0;
  return (
    <>
      <Backdrop theme="night" moon={{x: 400, y: 220}} stars />
      <Mtn theme="night" x={520} h={300} seed="m8L" />
      <Mtn theme="night" x={px} h={300} seed="m8R" />
      {show && (
        <Layer depth={12} seed="cloth8" amp={2.5}>
          <Svg>
            <polygon
              points={`${px - 70},${top + 62} ${px - 40 + flutter},${top - grow * 0.8} ${px + flutter},${top - grow} ${px + 44 + flutter},${top - grow * 0.8} ${px + 70},${top + 62} ${px + 30},${top + 40} ${px - 30},${top + 44}`}
              fill={C.cloth}
              {...EDGE}
            />
            <polygon points={`${px},${top - grow} ${px + 44 + flutter},${top - grow * 0.8} ${px + 70},${top + 62} ${px + 20},${top + 30}`} fill={C.clothLight} opacity={0.8} />
          </Svg>
        </Layer>
      )}
      <Foreground theme="night" />
      <Layer depth={14} seed="work8" amp={1.5}>
        <Svg>
          {f >= cWarga && <Crowd n={4} x0={1050} x1={1650} y={FOOT} s={0.9} clothes={["#8a3b2f", "#3a2a30"]} arms="up" mood="sly" seed="R8" sil />}
          <Person x={tween(f, 0, 40, 380, 560)} y={FOOT} {...KISINU} mood="sly" arms={f >= cue(8, "memerintahkan") ? "point" : "down"} s={1.3} seed="k8" />
        </Svg>
      </Layer>
    </>
  );
};

/* 9 — Gunung Sinujuh melesat tinggi saat "mendadak sangat tinggi", Datuk Siba tertunduk saat "putus asa" */
const S9: React.FC = () => {
  const f = useHeld();
  const cUp = cue(9, "mendadak");
  const cSad = cue(9, "putus");
  const hR = tween(f, cUp, cUp + 40, 300, 480, easeOut);
  const lean = tween(f, cSad, cSad + 60, 0, 9);
  return (
    <>
      <Backdrop theme="dusk" sun={{x: 300, y: 560}} />
      <Mtn theme="dusk" x={420} h={290} seed="m9L" />
      <Mtn theme="dusk" x={1400} h={hR} seed="m9R" />
      <Layer depth={10} seed="cloth9" amp={1.5}>
        <Svg>
          <polygon points={`1330,${680 - hR + 50} 1400,${680 - hR} 1470,${680 - hR + 50} 1425,${680 - hR + 82} 1375,${680 - hR + 82}`} fill={C.cloth} {...EDGE} />
        </Svg>
      </Layer>
      <Foreground theme="dusk" />
      <Layer depth={16} seed="datuk9" amp={1}>
        <Svg>
          <Person x={760} y={FOOT + 10} {...DATUK} mood={f >= cUp ? "sad" : "worried"} arms="down" lean={lean} bob={tween(f, cSad, cSad + 60, 0, 8)} s={1.4} seed="d9" />
        </Svg>
      </Layer>
    </>
  );
};

/* 10 — Gunung ditenggelamkan: mendorong dan tenggelam mulai "menenggelamkan", percikan di ujungnya */
const S10: React.FC = () => {
  const f = useHeld();
  const c0 = cue(10, "menenggelamkan");
  const sinkDur = 52;
  const sink = tween(f, c0, c0 + sinkDur, 0, 420, easeIn);
  const cSplash = c0 + Math.round(sinkDur * 0.75);
  const splashT = tween(f, cSplash, cSplash + 36, 0, 1);
  const showSplash = f >= cSplash && splashT < 1;
  const pushing = f >= c0 && f < c0 + sinkDur + 10;
  return (
    <>
      <Backdrop theme="dusk" sun={{x: 1000, y: 600}} clouds />
      <Mtn theme="dusk" x={640} h={330} seed="m10L" dy={sink} />
      <Mtn theme="dusk" x={1450} h={480} seed="m10R" />
      <Foreground theme="dusk" />
      {showSplash && (
        <Layer depth={8} seed="splash10" amp={1}>
          <Svg>
            <Splash x={640} y={670} t={splashT} />
          </Svg>
        </Layer>
      )}
      <Layer depth={16} seed="datuk10" amp={1.2}>
        <Svg>
          <Person x={tween(f, c0 - 20, c0 + 10, 250, 330)} y={FOOT} {...DATUK} mood="sad" arms={pushing ? "push" : "down"} lean={pushing ? 7 : tween(f, 0, c0, 0, 4)} s={1.4} seed="d10" />
        </Svg>
      </Layer>
    </>
  );
};

/* 11 — Terbongkar: angin sejak awal, kain robek saat "trik", murka lalu mengutuk */
const S11: React.FC = () => {
  const f = useHeld();
  const cTear = cue(11, "trik");
  const cAngry = cue(11, "murka");
  const cCurse = cue(11, "mengutuk");
  const flashOn =
    (f >= cTear && f < cTear + 14 && flick("fl", f) > 0.4) ||
    (f >= cAngry && f < cAngry + 12 && flick("fl2", f) > 0.5) ||
    (f >= cCurse && f < cCurse + 14 && flick("fl3", f) > 0.5);
  const t = tween(f, cTear, cTear + 96, 0, 1, easeOut);
  const px = 1400;
  return (
    <>
      <Backdrop theme="storm" clouds />
      <Mtn theme="storm" x={px} h={470} seed="m11" />
      <Layer depth={10} seed="cloth11" amp={f < cTear ? 1.5 + tween(f, 0, cTear, 0, 3) : 2.5}>
        <Svg>
          {f < cTear ? (
            <polygon points={`${px - 80},300 ${px},210 ${px + 80},300 ${px + 40},330 ${px - 40},334`} fill={C.cloth} {...EDGE} />
          ) : (
            [0, 1, 2, 3, 4, 5].map((i) => {
              const ox = px - 60 + i * 24;
              const dx = (60 + random(`pc-${i}`) * 260) * t;
              const dy = (-80 - random(`pcy-${i}`) * 200) * t + 380 * t * t;
              return (
                <polygon
                  key={i}
                  points="0,0 38,-14 52,18 14,34"
                  transform={`translate(${ox + dx},${300 + dy}) rotate(${i * 70 + t * 540})`}
                  fill={C.cloth}
                  opacity={1 - t * 0.6}
                  {...EDGE}
                />
              );
            })
          )}
        </Svg>
      </Layer>
      <Foreground theme="storm" />
      <Layer depth={4} seed="rain" amp={0}>
        <Svg>
          {Array.from({length: 46}).map((_, i) => {
            const x = random(`rx-${i}-${Math.floor(f / STEP)}`) * (W + 200);
            const y = random(`ry-${i}-${Math.floor(f / STEP)}`) * H;
            return <line key={i} x1={x} y1={y} x2={x - 30} y2={y + 90} stroke="rgba(220,230,245,0.55)" strokeWidth={3} />;
          })}
        </Svg>
      </Layer>
      <Layer depth={16} seed="datuk11" amp={1.5}>
        <Svg>
          <Person
            x={650}
            y={FOOT}
            {...DATUK}
            mood={f >= cTear ? "angry" : "worried"}
            arms={f >= cCurse ? "up" : f >= cAngry ? "point" : "down"}
            lean={f >= cCurse ? -5 : 0}
            s={1.5}
            seed="d11"
          />
        </Svg>
      </Layer>
      {flashOn && <div style={{position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)"}} />}
    </>
  );
};

/* 12 — Gunung Senujuh menjulang pelan selama narasi, matahari bersinar saat "Gunung Senujuh" disebut */
const S12: React.FC = () => {
  const f = useHeld(SLOW_STEP);
  const cEnd = cue(12, "dikenal");
  const h = tween(f, 0, cEnd, 200, 400, easeInOut);
  return (
    <>
      <Backdrop theme="gold" sun={{x: 960, y: tween(f, 0, cEnd, 420, 320)}} clouds birds />
      <Layer depth={8} seed="trees12" amp={1} step={SLOW_STEP}>
        <Svg>
          {[200, 420, 1500, 1720].map((x, i) => (
            <Tree key={x} x={x} y={700} s={1 + (i % 2) * 0.2} color="#4a8a35" kind={i % 2 ? "round" : "palm"} />
          ))}
          <Hut x={1260} y={680} s={0.6} />
        </Svg>
      </Layer>
      <Mtn theme="gold" x={960} h={h} seed="m12" />
      <Foreground theme="gold" />
    </>
  );
};

/* 13 — Buku terbuka selama kalimat pertama, menutup pelan mulai "tak akan pernah" hingga "sejati" */
const S13: React.FC = () => {
  const f = useHeld();
  const d = useDur();
  const c0 = cue(13, "pernah");
  const c1 = cue(13, "sejati", 0, "end");
  const close = tween(f, c0, c1, 1, -1, easeInOut);
  const shift = tween(f, c0, c1, 0, 180, easeInOut);
  const fade = tween(f, d - 18, d, 0, 1);
  const top = 400;
  const bot = 745;
  return (
    <>
      <Backdrop theme="dusk" sun={{x: 960, y: tween(f, 0, d, 600, 700)}} clouds />
      <Foreground theme="dusk" />
      <Layer depth={20} seed="book" amp={1}>
        <Svg>
          <g transform={`translate(${shift},0)`}>
            <rect x={585} y={top - 12} width={750} height={bot - top + 24} rx={10} fill="#6a3e22" {...EDGE} />
            <rect x={600} y={top} width={360} height={bot - top} fill="#f4e7c8" />
            <polygon points="660,640 740,520 800,610 850,560 920,640" fill="#8fa04a" />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={640} y={670 + i * 20} width={280 - i * 30} height={6} fill="#b8a888" />
            ))}
            <g transform={`translate(960,0) scale(${close},1)`}>
              {close > 0 ? (
                <>
                  <rect x={0} y={top} width={360} height={bot - top} fill="#f8ecd0" />
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <rect key={i} x={40} y={440 + i * 36} width={280 - (i % 3) * 40} height={7} fill="#b8a888" />
                  ))}
                </>
              ) : (
                <>
                  <rect x={0} y={top - 8} width={366} height={bot - top + 16} rx={8} fill="#8a4a2a" {...EDGE} />
                  <polygon points="130,640 190,520 250,640" fill={C.gold} />
                  <rect x={60} y={670} width={240} height={8} fill={C.gold} />
                </>
              )}
            </g>
          </g>
        </Svg>
      </Layer>
      <div style={{position: "absolute", inset: 0, background: "#0b0705", opacity: fade}} />
    </>
  );
};

export const SCENES: Record<number, React.FC> = {
  1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13,
};
