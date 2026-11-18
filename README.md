# Mesa do Mestre

<!-- LINKS:INICIO (gerado por scripts/build.py; não edite à mão) -->
**▶ [Abrir a Mesa do Mestre](https://itslozhy.github.io/atlas-rpg-maps/)** · versão pública no GitHub Pages; tudo fica salvo no seu navegador.

**[Versão com mesa ao vivo e fichas compartilhadas](https://claude.ai/artifact/1wUYbQ513Syib6KfoBeN8k)** · no claude.ai, só para quem o mestre convidar.

<sub>Última atualização: 17/11/2026 às 22:37 (horário de Brasília). O GitHub Pages publica a versão nova poucos minutos depois de cada envio.</sub>
<!-- LINKS:FIM -->

Mapas e fichas de RPG de mesa numa página só. O botão **Mapa | Fichas** no topo troca de seção sem sair da página, e as duas partes conversam entre si.

## Atlas do Mestre (mapas)

- **Escalas:** mundo, continente, reino, cidade e interior/masmorra, em visão 3/4 ou vista de cima.
- **Ferramentas:** pincel de terreno, ruas e rios interligados, ícones, peças urbanas, cercas e muralhas contínuas, tokens, régua, névoa de guerra, texto.
- **Geradores:** continente, arquipélago, mundo, cidade, caverna e masmorra.
- **Estéticas:** pergaminho, colorido, gravura vitoriana, steampunk, planta técnica e preto e branco.
- **Relevo em 3/4:** montanhas (pico, nevada, rochosa, dois picos, cordilheira, arborizada, vulcões, cristal), dunas, cachoeiras e relevos (colinas, platô, escarpa, cânion, arco, agulha, rochedos, cratera, caverna), nas ferramentas Urbano e Ícone.
- **Ruas em 3/4:** calçada, meio-fio e calçamento rebaixado com pedras em perspectiva; ruas de terra com sulcos.
- **Mesa:** notas por local, mapas vinculados, luz e sombra, hora do dia, clima e transmissão ao vivo para jogadores.

## Grimório do Mestre (fichas)

- **Sistemas:** D&D 5e (tema pergaminho), Ordem Paranormal (tema dossiê) e Etmos (caderno lavanda).
- **Etmos no combate:** o jogador vê os símbolos das partículas que conhece, separados em funções, objetos, características e complementos, escolhe a ordem e confirma; a página mostra a palavra montada e os símbolos em sequência.
- **Acesso:** cada jogador edita só as próprias fichas; o mestre vê e edita todas, e tem NPCs e notas que só ele lê.
- **Cálculos automáticos:** modificadores, perícias, salvaguardas, CD e ataque de magia (D&D); PV, PE e SAN por classe e NEX, defesa e carga (Ordem Paranormal).
- **Dados:** clique em atributos, perícias e ataques para rolar; vantagem e desvantagem no D&D; regra de dados por atributo na Ordem.
- **Ligação com o mapa:** um token pode ser ligado a uma ficha. A vida do token segue a ficha, o dano aplicado no mapa muda a ficha, e “Mostrar no mapa” leva ao token.
- **Mesa ao vivo:** em “Mesa dos jogadores”, o mestre escolhe a campanha. Os jogadores dela veem o mapa ao vivo ao clicar em **Mapa** e abrem a própria ficha clicando no token.
- **Convites de uso único:** cada link cria uma ficha (de jogador ou de NPC); o jogador só enxerga as fichas dele.
- **Aprovação e registro:** mudanças importantes do jogador esperam a aprovação do mestre; as outras vão para um registro que o mestre lê e pode desfazer item por item.
- **Diário de sessão:** notas do mestre por sessão, com as rolagens e as alterações das fichas do dia, e um resumo que pode ir para os jogadores.
- **Documentos:** cartas, pistas e imagens para um jogador ou para a mesa toda.
- **Bestiário e gerador de NPC:** NPCs guardados para reusar em qualquer campanha do mesmo sistema, e um gerador com nome, personalidade, aparência, motivação, segredo e atributos.
- **Partículas da mesa (Etmos):** o mestre cria partículas novas, desenhando o símbolo na própria página.
- **Visão dos tokens (mapa):** cada token pode ter um alcance de visão que abre a névoa ao redor dele.

## Fora do claude.ai: Firebase

No GitHub Pages, a página usa o Firebase (projeto `atlas-rpg-6910f`) para guardar campanhas, fichas e mapas e para transmitir a mesa ao vivo. Cada pessoa entra com a conta Google. No claude.ai, continua usando o banco de lá. A troca é feita por `nuvem-firebase.js`, que só se ativa no endereço do GitHub Pages.

Configuração no console do Firebase (uma vez):

1. **Firestore Database:** criar o banco em modo de produção (local sugerido: `southamerica-east1`, São Paulo).
2. **Firestore › Regras:** colar o conteúdo de `firestore.rules` e publicar.
3. **Authentication › Método de login:** ativar o Google.
4. **Authentication › Configurações › Domínios autorizados:** adicionar `itslozhy.github.io`.

No primeiro acesso, cada pessoa escolhe um nome de usuário (único no site, de 3 a 20 caracteres: a-z, 0-9, ponto e _) e um nome de exibição; dá para mudar depois clicando no nome, no canto da tela. As regras garantem no servidor que o nome de usuário não se repete, que só o dono mexe no próprio perfil e que os campos têm formato e tamanho fixos.

Cada conta é mestre do próprio espaço: suas campanhas, NPCs, diário, bestiário, convites e mesas ficam em `mestres/<conta>/` e nenhum outro mestre os vê. Os jogadores entram pelos convites gerados na aba Convites da campanha: quem usa um convite vira membro só do espaço daquele mestre, enxerga as próprias fichas e a mesa ao vivo. Quem joga com mais de um mestre troca de mesa pelo seletor no canto da tela.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `atlas-do-mestre.html` | Código-fonte do mapa. |
| `grimorio-do-mestre.html` | Código-fonte das fichas (estilo isolado num shadow root) e a ponte entre as duas seções. |
| `mesa-do-mestre.html` | Página montada, publicada como artefato no claude.ai. |
| `index.html` | A mesma página completa, para abrir direto no navegador. |
| `nuvem-firebase.js` | Conexão com o Firebase (banco, login e mesa ao vivo) fora do claude.ai. |
| `firestore.rules` | Regras de acesso do Firestore, para colar no console do Firebase. |
| `scripts/build.py` | Monta `mesa-do-mestre.html` e `index.html` a partir dos dois arquivos-fonte. |
| `scripts/etmos_simbolos.py` | Baixa o PDF de partículas do Etmos e vetoriza os símbolos em `etmos-simbolos.json`. |
| `etmos-simbolos.json` | Os símbolos vetorizados, embutidos na página pelo build. |

Os símbolos das partículas do Etmos são arte do [Balde Galáctico](https://baldegalactico.com.br), vetorizados do PDF oficial de partículas por `scripts/etmos_simbolos.py` e guardados em `etmos-simbolos.json`. Todos os direitos sobre eles são do Balde Galáctico.

## Como usar

Abra o link do GitHub Pages (no topo deste arquivo). Com o Firebase configurado, mestre e jogadores entram com a conta Google e tudo sincroniza; quem escolher "Usar sem conta" fica com os dados só no próprio navegador. Abrindo `index.html` direto do computador, a página funciona só no modo local.

Depois de editar um arquivo-fonte:

```bash
python3 scripts/build.py
```
