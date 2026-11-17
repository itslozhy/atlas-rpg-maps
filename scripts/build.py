#!/usr/bin/env python3
"""Monta a Mesa do Mestre (mapa + fichas numa página só) a partir dos dois arquivos-fonte.

atlas-do-mestre.html    editor de mapas (marcação + script principal)
grimorio-do-mestre.html fichas: <template> com estilo e marcação, a ponte entre as seções e o script das fichas

Saídas:
mesa-do-mestre.html  corpo da página publicada como artefato no claude.ai
index.html           a mesma página completa, para abrir direto no navegador
"""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
atlas = (root / "atlas-do-mestre.html").read_text(encoding="utf-8")
fichas = (root / "grimorio-do-mestre.html").read_text(encoding="utf-8")

# a ponte precisa existir antes do script do Atlas; as fichas rodam depois dele
cut = atlas.rindex("<script>")
end_ponte = fichas.index("</script>", fichas.index('<script id="ponte">')) + len("</script>")
def montar(glifos=""):
    return atlas[:cut] + fichas[:end_ponte] + "\n" + atlas[cut:] + "\n" + glifos + fichas[end_ponte:]

head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>\n')
# versões do repositório: sem os símbolos do Etmos (arte do Balde Galáctico)
body = montar()
(root / "mesa-do-mestre.html").write_text(body, encoding="utf-8")
(root / "index.html").write_text(head + body + "\n</body></html>\n", encoding="utf-8")
old = root / "fichas.html"
if old.exists():
    old.unlink()
print("mesa-do-mestre.html e index.html gerados")
# versão para publicar no claude.ai, com os símbolos (gerados por scripts/etmos_simbolos.py, fora do git)
gpath = root / "etmos-simbolos.json"
if gpath.exists():
    glifos = "<script>window.ETMOS_GLIFOS=" + gpath.read_text(encoding="utf-8").strip() + ";</script>\n"
    (root / "mesa-com-simbolos.html").write_text(montar(glifos), encoding="utf-8")
    print("mesa-com-simbolos.html gerado (fora do git)")
else:
    print("etmos-simbolos.json não encontrado: rode scripts/etmos_simbolos.py para ter os símbolos")
