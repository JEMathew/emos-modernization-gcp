#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/path/to/ffmpeg" >&2
  exit 2
fi

ffmpeg_bin=$1
script_dir=$(cd "$(dirname "$0")" && pwd)
repo_dir=$(cd "$script_dir/../.." && pwd)
source_video="$repo_dir/docs/demo/EMOS-Beta-Introduction.mp4"
subtitle_file="$repo_dir/docs/demo/EMOS-Beta-Introduction.srt"
headline_file="$script_dir/intro-headline.txt"
subhead_file="$script_dir/intro-subhead.txt"
voice_file="${TMPDIR:-/tmp}/emos-intro-opening.aiff"
rendered_video="${TMPDIR:-/tmp}/EMOS-Beta-Introduction-aligned.mp4"
font_serif="/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
font_sans="/System/Library/Fonts/Supplemental/Arial.ttf"

if [[ ! -x "$ffmpeg_bin" ]]; then
  echo "FFmpeg is not executable: $ffmpeg_bin" >&2
  exit 2
fi

/usr/bin/say -v Samantha -r 165 -o "$voice_file" \
  "EMOS is a vendor-neutral operating system designed to govern the entire enterprise modernization journey. Beta version one delivers the evidence, decision, and planning foundation today."

"$ffmpeg_bin" -y \
  -i "$source_video" \
  -i "$voice_file" \
  -f lavfi -i "color=c=0x080808:s=1280x840:r=24:d=12.758" \
  -i "$subtitle_file" \
  -filter_complex "
    [2:v]
      drawgrid=width=48:height=48:thickness=1:color=white@0.035,
      drawtext=fontfile='$font_sans':text='BETA v1.0  ·  FULL-LIFECYCLE PRODUCT VISION':fontcolor=0xCBA46A:fontsize=20:x=80:y=120,
      drawtext=fontfile='$font_serif':textfile='$headline_file':fontcolor=white:fontsize=58:line_spacing=12:x=80:y=188,
      drawtext=fontfile='$font_sans':textfile='$subhead_file':fontcolor=0xC9C9C9:fontsize=24:line_spacing=10:x=82:y=430,
      drawbox=x=80:y=560:w=180:h=3:color=0xCBA46A:t=fill,
      format=yuv420p,
      setpts=PTS-STARTPTS[card];
    [0:v]trim=start=12.758,setpts=PTS-STARTPTS,scale=1280:840,format=yuv420p[vrest];
    [card][vrest]concat=n=2:v=1:a=0[vout];
    [1:a]adelay=550,apad,atrim=duration=12.758,aresample=48000,asetpts=PTS-STARTPTS[aintro];
    [0:a]atrim=start=12.758,asetpts=PTS-STARTPTS[arest];
    [aintro][arest]concat=n=2:v=0:a=1[aout]
  " \
  -map "[vout]" \
  -map "[aout]" \
  -map 3:0 \
  -map_metadata -1 \
  -metadata title="EMOS Beta Introduction" \
  -metadata comment="Full-lifecycle product vision with an explicit Beta v1.0 capability boundary." \
  -c:v libx264 -preset medium -crf 20 -profile:v high -level 4.0 \
  -c:a aac -b:a 160k \
  -c:s mov_text -metadata:s:s:0 language=eng -disposition:s:0 default \
  -movflags +faststart \
  "$rendered_video"

mv "$rendered_video" "$source_video"
