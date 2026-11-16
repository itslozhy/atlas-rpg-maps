#!/usr/bin/env python3
"""Gera index.html (página completa) a partir de atlas-do-mestre.html (corpo usado no artefato do claude.ai)."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "atlas-do-mestre.html").read_text(encoding="utf-8")
head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>html{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>\n')
(root / "index.html").write_text(head + body + "\n</body></html>\n", encoding="utf-8")
print("index.html gerado")
