#!/usr/bin/env python3
"""Menyelaraskan narasi (field `subtitles`) dengan audio VO.

Langkah: deteksi jeda dengan ffmpeg -> 12 jeda terpanjang yang cocok dengan batas shot
-> jeda lain dipakai sebagai batas frasa -> kata dipetakan ke waktu secara proporsional
terhadap jumlah suku kata. Hasil: src/data/voTiming.json
"""
import json, re, subprocess, sys, os
root = os.path.join(os.path.dirname(__file__), "..")
mp3 = os.path.join(root, "public/audio/vo.mp3")
sb = json.load(open(os.path.join(root, "src/data/storyboard.json")))["storyboard"]

out = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp3, "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
dur = float(re.search(r"Duration: (\d+):(\d+):([\d.]+)", out).expand(r"\1") ) if False else None
m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
total = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
pauses = list(zip(starts, ends[:len(starts)]))
pauses = [p for p in pauses if p[0] > 0.5 and p[1] < total - 0.05]

def syl(w):
    w = w.lower().replace("ng", "N").replace("ny", "Y")
    n = 0
    for g in re.findall(r"[aeiou]+", w):
        n += 1 if g in ("a", "e", "i", "o", "u", "ai", "au", "oi") else len(g)
    return max(n, 1)

# 12 batas shot = jeda panjang antar-shot (hasil pengukuran: tiap shot ~5,2 suku kata/dtk)
SHOT_BREAKS = [12.49, 23.18, 34.32, 42.32, 53.76, 63.72, 74.16, 85.57, 96.28, 105.91, 116.86, 127.01]
speech = []
_t = 0.0
for _s, _e in pauses:
    speech.append((_t, _s)); _t = _e
speech.append((_t, total))

def speech_before(x):
    return sum(max(0.0, min(b, x) - a) for a, b in speech)

bounds = [min(pauses, key=lambda p: abs(p[0] - x)) for x in SHOT_BREAKS]
bounds.sort()
res = []
for i, s in enumerate(sb):
    a = 0.0 if i == 0 else bounds[i - 1][1]
    b = total if i == len(sb) - 1 else bounds[i][0]
    seq_a = 0.0 if i == 0 else (bounds[i - 1][0] + bounds[i - 1][1]) / 2
    seq_b = total if i == len(sb) - 1 else (bounds[i][0] + bounds[i][1]) / 2
    inner = [p for p in pauses if p[0] > a + 0.3 and p[1] < b - 0.3 and p not in bounds]
    words = re.findall(r"\S+", s["subtitles"])
    wsyl = [syl(re.sub(r"[^A-Za-z\-]", "", w)) for w in words]
    wins = []
    t = a
    for p in inner:
        wins.append((t, p[0])); t = p[1]
    wins.append((t, b))
    sp_tot = sum(y - x for x, y in wins)
    rate = sum(wsyl) / sp_tot
    # posisi kata tempat tiap jeda dalam (snap ke batas kata, utamakan setelah tanda baca)
    cuts = []
    for p in inner:
        pos = speech_before(p[0]) - speech_before(a)
        target = pos * rate
        cs = 0; cand = []
        for k, ws in enumerate(wsyl):
            cs += ws
            punct = bool(re.search(r"[,.!?:;]$", words[k]))
            cand.append((abs(cs - target) - (3 if punct else 0), k + 1))
        cuts.append(min(cand)[1])
    cuts = sorted(set(cuts))
    idx = [0] + [c for c in cuts if 0 < c < len(words)] + [len(words)]
    chunks, wt = [], []
    for ci in range(len(idx) - 1):
        w0, w1 = idx[ci], idx[ci + 1]
        # waktu chunk = jendela bicara ke-ci (kira-kira); jika jumlah jendela berbeda, hitung proporsional
        cs_sum = sum(wsyl[:w0]); ce_sum = sum(wsyl[:w1])
        def tm(sy):
            acc = 0.0
            for (x, y) in wins:
                seg = (y - x) * rate
                if sy <= acc + seg + 1e-9:
                    return x + (sy - acc) / rate
                acc += seg
            return b
        t0, t1 = tm(cs_sum), tm(ce_sum)
        chunks.append({"text": " ".join(words[w0:w1]), "start": round(t0, 3), "end": round(t1, 3)})
        c = cs_sum
        for k in range(w0, w1):
            wt.append({"w": words[k], "start": round(tm(c), 3), "end": round(tm(c + wsyl[k]), 3)})
            c += wsyl[k]
    res.append({"shot_id": s["shot_id"], "seq_start": round(seq_a, 3), "seq_end": round(seq_b, 3),
                "speech_start": round(a, 3), "speech_end": round(b, 3), "chunks": chunks, "words": wt})
json.dump({"vo_duration": round(total, 3), "shots": res}, open(os.path.join(root, "src/data/voTiming.json"), "w"), ensure_ascii=False, indent=1)
for r in res:
    print(r["shot_id"], "seq %.2f-%.2f" % (r["seq_start"], r["seq_end"]), "speech %.2f-%.2f" % (r["speech_start"], r["speech_end"]))
    for c in r["chunks"]:
        print("   %.2f-%.2f %s" % (c["start"], c["end"], c["text"]))
