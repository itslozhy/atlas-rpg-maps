# Atlas do Mestre e Grimório do Mestre

Duas ferramentas para mestres de RPG de mesa, cada uma num único arquivo HTML, sem etapa de build.

## Atlas do Mestre (mapas)

- **Escalas:** mundo, continente, reino, cidade e interior/masmorra, em visão 3/4 ou vista de cima.
- **Ferramentas:** pincel de terreno, ruas e rios interligados, ícones, peças urbanas, cercas e muralhas contínuas, tokens, régua, névoa de guerra, texto.
- **Geradores:** continente, arquipélago, mundo, cidade, caverna e masmorra.
- **Estéticas:** pergaminho, colorido, gravura vitoriana, steampunk, planta técnica e preto e branco.
- **Mesa:** notas por local, mapas vinculados, luz e sombra, hora do dia, clima e transmissão ao vivo para jogadores.

## Grimório do Mestre (fichas)

- **Sistemas:** D&D 5e (tema pergaminho) e Ordem Paranormal (tema dossiê).
- **Acesso:** cada jogador edita só as próprias fichas; o mestre vê e edita todas, e tem NPCs e notas que só ele lê.
- **Cálculos automáticos:** modificadores, perícias, salvaguardas, CD e ataque de magia (D&D); PV, PE e SAN por classe e NEX, defesa e carga (Ordem Paranormal).
- **Dados:** clique em atributos, perícias e ataques para rolar; vantagem e desvantagem no D&D; regra de dados por atributo na Ordem.
- Cada ficha tem um link que pode ser colado no token correspondente do Atlas.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `atlas-do-mestre.html` | Código-fonte do Atlas (corpo da página publicada como artefato no claude.ai). |
| `grimorio-do-mestre.html` | Código-fonte do Grimório. |
| `index.html` | Atlas como página completa, para abrir direto no navegador ou hospedar. |
| `fichas.html` | Grimório como página completa. |
| `scripts/build.py` | Regenera `index.html` e `fichas.html`. |

## Como usar

Abra `index.html` ou `fichas.html` no navegador. Fora do claude.ai, os dados ficam salvos só no navegador; a sincronização entre mestre e jogadores, a conta na nuvem e a transmissão da mesa dependem do ambiente de artefatos do claude.ai.

Depois de editar um arquivo-fonte:

```bash
python3 scripts/build.py
```
