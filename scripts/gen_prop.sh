#!/usr/bin/env bash
# 生一張道具圖：bash gen_prop.sh <輸出目錄> <名字> "<東西的描述>" ["<這條片的顏色，英文>"]   （用本機 codex 的生圖，一次一張，花生圖額度）
# 風格是固定的：光滑的三維小道具、左上打光、淺灰平底（方便摳）。顏色跟著片子走：第 4 個引數寫這條片的強調色，
# 不寫就是英偉達那條的 "deep indigo blue and periwinkle purple with small polished silver-white accents"。
set -u
OUT="$1"; NAME="$2"; SUBJ="$3"; PAL="${4:-deep indigo blue and periwinkle purple with small polished silver-white accents}"; mkdir -p "$OUT"; cd "$OUT" || exit 1
CX="${CODEX_BIN:-$(command -v codex 2>/dev/null || ls -t "$HOME"/AppData/Local/OpenAI/Codex/bin/*/codex.exe 2>/dev/null | head -1)}"   # 找不到就設環境變數 CODEX_BIN
[ -n "$CX" ] || { echo "找不到 codex：裝好 Codex CLI，或設 CODEX_BIN 指向它"; exit 1; }
COMMON="Use your built-in image generation tool to create ONE image. Style: premium stylized 3D render of a single object, like a prop in a high-end motion graphics explainer video: smooth glossy materials, soft studio lighting from the top left, a subtle rim light, and only a faint soft shadow directly under the object. Color palette: $PAL; elegant, not cartoonish, no black outlines. Background must be perfectly flat uniform light gray #E9E9EE everywhere, no gradient, no floor line, no other props. No text, no letters, no numbers, no logos anywhere. The object is centered with generous margin and fully inside the frame. Size 1024x1024. Reply with just the path of the generated image."
timeout 900 "$CX" exec --skip-git-repo-check -s workspace-write --enable image_generation "$COMMON Subject: $SUBJ" < /dev/null > "log_$NAME.txt" 2>&1
"${PYTHON:-python}" -I - "$NAME" <<'PYEOF'
import re, sys, shutil
n = sys.argv[1]
t = open(f'log_{n}.txt', encoding='utf-8', errors='ignore').read()
m = re.findall(r'''([A-Za-z]:[\/][^\s"']*?generated_images[\/][^\s"']+?\.png|/[^\s"']*?generated_images/[^\s"']+?\.png)''', t)
if m:
    shutil.copy(m[-1], n + '.png'); print('ok', n)
else:
    print('FAIL', n, '| 日誌末尾:', t[-300:].replace('\n', ' '))
PYEOF
