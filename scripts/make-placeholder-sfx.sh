#!/usr/bin/env bash
# Membuat SFX PLACEHOLDER sintetis (ffmpeg) supaya proyek bisa dirender.
# Ganti file di public/sfx/ dengan hasil AI (nama file sama) memakai ai_prompt di sfx-prompts.md.
set -e
cd "$(dirname "$0")/../public/sfx"
g() { ffmpeg -y -loglevel error "$@"; }
g -f lavfi -i "anoisesrc=d=8:c=pink:a=0.5" -af "lowpass=f=1800,highpass=f=200,tremolo=f=0.3:d=0.4" soft_nature_ambient.wav
g -f lavfi -i "sine=f=294:d=8" -f lavfi -i "sine=f=440:d=8" -filter_complex "amix=inputs=2,tremolo=f=3:d=0.7,volume=0.5" traditional_sape_intro.wav
g -f lavfi -i "anoisesrc=d=6:c=white:a=0.4" -af "lowpass=f=900,tremolo=f=0.6:d=0.5" river_waves_soft.wav
for n in tense_drone_synth suspense_drone_synth; do
  g -f lavfi -i "sine=f=55:d=8" -f lavfi -i "sine=f=58:d=8" -filter_complex "amix=inputs=2,tremolo=f=0.5:d=0.6,volume=0.8" $n.wav
done
g -f lavfi -i "anoisesrc=d=2.5:c=white:a=0.6" -af "highpass=f=1500,tremolo=f=9:d=0.9,afade=t=out:st=1.8:d=0.7" spear_clash_shout.wav
g -f lavfi -i "anoisesrc=d=6:c=brown:a=0.6" -af "highpass=f=400,tremolo=f=11:d=0.8" fire_torch_crackle.wav
g -f lavfi -i "sine=f=170:d=4" -af "aecho=0.8:0.7:90:0.5,afade=t=out:st=0.4:d=3.6" gong_stop_battle.wav
g -f lavfi -i "anoisesrc=d=6:c=brown:a=0.7" -af "lowpass=f=700,tremolo=f=2:d=0.8" rock_scraping_heavy.wav
g -f lavfi -i "anoisesrc=d=4:c=pink:a=0.6" -af "highpass=f=300,lowpass=f=2500,tremolo=f=5:d=0.7,afade=t=out:st=2.5:d=1.5" fabric_flapping_wind.wav
g -f lavfi -i "sine=f=523:d=8" -af "vibrato=f=5:d=0.4,afade=t=in:d=1,afade=t=out:st=6:d=2" sad_flute_solo.wav
g -f lavfi -i "anoisesrc=d=3:c=pink:a=0.8" -af "lowpass=f=1200,afade=t=out:st=0.4:d=2.6" massive_water_splash.wav
g -f lavfi -i "anoisesrc=d=4:c=brown:a=0.8" -af "lowpass=f=300,afade=t=out:st=1:d=3" cloth_rip_thunder.wav
g -f lavfi -i "sine=f=131:d=8" -f lavfi -i "sine=f=165:d=8" -f lavfi -i "sine=f=196:d=8" -filter_complex "amix=inputs=3,afade=t=in:d=2,afade=t=out:st=5:d=3,volume=1.2" epic_orchestra_settle.wav
g -f lavfi -i "anoisesrc=d=2:c=pink:a=0.6" -af "highpass=f=800,afade=t=out:st=0.1:d=1.9" book_close_fade.wav
ls -1
