#!/usr/bin/env python3
"""Gera as páginas completas a partir dos arquivos-fonte usados nos artefatos do claude.ai.

atlas-do-mestre.html    -> index.html   (editor de mapas)
grimorio-do-mestre.html -> fichas.html  (fichas de personagem)
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>html{color-scheme:light}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>\n')
for src, out in [("atlas-do-mestre.html", "index.html"), ("grimorio-do-mestre.html", "fichas.html")]:
    body = (root / src).read_text(encoding="utf-8")
    (root / out).write_text(head + body + "\n</body></html>\n", encoding="utf-8")
    print(out, "gerado")
