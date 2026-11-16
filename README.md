# Atlas do Mestre

Editor de mapas 2D para RPG de mesa, em um único arquivo HTML, sem dependências de build.

- **Escalas:** mundo, continente, reino, cidade e interior/masmorra.
- **Ferramentas:** pincel de terreno, traçados (rios, estradas, ruas), ícones regionais, peças urbanas (vista de cima e em 3/4), cercas e muralhas contínuas, tokens, régua, névoa de guerra, texto.
- **Geradores:** continente, arquipélago, mundo, cidade, caverna e masmorra.
- **Estéticas:** pergaminho, colorido, gravura vitoriana, steampunk, planta técnica e preto e branco.
- **Mesa:** notas por local, mapas vinculados, luz e sombra, hora do dia, clima e transmissão ao vivo para jogadores (quando publicado como artefato no claude.ai).

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `atlas-do-mestre.html` | Código-fonte. É o corpo da página publicado como artefato no claude.ai. |
| `index.html` | Página completa gerada a partir do arquivo acima, para abrir direto no navegador ou hospedar (GitHub Pages, por exemplo). |
| `scripts/build.py` | Regenera `index.html`. |

## Como usar

Abra `index.html` no navegador. Fora do claude.ai, os mapas ficam salvos só no navegador (armazenamento local); a conta na nuvem, o download direto de arquivos e a Mesa dos jogadores dependem do ambiente de artefatos do claude.ai.

Depois de editar `atlas-do-mestre.html`:

```bash
python3 scripts/build.py
```
