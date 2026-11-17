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

# símbolos do Etmos (arte do Balde Galáctico, gerados por scripts/etmos_simbolos.py):
# vão como dado, um por linha, para nenhuma linha da página ficar gigante
import json, datetime
glifos = ""
gpath = root / "etmos-simbolos.json"
if gpath.exists():
    dados = json.loads(gpath.read_text(encoding="utf-8"))
    linhas = ",\n".join(json.dumps(k) + ":" + json.dumps(v) for k, v in dados.items())
    glifos = '<script type="application/json" id="etmosGlifos">{\n' + linhas + '\n}</script>\n'
else:
    print("aviso: etmos-simbolos.json não encontrado; rode scripts/etmos_simbolos.py")

head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>\n')
body = montar(glifos)
(root / "mesa-do-mestre.html").write_text(body, encoding="utf-8")
(root / "index.html").write_text(head + body + "\n</body></html>\n", encoding="utf-8")
for velho in ("fichas.html", "mesa-com-simbolos.html"):
    if (root / velho).exists():
        (root / velho).unlink()
print("mesa-do-mestre.html e index.html gerados")

# links no topo do README, com a data desta montagem
PAGES = "https://itslozhy.github.io/atlas-rpg-maps/"
CLAUDE = "https://claude.ai/artifact/1wUYbQ513Syib6KfoBeN8k"
quando = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime("%d/%m/%Y às %H:%M")
bloco = (f"<!-- LINKS:INICIO (gerado por scripts/build.py; não edite à mão) -->\n"
         f"**▶ [Abrir a Mesa do Mestre]({PAGES})** · versão pública no GitHub Pages; tudo fica salvo no seu navegador.\n\n"
         f"**[Versão com mesa ao vivo e fichas compartilhadas]({CLAUDE})** · no claude.ai, só para quem o mestre convidar.\n\n"
         f"<sub>Última atualização: {quando} (horário de Brasília). O GitHub Pages publica a versão nova poucos minutos depois de cada envio.</sub>\n"
         f"<!-- LINKS:FIM -->")
rp = root / "README.md"
txt = rp.read_text(encoding="utf-8")
if "<!-- LINKS:INICIO" in txt:
    import re
    txt = re.sub(r"<!-- LINKS:INICIO.*?<!-- LINKS:FIM -->", lambda m: bloco, txt, flags=re.S)
else:
    linhas = txt.split("\n", 1)
    txt = linhas[0] + "\n\n" + bloco + "\n" + (linhas[1] if len(linhas) > 1 else "")
rp.write_text(txt, encoding="utf-8")
print("README atualizado com os links")
