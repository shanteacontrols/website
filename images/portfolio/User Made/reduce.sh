#!/bin/bash

find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) -print0 |
while IFS= read -r -d '' f; do
  out="${f%.*}.webp"
  cwebp -q 80 -m 6 -af -metadata all "$f" -o "$out"
done
