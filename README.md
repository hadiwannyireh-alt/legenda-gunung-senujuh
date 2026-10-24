# Legenda Gunung Senujuh – Remotion (paper cut-out stop motion)

136 dtk · 3264 frame · 24 fps · 1920×1080. Semua visual dibuat prosedural (SVG), tanpa aset gambar.

## Menjalankan
```bash
npm install
npm run dev      # Remotion Studio, composition: Senujuh
npm run build    # render ke out/senujuh.mp4
```

## Struktur
- `src/data/storyboard.json` – sumber tunggal (timestamp, subtitles, dynamic_typography, sfx_commands)
- `src/Senujuh.tsx` – `<Sequence>` per shot + VO utama 0–136 dtk
- `src/lib/stopMotion.ts` – `STOP_FPS` (12; ubah ke 8 untuk lebih patah-patah), hold keyframe & getaran kertas
- `src/scenes/Scenes.tsx` – 13 scene (satu per shot)
- `src/components/` – kertas/drop-shadow, karakter, latar, Subtitle, KineticTitle, ShotSfx
- `public/audio/vo.mp3` – voice over; `public/sfx/*.wav` – **placeholder sintetis**

## Sinkronisasi dengan VO
Timestamp di `storyboard.json` hanyalah rencana kasar; VO aslinya lebih lambat (mis. narasi shot 3 baru mulai di 23,8 dtk, bukan 20 dtk).
Karena itu batas shot, subtitle, judul, SFX, dan aksi animasi di-cue dari waktu bicara yang diukur dari audio:
- `scripts/align-vo.py` mengukur jeda di `public/audio/vo.mp3` dan memetakan kata di field `subtitles` ke waktu -> `src/data/voTiming.json`
- `src/lib/vo.ts` menyediakan `cue(shotId, "kata")` (frame) yang dipakai scene, judul, dan SFX
- Jika VO atau teks `subtitles` diganti: `python3 scripts/align-vo.py` (butuh ffmpeg) lalu render ulang

## SFX
Ganti file di `public/sfx/` dengan hasil AI (nama file sama). Prompt ada di `sfx-prompts.md`.
Jika memakai mp3, ubah `SFX_EXT` di `src/components/ShotSfx.tsx`.
Mix: ambience 30%, SFX 40%, music 60%, VO 100% (dikalikan `volume` tiap perintah).
