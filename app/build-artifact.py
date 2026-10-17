#!/usr/bin/env python3
"""Build the claude.ai artifact version of the app from index.html.

The artifact host supplies its own <html>/<head>/<body> skeleton, and the
PWA-only bits (manifest, icons, service worker) don't apply there, so this
strips them and writes dist/artifact.html. index.html stays the one source.
Run:  python3 build-artifact.py
"""
import pathlib, re

src = pathlib.Path(__file__).with_name('index.html').read_text(encoding='utf-8')
drop = [
    r'<!DOCTYPE html>\s*', r'<html[^>]*>\s*', r'</?head>\s*', r'<body>\s*', r'</body>\s*', r'</html>\s*',
    r'<meta charset="UTF-8">\s*', r'<meta name="viewport"[^>]*>\s*', r'<meta name="theme-color"[^>]*>\s*',
    r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\s*',
]
out = src
for pat in drop:
    out, n = re.subn(pat, '', out)
    assert n, f'build-artifact: pattern not found: {pat}'
dist = pathlib.Path(__file__).with_name('dist')
dist.mkdir(exist_ok=True)
(dist / 'artifact.html').write_text(out, encoding='utf-8')
print(f'wrote dist/artifact.html ({len(out)//1024} KB)')
