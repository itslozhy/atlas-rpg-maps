# Mesa do Mestre

Mapas e fichas de RPG de mesa numa página só. O botão **Mapa | Fichas** no topo troca de seção sem sair da página, e as duas partes conversam entre si.

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
- **Ligação com o mapa:** um token pode ser ligado a uma ficha. A vida do token segue a ficha, o dano aplicado no mapa muda a ficha, e “Mostrar no mapa” leva ao token.
- **Mesa ao vivo:** em “Mesa dos jogadores”, o mestre escolhe a campanha. Os jogadores dela veem o mapa ao vivo ao clicar em **Mapa** e abrem a própria ficha clicando no token.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `atlas-do-mestre.html` | Código-fonte do mapa. |
| `grimorio-do-mestre.html` | Código-fonte das fichas (estilo isolado num shadow root) e a ponte entre as duas seções. |
| `mesa-do-mestre.html` | Página montada, publicada como artefato no claude.ai. |
| `index.html` | A mesma página completa, para abrir direto no navegador. |
| `scripts/build.py` | Monta `mesa-do-mestre.html` e `index.html` a partir dos dois arquivos-fonte. |

## Como usar

Abra `index.html` no navegador. Fora do claude.ai, os dados ficam salvos só no navegador; a sincronização entre mestre e jogadores, a conta na nuvem e a transmissão da mesa dependem do ambiente de artefatos do claude.ai.

Depois de editar um arquivo-fonte:

```bash
python3 scripts/build.py
```
