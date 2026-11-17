#!/usr/bin/env python3
"""Gera etmos-simbolos.json: os símbolos das partículas do Etmos vetorizados a partir do PDF oficial.

Os símbolos são arte do Balde Galáctico e não ficam no repositório. Rode este script para
baixá-los e vetorizá-los; o build.py embute o arquivo na página quando ele existir.

Requisitos: pdftoppm (poppler-utils), Pillow, numpy e potracer (pip install potracer).
"""
import json, pathlib, subprocess, tempfile, urllib.request
import numpy as np, potrace
from PIL import Image

URL = "https://baldegalactico.com.br/wp-content/uploads/2025/04/particulas-v3.pdf"
root = pathlib.Path(__file__).resolve().parent.parent
DPI = 250
K = DPI / 60  # posições abaixo foram medidas numa renderização a 60 dpi
COLS = [(5, 120), (125, 240), (244, 358), (363, 478)]
ROWS = [(5, 175), (180, 348), (352, 520), (527, 697)]
# ordem dos cartões nas páginas 1 a 5 (linha a linha)
ORDER = [
    "DUM QUAN AER IMPE KAR PHYS RAT TRIZ BHAS TEN IG VIB YM HIN ALUI MOK",
    "LUM MAG TUM SAG NECRO APU GUS ROC CAND KAN HEM MUL CYSG TUNI MUN AST",
    "TOX OCUL AG MUT SAN SIN SAR ITAM MOR MIN NO ADA AL AR IM IR",
    "EN ET AS EM IN EV UN ES AM AN IL OR IT ALA ANI ALI",
    "IRO EVA AYU IBO OMU ELI EPI EXA AZI IMU IVI UNA INA ANU ERA ORA",
]

def trace(mask):
    """Vetoriza a máscara e encaixa o desenho num quadrado 200×200, centralizado."""
    curves = potrace.Bitmap(~mask).trace(turdsize=25, alphamax=1.0, opticurve=True, opttolerance=0.3)
    pts = []
    for c in curves:
        pts.append(c.start_point)
        for seg in c:
            pts += [seg.c, seg.end_point] if seg.is_corner else [seg.end_point]
    xs = [p.x for p in pts]; ys = [p.y for p in pts]
    w = max(xs) - min(xs); h = max(ys) - min(ys); s = 172 / max(w, h)
    ox = (200 - w * s) / 2 - min(xs) * s; oy = (200 - h * s) / 2 - min(ys) * s
    f = lambda p: f"{round(p.x * s + ox)} {round(p.y * s + oy)}"
    d = ""
    for c in curves:
        d += "M" + f(c.start_point)
        for seg in c:
            d += ("L" + f(seg.c) + "L" + f(seg.end_point)) if seg.is_corner else ("C" + f(seg.c1) + " " + f(seg.c2) + " " + f(seg.end_point))
        d += "Z"
    return d

def main():
    out = {}
    with tempfile.TemporaryDirectory() as tmp:
        pdf = pathlib.Path(tmp) / "particulas.pdf"
        urllib.request.urlretrieve(URL, pdf)
        subprocess.run(["pdftoppm", "-r", str(DPI), "-f", "1", "-l", "5", "-png", str(pdf), str(pathlib.Path(tmp) / "p")], check=True)
        pages = sorted(pathlib.Path(tmp).glob("p-*.png"))
        for page, row in zip(pages, ORDER):
            im = Image.open(page).convert("L")
            for i, name in enumerate(row.split()):
                r, c = divmod(i, 4); x0, x1 = COLS[c]; y0, _ = ROWS[r]
                a = np.asarray(im.crop((int(x0 * K) + 6, int((y0 + 14) * K), int(x1 * K) - 6, int((y0 + 114) * K))))
                out[name] = trace(a < 130)
    (root / "etmos-simbolos.json").write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    print(len(out), "símbolos em etmos-simbolos.json")

if __name__ == "__main__":
    main()
