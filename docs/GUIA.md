# Portfólio Aero — Guia de manutenção

Manual de uso e personalização do projeto (o [README](../README.md) apresenta o repositório). O que ainda falta de informação está em `docs/Pendencias_Futuras.docx` (fora do git).

Portfólio pessoal apresentado dentro de uma janela Aero (Windows 7 / Vista), sobre uma área de trabalho puramente cenográfica. A identidade visual vem do [`aero-ui-kit/`](../aero-ui-kit/LEIA-ME.md), que não é alterado: as fontes e imagens são lidas direto dele.

**Stack:** Vite + React + TypeScript (strict). Site estático, mais uma função serverless opcional para o Spotify (`api/spotify.ts`).

## Executar

Requer Node.js 20.19+ ou 22.12+ (exigência do Vite 8).

```bash
npm install
npm run dev           # desenvolvimento em http://localhost:5173
npm run build         # typecheck + build de produção em dist/
npm run preview       # serve o build localmente
npm run check         # lint + formatação + typecheck + build (rode antes de publicar)
npm run placeholders  # lista o conteúdo provisório que ainda falta trocar
npm run spotify:auth  # uma vez: gera o token do Spotify (veja "Spotify")
npm run images        # regenera as imagens otimizadas a partir de src/assets/originais/
npm run tech-icons    # baixa os ícones das tecnologias para src/assets/tech/
npm run i18n:check    # acusa texto de interface sem tradução (também roda no check)
npm run lint          # só ESLint
npm run format        # aplica o Prettier (format:check só verifica)
```

## Guia de personalização

Quase tudo é editado em um só arquivo: **[`src/data/portfolio.ts`](../src/data/portfolio.ts)**. O TypeScript aponta campos faltando ou com tipo errado (`npm run build`). Os tipos ficam em [`src/types/portfolio.ts`](../src/types/portfolio.ts).

**O site é bilíngue (português e inglês).** Todo texto corrido em `portfolio.ts` é escrito nas duas línguas: `{ pt: '…', en: '…' }`. Nomes próprios iguais nas duas línguas ("GitHub", "FoldAero") podem ser uma string simples. Veja a seção "Idiomas" abaixo.

### 1. Nome, título e apresentação

Em `profile`, troque `name`, `role` e `tagline`. O nome aparece no título da janela, no menu, no Início e no título da aba.

### 2. Logo e foto

- **Logo:** o original é `src/assets/originais/brands/AFL_logo.png`. `npm run images` gera `src/assets/brands/logo.png`, usado na barra de título, no menu e na barra de tarefas, e os favicons `public/favicon.png` e `public/apple-touch-icon.png`. Sem `logo` em `profile`, aparece a marca provisória com as iniciais.
- **Foto:** aparece no Início, numa moldura no estilo do avatar do MSN, com o status "Online" logo abaixo. A moldura é o SVG `src/assets/profile/msn-frame.svg`, calibrado pixel a pixel contra `src/assets/originais/referencias/exemplo_MSN.png`; o tamanho na tela vem de `--msn-photo` em `sections.css`. O original é `src/assets/originais/profile/foto.png` (nome em `PHOTO` no [`scripts/optimize-images.py`](../scripts/optimize-images.py)); `npm run images` gera `src/assets/profile/foto.webp`. Com `PHOTO_CROP = None` a imagem vai inteira, centralizada num quadrado; para recortar uma parte, informe a caixa (esquerda, topo, direita, base). As fotos anteriores (`minha_foto.jpg`, `minha_foto_atual.jpg`) continuam na pasta. Sem `photo` em `profile`, o Início mostra o logo.

### 3. Projetos

Cada objeto em `projects` vira um card, sempre pelo mesmo modelo (`ProjectCard`). Para adicionar um projeto, copie um objeto e edite:

```ts
import thumbMeuApp from '../assets/projetos/meu-app.webp';
// ...
{
  id: 'meu-app',                      // único, sem espaços
  name: 'Meu App',
  category: 'pessoal',                // 'profissional' | 'academico' | 'pessoal'
  summary: 'Uma ou duas frases.',
  stack: ['React', 'TypeScript'],
  thumbnail: { src: thumbMeuApp, alt: 'Tela inicial do Meu App' }, // opcional
  status: 'concluido',                // opcional: planejado | em-andamento | concluido | pausado
  repositoryUrl: 'https://github.com/…', // opcional
  demoUrl: 'https://…',               // opcional
  details: 'Texto do diálogo Detalhes.', // opcional
},
```

- Os botões **Demonstração**, **Repositório** e **Detalhes** só aparecem quando o campo correspondente existe. Nunca há link falso.
- Sem `thumbnail`, o card mostra uma miniatura provisória na cor da categoria.
- `gallery` (opcional) lista capturas de qualquer formato, exibidas na janela **Detalhes**; cada uma abre em tamanho cheio numa nova aba.
- **Imagens dos projetos:** coloque os originais em `src/assets/originais/projetos/` e registre-os em `GALLERY` em [`scripts/optimize-images.py`](../scripts/optimize-images.py); `npm run images` gera as capturas (WebP, até 1200 px) e as miniaturas 16:9 dos cards em `src/assets/projetos/`. O Aquanauta usa uma composição das três capturas; o Flor Digital, um recorte da primeira.
- Categorias sem projetos somem da navegação e dos atalhos.
- **Logo do projeto** (`logo`): aparece ao lado do nome no card, no topo da janela Detalhes e, sem `thumbnail`, no centro da miniatura provisória. Coloque o original em `src/assets/originais/projetos/logos/<nome>.png`, inclua o nome em `PROJECT_LOGOS` no `optimize-images.py` e rode `npm run images`. Hoje o Flor Digital usa o logo provisório `projetos/logos/template.png`.

### 4. Sobre, Tecnologias e Contato

- **Sobre:** `about.paragraphs` (um parágrafo por item), `about.interests` e, opcionais, `about.education` (curso e momento da graduação), `about.highlights` (experiências e conquistas) e `about.languages`.
- **Tecnologias:** `skills` é uma lista de grupos `{ title, items }`. Crie, renomeie ou remova grupos à vontade.
  - **Ícones:** cada item ganha o logo da tecnologia, ligado pelo nome exato em [`src/data/techIcons.ts`](../src/data/techIcons.ts). Itens sem ícone mantêm o losango.
  - **Novo ícone:** acrescente uma linha em [`scripts/tech-icons.mjs`](../scripts/tech-icons.mjs), rode `npm run tech-icons` e ligue o nome em `techIcons.ts`. Os SVGs ficam em `src/assets/tech/`; o site não depende de nenhuma API externa.
  - **Fontes dos ícones:** [Devicon](https://devicon.dev) (MIT) e [Simple Icons](https://simpleicons.org) (CC0). As marcas pertencem aos seus donos. OpenAI, ChatGPT e Codex não estão em nenhuma das duas bibliotecas.
- **Contato:**
  - `contact.email` ativa o link de e-mail e o botão "Copiar e-mail"; `contact.secondaryEmail` mostra um segundo e-mail;
  - `contact.links` recebe `{ label, url }` (GitHub, LinkedIn, currículo…);
  - um link sem `url` não aparece.
  - Um currículo em PDF pode ficar em `public/curriculo.pdf`, com `url: './curriculo.pdf'`.

### 5. Textos fixos e metadados

- **Descrições das seções** (subtítulos e atalhos): `sections[].description`. Para um título diferente do nome na navegação, use `sections[].title` (ex.: a aba Spotify se chama "O que estou ouvindo").
- **Textos da interface** (botões, menus, avisos, rótulos de categoria e de estado): [`src/i18n/ui.ts`](../src/i18n/ui.ts), em português e inglês.
- **Descrição para buscadores e prévias de link:** `<meta name="description">` em [`index.html`](../index.html).

### 6. Som de fundo

- **Arquivo atual:** `src/assets/audio/som_fundo_novo.mp3` (3:25). O site toca só o trecho de **1:20 a 3:23** (`loop: [80, 203]`), em repetição sem fim e sem pausa entre as voltas. Os antigos `som-fundo.mp3` e `ambient-template.mp3` continuam na pasta, mas não entram no site (só arquivos importados em `portfolio.ts` são publicados).
- **Para trocar:**
  1. Coloque o seu arquivo (MP3 ou M4A) em `src/assets/audio/`.
  2. Troque o `import somFundo …` em `portfolio.ts`.
  3. Ajuste `sound.loop`: `[início, fim]` em segundos do trecho que se repete (1:20 = 80). O som já começa no início do trecho. Remova `loop` para repetir o arquivo inteiro.
- **Volume inicial:** `sound.defaultVolume` (0–100). O visitante ajusta no ícone de alto-falante da barra de tarefas, e a escolha fica salva no navegador.
- **Quando toca:** a música acompanha a janela do portfólio. Começa quando o visitante a abre (clique no ícone **Portfólio**, ou uma seção pelo menu Iniciar); antes disso ela nem é baixada. Continua tocando com a janela **minimizada** e **para** quando a janela é **fechada**. Ao reabrir, toca de novo desde o início do trecho. Quando a página vai para **segundo plano** (trocar de aba, minimizar o navegador ou fechar o navegador embutido do Instagram), todo o som do site pausa (a música e o vídeo de inicialização); ao voltar, continua de onde parou. Como abrir é uma interação do visitante, o navegador libera o som na hora. Se o visitante deixou o som mudo numa visita anterior, a música só carrega quando ele reativar o volume.
- **Acessibilidade:** o 2º Tab mostra **"Silenciar som de fundo"** (WCAG 1.4.2).

### Tela de ligar (inicialização)

- **O que o visitante vê:** ao abrir o site, o "computador desligado": uma paisagem animada (praia com peixes), levemente escurecida, e no centro um orbe de vidro azul com o símbolo de energia (o mesmo material do botão Iniciar) e um arco de luz girando em volta. Embaixo, "Clique para ligar" ("Toque para ligar" no celular) e, no rodapé, o logo e o nome do portfólio. O clique acende o orbe e toca o vídeo de inicialização; quando ele termina, a tela se dissolve e aparece a área de trabalho, com a barra de tarefas e o ícone **Portfólio** no centro. A janela do portfólio só abre quando o visitante clica nesse ícone (e é aí que a música começa).
- **Fundo:** `src/assets/video/intro_fundo.mp4` (loop de 2 s, sem som, 406 KB) e `intro_fundo.webp` (o quadro parado, que aparece enquanto o vídeo carrega e com "reduzir movimento" ligado). Os dois saem do GIF original, `src/assets/originais/video/intro_fundo.gif` (16,9 MB, pesado demais para o site). Para trocar o fundo, gere os dois arquivos a partir do novo GIF: `ffmpeg -i novo.gif -vf scale=1280:-2 -an -c:v libx264 -pix_fmt yuv420p -crf 25 -movflags +faststart intro_fundo.mp4` e `ffmpeg -i novo.gif -frames:v 1 -vf scale=1280:-2 intro_fundo.webp`.
- **Aparência:** tudo em `src/components/boot/boot.css`. O escurecimento do fundo é o `.boot__scene::after` (aumente ou diminua as opacidades); as cores do orbe saem de `--boot-cyan` e `--boot-blue`, e o tamanho de `--boot-orb`.
- **Vídeo:** `src/assets/video/win_boot.mp4` (7 s, com som, 1440×1080, 126 KB). É a versão para o site; o arquivo original (3840×2880) fica em `src/assets/originais/video/win_boot.mp4`. O som do vídeo respeita o volume e o "mudo" salvos do site.
  - **Para trocar o vídeo:** exporte em **1440×1080** (H.264 nível 4.0, com `faststart`), que toca em qualquer aparelho, e salve com o mesmo nome. Um vídeo maior que 4K (como o original, nível 6.0) não toca em muitos celulares. Com o ffmpeg: `ffmpeg -i original.mp4 -vf scale=1440:1080 -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 20 -c:a aac -movflags +faststart win_boot.mp4`.
  - O vídeo é exibido num quadro 4:3 centralizado; o CSS recorta as duas faixas cinza-escuras que o arquivo traz em cima e embaixo (`clip-path` em `boot.css`). Se trocar por um vídeo sem faixas ou de outra proporção, ajuste ali.
- **Ninguém fica preso:** o vídeo é curto (sem botão de pular); se o aparelho não conseguir tocá-lo (ou ele travar por 3,5 s), o site segue direto para a área de trabalho; e com "reduzir movimento" ligado no sistema, o vídeo nem toca.
- **Teclado e leitores de tela:** o botão de energia já vem com o foco (Enter liga). Enquanto o site está "desligado", o resto da página fica fora do Tab e dos leitores de tela. Quem ligou pelo teclado recebe o foco no ícone Portfólio ao terminar; com mouse ou toque, não (o foco desenharia um anel em volta do ícone).
- **Links diretos** (ex.: `…/#projetos`): passam pela tela de ligar do mesmo jeito; ao abrir o portfólio, ele já aparece na seção do link.
- **Código:** `src/components/boot/BootScreen.tsx` e `boot.css`; o estado fica no `App.tsx` (`booted`). Para desligar a tela de ligar, comece `booted` em `true`; para a janela já abrir sozinha, comece `windowState` em `'open'`.

### 7. Papel de parede e botão Iniciar

- **Imagens originais:** ficam em `src/assets/originais/`, separadas por tipo: `brands/` (logos AFL, Windows e Spotify), `desktop/` (ícones da área de trabalho), `profile/` (foto), `projetos/` (capturas), `tech/` (ícones de tecnologias enviados em imagem), `wallpaper/` e `referencias/` (modelos visuais, como o `exemplo_MSN.png` e o `calendario.png`). Elas não entram no site publicado. O site usa versões otimizadas, geradas por `npm run images` (requer Python + Pillow).
- **Para trocar uma imagem:** substitua o arquivo em `originais/` mantendo o nome e rode `npm run images`. A relação entre cada original e a versão que o site usa está no início de [`scripts/optimize-images.py`](../scripts/optimize-images.py).
- **Papel de parede:** o original é `src/assets/originais/wallpaper/wallpaper_xp.png` (o anterior, `Wallpaper_fundo.png`, continua na pasta). O site usa `src/assets/wallpaper/wallpaper-1920.webp` e `wallpaper-1280.webp`, para celular. No **tema escuro**, a área de trabalho usa o papel de parede noturno: original `originais/wallpaper/dark_wallpaper.jpg`, saída `wallpaper-dark-1920.webp` e `wallpaper-dark-1280.webp`. Ao trocar de tema, um se dissolve no outro, e cada um só é baixado quando o tema dele é usado. Para trocar, mude o nome do arquivo em `optimize-images.py` e rode `npm run images`.
- **Botão Iniciar:** o site usa `src/assets/brands/start-logo.png`.
- **Ícones da área de trabalho:** ficam em `desktopIcons`, em `portfolio.ts`, na ordem de cima para baixo. Hoje são Lixeira, Meu computador, Arquivos, MSN, Media Player, The Sims 2, CS 1.6, Minecraft, Bonzi e Clippy, todos com imagens próprias. Todos são clicáveis. Como no Windows, a lista desce em coluna e passa para a coluna seguinte quando a tela é baixa; a janela e o atalho **Portfólio** se afastam da largura que os ícones ocuparem. Cada ícone aceita:
  - `label`: o texto embaixo do ícone;
  - `kind`: um desenho pronto (`lixeira`, `computador`, `arquivos`, `vscode` ou `template`);
  - `image`: uma imagem própria importada de `src/assets/desktop/`, que substitui o desenho. Para um ícone novo, coloque o original em `originais/desktop/`, acrescente uma linha em `ICONS` no `optimize-images.py` e rode `npm run images`;
  - `href`: o destino, como `'#projetos'` ou uma URL. Sem `href`, o clique abre uma **janela-modelo** com o ícone, o nome, um selo "Em breve" e uma área "Conteúdo em construção", até o conteúdo de verdade ser definido.
  - `content`: uma imagem que abre numa janela ao clicar (a **Lixeira** mostra `lixeira_conteudo.png`);
  - `surf`: uma imagem que **surfa pela tela** ao clicar, no lugar de abrir janela. É o **Bonzi** (`bonzi_conteudo.png`, com o fundo branco recortado pelo `npm run images`): ele surfa por cima da barra de tarefas, sobe pelos cantos e cruza a tela por cima da janela, até alguém clicar nele (ou apertar Esc), quando some com um "puf". Com "reduzir movimento", fica parado sobre a barra até ser clicado.
  - `assistant`: uma animação que vira **assistente**, como o Clippy do Office 97. É o **Clippy** (`clippy_win_gif.gif`, com o fundo azul recortado pelo `npm run images` e salvo como WebP animado). Ele surge no canto de baixo à direita com o balão amarelo clássico e comenta o que o visitante está vendo ("Parece que você está procurando projetos..."), com atalhos para outras seções. O assunto muda sozinho a cada seção, e ele dá um pulinho. **Me conte uma curiosidade** mostra dicas do site. Clicar nele mostra ou esconde o balão, arrastar muda ele de lugar e **Ocultar** faz ele ir embora. Os textos ficam em `clippy`, no [`ui.ts`](../src/i18n/ui.ts).
  - `app: 'messenger'`: a janela do **MSN** (`msn_conteudo.png`). A mão parada da imagem é coberta pela mão do `toc_toc.gif`, sem o fundo, esticada para o mesmo tamanho. Clicar na mão (ou no botão "Send a nudge" da imagem) faz o **chamar a atenção**: a mão bate três vezes na tela, a janela treme e toca um "toc toc" no vidro. O som é sintetizado pelo navegador, sem arquivo de áudio, e toca mesmo com a música de fundo no mudo. Fecha pelo × ou pelo botão Fechar. O `npm run images` gera `msn-conteudo.webp`, `msn-toc.webp` (os quadros da batida) e `msn-toc.json` (posição da mão e tempos das batidas; não edite à mão).
  - `app: 'media-player'` + `playlist`: o **Windows Media Player** com a skin da cabeça verde (`win_media_player.png`). O `npm run images` deixa transparentes o fundo e a tela da skin, e o vídeo toca atrás dela, recortado no formato da tela. Hoje são 4 vídeos. Anterior, reproduzir/pausar, parar e próximo funcionam, e as setas verdes das laterais também trocam de vídeo. Minimizar e fechar ganharam botões maiores, por cima dos originais. Minimizado, o vídeo continua tocando e o ícone restaura a janela. Dá para arrastar a skin pela tela. Enquanto o vídeo toca, a música de fundo do site se cala sozinha e volta ao pausar ou fechar. Desligar ou reiniciar o site fecha o player.
    - **Para acrescentar vídeos:** guarde o original em `src/assets/originais/video/`, gere uma versão leve em `src/assets/video/` (exemplo com ffmpeg: `ffmpeg -i original.mp4 -vf scale=512:384 -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 96k -movflags +faststart media-player-2.mp4`), importe no topo do `portfolio.ts` e acrescente ao `playlist` do ícone, na ordem desejada. Vídeos em 4:3 preenchem melhor a tela; outros formatos são cortados nas bordas.
- **Janelas dos ícones na barra de tarefas:** tudo o que os ícones abrem (as janelas da Lixeira, do MSN e dos modelos, o Media Player, o Clippy e o BonziBuddy) ganha um botão na barra de tarefas, como o do portfólio, com o ícone e o nome. Clicar no botão minimiza ou restaura. As janelas não bloqueiam o resto da tela, têm o botão "−" ao lado do ×, abrem em cascata e a última clicada fica na frente. No celular, com muitas abertas, a fileira de botões desliza para o lado com o dedo.
- **Telas pequenas:** os ícones só aparecem com 1024 px ou mais; abaixo disso não há espaço ao lado da janela.

### 8. Spotify

A aba **Spotify** e o cartão no Início mostram o **seu** perfil e a sua atividade para qualquer visitante. Para isso, uma função no servidor (`/api/spotify`) guarda a sua credencial do Spotify e entrega ao site apenas dados públicos. Nenhum token chega ao navegador.

1. **Criar o app** em <https://developer.spotify.com/dashboard>:
   - **Redirect URI:** `http://127.0.0.1:8888/callback` (exatamente assim);
   - **APIs:** Web API.

   Confira os requisitos atuais do painel do Spotify para apps em modo de desenvolvimento.

2. **Copiar as chaves:** copie `.env.example` para `.env.local` e preencha `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET`.
3. **Gerar o token:** rode `npm run spotify:auth`, abra o link e autorize com a **sua** conta. O `SPOTIFY_REFRESH_TOKEN` é gravado em `.env.local`.
4. **Testar:** `npm run dev` já usa os dados reais.

**Dados exibidos:**

- perfil e seguidores;
- tocando agora, com progresso;
- 10 últimas músicas;
- artistas e músicas mais ouvidos nas últimas 4 semanas;
- suas playlists públicas, só com `spotify.showPlaylists: true` (hoje desligado).

Podcasts e playlists privadas não aparecem. Os dados se atualizam a cada 30 s (`spotify.refreshSeconds`) enquanto a aba do navegador está visível. O número de seguidores só aparece com `spotify.showFollowers: true` (hoje desligado).

**Atualizar na hora:** a aba Spotify tem o botão **Atualizar** na barra de comandos (e **Tentar novamente** quando a conexão falha). Ele busca os dados de novo sem esperar o intervalo e sem o cache da hospedagem.

**Erro local `UNABLE_TO_VERIFY_LEAF_SIGNATURE`:** acontece em redes que inspecionam HTTPS (firewall Fortinet/FortiGate, comum em faculdades e empresas). O certificado entregue ao Node não é o do Spotify, então a função recusa a conexão e a aba mostra "Spotify indisponível". Não é defeito do site e não acontece na Vercel. Use outra rede para testar localmente; não desligue a verificação de certificados. Nessas redes o firewall também pode ler o que passa por ele, inclusive as chaves do Spotify.

**Sem configuração:**

- em `npm run dev`, aparecem **dados de exemplo** com aviso;
- no site publicado, o cartão do Início some e a aba mostra "indisponível".

Para remover a integração, use `spotify.enabled: false`.

### Idiomas (português e inglês)

- **Qual idioma aparece:** na primeira visita, o do navegador (português para `pt-*`, inglês para os demais). O visitante troca pelo indicador **PT/EN** na barra de tarefas ou em **Aparência > Idioma**, e a escolha fica salva no navegador.
- **Conteúdo:** em `portfolio.ts`, cada texto tem `pt` e `en`. Se faltar uma das línguas, o build falha.
- **Interface:** em [`src/i18n/ui.ts`](../src/i18n/ui.ts). O objeto `en` tem o mesmo tipo do `pt`: chave faltando é erro de compilação.
- **Novas funcionalidades:** `npm run check` roda `npm run i18n:check`, que acusa texto escrito direto no código (fora de `ui.ts`/`portfolio.ts`): texto solto no JSX, `aria-label`/`title`/`alt`/`placeholder` fixos e qualquer string com acentos do português. Assim, nada novo entra no site numa língua só. Para um caso legítimo (ex.: o nome "Português" no seletor), ponha o comentário `i18n-exempt` antes da declaração.
- **Datas e números** (relógio, "há 2 horas", seguidores) usam o formato do idioma atual.
- As rotas continuam em português (`#projetos`, `#sobre`) nas duas línguas.

### Prévias de link, buscadores e ícones

- **Imagem de prévia** (LinkedIn, WhatsApp etc.): `public/og-image.jpg`, 1200×630, uma captura do Início. As tags `og:*` e `twitter:*` ficam em [`index.html`](../index.html).
- **Buscadores:** `public/robots.txt` (bloqueia só `/api/`) e `public/sitemap.xml` (página única).
- **Ícones:** `favicon.ico`, `favicon.png`, `apple-touch-icon.png` e `icon-192/512.png` saem do logo via `npm run images`; o manifesto é `public/site.webmanifest`.
- **Se o domínio mudar:** troque `https://portfolio-pedropaulo.vercel.app` no `index.html`, no `robots.txt` e no `sitemap.xml`.
- **Limite do Spotify:** apps do Spotify em modo de desenvolvimento têm uma cota pequena de chamadas. Se ela estoura, o Spotify responde `429 QUOTA_EXCEEDED` e bloqueia o app por um tempo (em nov/2026, ~78 min). Para poupar a cota, a função em [`server/spotify.ts`](../server/spotify.ts):
  - busca no Spotify no máximo uma vez a cada 20 s por instância (`MIN_INTERVAL_MS`); as outras chamadas recebem a última resposta;
  - a cada busca, pede só "tocando agora" e "últimas músicas" (2 chamadas). Perfil, mais ouvidos e playlists são renovados no máximo a cada 1 h (`SLOW_MS`);
  - com `429`, não chama mais nada até passar o tempo pedido pelo Spotify (`Retry-After`): insistir durante o bloqueio pode prolongá-lo;
  - se o Spotify falhar, devolve a última resposta boa das 6 h anteriores (`STALE_MS`), e o cache da Vercel serve a última cópia por até 1 dia (`stale-if-error`).
- **Se a seção Spotify mostrar erro:** quase sempre é esse bloqueio, e passa sozinho. Não adianta atualizar a página várias vezes.

### Página 404, privacidade e estatísticas

- **Página 404:** `public/404.html`, no estilo da tela azul do Windows, em português e inglês (segue o idioma salvo pelo site). A Vercel a serve para qualquer endereço inexistente. É independente do React; o azul é `#0070CC` (um pouco mais escuro que o original, para o contraste do texto passar no mínimo de acessibilidade).
- **Política de privacidade:** rota `#privacidade`, com texto em `privacy` no [`portfolio.ts`](../src/data/portfolio.ts). Os links ficam no fim do Contato e no menu Iniciar. Revise o texto e a data se o site passar a coletar algo novo (ex.: um formulário).
- **Estatísticas:** Vercel Web Analytics (`@vercel/analytics`), sem cookies. A contagem automática está desligada; o App registra cada seção como um caminho (`/projetos`, `/projetos/academico`…), já que a rota fica no `#`. Para os dados aparecerem, ative **Analytics** no painel do projeto na Vercel.

### Contador de visitas

- **Onde aparece:** no Início, abaixo de "Online" (ex.: "1.234 visitas").
- **Como conta:** uma vez por sessão do navegador. Recarregar ou trocar de seção não soma. No servidor, cada endereço de rede conta no máximo uma vez a cada 6 h, o que evita inflar o número; só um resumo irreversível do IP é guardado, e ele se apaga sozinho.
- **Onde fica o total:** num banco Redis da Upstash, que é gratuito e se liga pela Vercel. O código está em [`server/visits.ts`](../server/visits.ts) e [`api/visits.ts`](../api/visits.ts).
- **Ativar (uma vez):**
  1. Na Vercel, abra o projeto → **Storage** → **Create Database** → **Upstash for Redis** (plano gratuito) → conecte ao projeto.
  2. A Vercel cria sozinha as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`. Não copie esses valores para nenhum arquivo do repositório.
  3. Faça um novo deploy (**Deployments** → **Redeploy**) para a função passar a ler as variáveis.
- **Sem o banco:** o site esconde o contador, sem erro visível. Em `npm run dev`, sem as variáveis no `.env.local`, ele usa um contador de teste em memória, que zera ao reiniciar.
- **Não contar as suas visitas:** em cada aparelho e navegador seu (notebook, celular), abra uma vez `https://portfolio-pedropaulo.vercel.app/?naocontar`. Daí em diante, aquele navegador só mostra o total. Para voltar a contar, abra com `?contar`. A marca fica no navegador, então limpar os dados do site ou usar aba anônima a desfaz. Num navegador marcado, aparece "(você não conta)" ao lado do número de visitas: é o jeito de conferir se a marca continua lá (por exemplo, no navegador interno do Instagram). Se o aviso sumir, abra o link com `?naocontar` de novo.
- **Zerar ou ajustar o número:** no painel da Upstash, na Vercel (**Storage** → o banco → **Data Browser**), edite a chave `portfolio:visits`.

### 9. Conferir antes de publicar

```bash
npm run placeholders  # deve terminar com "Nenhum placeholder encontrado."
npm run check
```

## Publicação

`npm run build` gera a pasta `dist/`, um site estático com caminhos relativos. A navegação usa endereços com `#` (`#projetos`), então não é preciso configurar redirecionamentos no servidor.

**Com Spotify (recomendado: Vercel, plano gratuito):**

1. Importe o repositório na Vercel. O Vite é detectado sozinho e `api/spotify.ts` vira a função `/api/spotify`.
2. Em _Settings → Environment Variables_, crie `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` e `SPOTIFY_REFRESH_TOKEN`, com os mesmos valores do `.env.local`.
3. Faça o deploy.

**Outra hospedagem:** em hospedagens só estáticas (GitHub Pages), o site funciona, mas sem o Spotify. Para Netlify ou Cloudflare, crie uma função que chame `handleSpotifyRequest` de [`server/spotify.ts`](../server/spotify.ts): ela usa `Request`/`Response` padrão da Web.

**Licenças e marcas:**

- **Fontes e imagens do kit:** as fontes Frutiger e as imagens do kit não têm licença de redistribuição confirmada.
- **Logos:** o logo do Windows (botão Iniciar) e o do Spotify são marcas registradas de seus donos. Confirme os direitos antes de publicar; para o Spotify, siga as diretrizes de marca do Spotify Developer.

## Como o site funciona

### Navegação

- **Endereços:** cada seção tem o seu: `#inicio`, `#projetos`, `#projetos/profissional`, `#projetos/academico`, `#projetos/pessoal`, `#sobre`, `#tecnologias`, `#spotify` e `#contato`.
- **Voltar/avançar:** os da janela usam o histórico do navegador.
- **Pesquisa:** filtra projetos por nome, resumo, categoria, estado e tecnologias, ignorando acentos.
- **Menu do portfólio:** abre pelo logo da barra de título ou pelo botão na barra de tarefas. Ele leva às seções e reúne a **Aparência**.
- **Aparência:** tema claro/escuro do conteúdo e vidro da janela (translúcido + blur, translúcido sem blur ou opaco). O padrão é com blur em computador, como o Aero do Windows 7, e sem blur em celular e tablet, que é mais leve para rolar. As duas escolhas são independentes e ficam salvas no navegador. Sem blur, a barra de tarefas e o menu Iniciar ficam com o vidro mais denso, para o texto da janela não se misturar com eles.
- **Barra de tarefas:** funcionam o botão **Iniciar** (abre o menu), o **volume** do som de fundo e o **relógio** (hh:mm:ss e, embaixo, a data, como no Windows 7; em celular, só a hora; a data completa aparece ao passar o mouse).
- **Botão da janela na barra de tarefas:** ao passar o mouse, ganha o brilho que segue o ponteiro e mostra uma miniatura da janela com a seção atual. Ao clicar, a janela **minimiza**: encolhe até o botão e some, deixando só a área de trabalho e a barra. Outro clique **restaura**. Ir para uma seção pelo menu Iniciar, por um ícone ou pelo voltar/avançar do navegador também restaura. Minimizada, a janela sai do Tab e dos leitores de tela, que recebem um aviso de como voltar. No celular, o botão mostra só o ícone, sem miniatura.
- **Menu Iniciar:** no quadro do usuário, no topo da coluna escura, aparece a foto do perfil (`profile.photo`; sem foto, o logo). No pé da coluna fica **Desligar ▸**, como no Windows 7. **Desligar** mostra a tela azul "Desligando..." por uns 2 s, escurece e volta à tela do botão de ligar. A seta abre **Reiniciar**, que mostra "Reiniciando..." e toca o vídeo de inicialização sozinho, sem precisar do botão. Nos dois casos a música para na hora, a janela fecha e, ao ligar de novo, tudo recomeça como na primeira visita: portfólio fechado e música só quando ele for aberto. Desligar ou reiniciar não conta visita nova. Para fechar o menu: Esc, clique fora dele ou no botão Iniciar.
- **Botões da janela:** o "−" minimiza, do mesmo jeito que o botão da barra de tarefas. O "×" **fecha**: a janela some, o botão dela sai da barra de tarefas e aparece no centro da área de trabalho o ícone **Portfólio** (só a imagem e o nome, sem quadro atrás), que a abre de novo com um clique (ou Enter). A música para ao fechar. Escolher uma seção no menu Iniciar também reabre. Maximizar continua só visual. Ao ligar o site, a janela já começa fechada (veja "Tela de ligar").
  - O ícone vem de `src/assets/originais/desktop/portfolio.png` e passa por `npm run images`, que gera a versão de 192 px usada no site. Para trocar, substitua esse arquivo e rode o comando.
- **Área de trabalho sem a janela (minimizada ou fechada):** a página não rola e, em telas menores que 1024 px (celular e tablet), os ícones de cenário aparecem. Em telas baixas eles ocupam mais de uma coluna.
- **"Visualizar" (Projetos):** botão na barra de comandos, como o "Modo de exibição" do Explorer. Oito modos: ícones extra grandes, grandes (o padrão, com o cartão completo), médios, pequenos, lista, detalhes (tabela), lado a lado e conteúdo. O controle deslizante à esquerda percorre os mesmos modos. Nos modos compactos, o item inteiro abre os detalhes do projeto, onde ficam o texto e os links. A escolha fica salva no navegador. Código: `src/components/window/ViewMenu.tsx`, `src/lib/projectView.ts` e o fim de `sections.css`.
- **Relógio → painel de data e hora:** clicar na hora abre o painel do Windows 7 (modelo em `src/assets/originais/referencias/calendario.png`): data por extenso, calendário, relógio analógico, hora digital e o link do rodapé.
  - **Calendário:** as setas trocam o mês; clicar no título sobe para o ano (12 meses) e depois para a década (anos), e as setas passam a trocar ano ou década; clicar num mês ou ano desce de volta. Clicar num dia o seleciona, e hoje fica com a borda azul. A data do topo volta para hoje.
  - **Teclado:** setas andam pelos dias, Home/End vão ao começo/fim da semana, PageUp/PageDown trocam o mês, Esc fecha.
  - **Link "Alterar configurações de data e hora...":** abre Aparência, onde se troca o idioma (que define o formato de data e hora).
  - Datas, nomes de meses e dias seguem o idioma do site. O código está em `src/components/desktop/DateTimeFlyout.tsx` e `datetime.css`.
- **Detalhes de um projeto:** o diálogo mostra uma faixa com logo, nome, selos e a capa do projeto ao fundo; depois "Sobre o projeto", tecnologias e capturas de tela; no rodapé fixo, Demonstração, Repositório e Fechar. Para separar parágrafos no texto, use `

`dentro de`details`, em `portfolio.ts`.

- **Elementos decorativos:** os outros ícones da bandeja, o botão da janela e os controles minimizar/maximizar/fechar são só cenário.

### Orbes por função

- **01 Safira:** ação principal ("Ver projetos").
- **09 Obsidiana:** utilidades e ações secundárias (voltar/avançar, "Entrar em contato").

### Responsividade

- **Rolagem:** existe uma só, a da página. A janela cresce com o conteúdo, e o fundo e a barra de tarefas ficam fixos. Com mouse, as barras de rolagem têm o desenho do Windows 7 (`src/styles/motion.css`); em telas de toque, valem as do navegador.
- **Diálogos** (detalhes de projeto): abrem na área útil, acima da barra de tarefas; o conteúdo rola e os botões ficam fixos embaixo.
- **Início no celular:** foto à esquerda com nome e cargo ao lado, status e visitas numa linha, os dois botões lado a lado e os atalhos "Neste portfólio" em duas colunas.
- **Entre 1024 e 1279 px:** a janela deixa de ser centralizada e ocupa a largura que sobra ao lado dos ícones.
- **≥ 900 px:** painel lateral do Explorer.
- **< 900 px:** a navegação vira uma faixa de seções que quebra em linhas.
- **< 600 px:**
  - a pesquisa ganha linha própria;
  - o caminho mostra só os 2 últimos níveis;
  - "Aparência" vira só ícone;
  - a bandeja da barra de tarefas some.
- **Texto:** os tamanhos usam `rem` e os pontos de quebra usam `em`, então o layout acompanha o tamanho de fonte do navegador (testado a 200%).
- **Toque:** alvos de 44–48 px em telas de toque.

### Acessibilidade

- O primeiro Tab mostra **"Pular para o conteúdo"**.
- Há marcos semânticos: banner, ferramentas da janela, navegação, conteúdo principal e barra de tarefas.
- Ao navegar, o foco vai para o título da seção.
- O menu e o diálogo prendem o foco, fecham com Esc ou com clique fora e devolvem o foco a quem os abriu. Escolher uma seção no menu leva o foco ao título dela.
- Os elementos decorativos ficam fora da árvore de acessibilidade.
- Com **movimento reduzido**, não há animações de entrada nem deslocamentos.
- Sem suporte a desfoque, o vidro passa a "translúcido sem blur" e a opção aparece desabilitada, com explicação.
- O site funciona com o armazenamento do navegador bloqueado: as preferências valem só para a sessão.

### Arquitetura

```
src/
  data/portfolio.ts      CONTEÚDO (edite aqui)
  data/labels.ts         rótulos de categoria e estado
  types/portfolio.ts     modelo de dados
  lib/router.ts          rotas por hash + histórico
  lib/navigation.tsx     contexto de navegação e RouteLink
  lib/preferences.ts     tema e modo de vidro (persistência opcional)
  lib/ambient.ts         som de fundo em loop (Web Audio) + volume/mudo
  lib/spotify.tsx        busca compartilhada dos dados do Spotify
  data/spotify-demo.ts   dados de exemplo (só em desenvolvimento)
  types/spotify.ts       contrato entre /api/spotify e o site
  components/spotify/    cartão do Início e aba Spotify
  components/desktop/    também TaskbarClock e VolumeControl
  styles/                fontes, tokens [KIT]/[EXT], base, controles, microinterações
  assets/                imagens usadas pelo site (otimizadas)
  assets/originais/      imagens originais por tipo (fonte do `npm run images`, fora do build)
  assets/ui/             imagens da interface (ícone da barra de localização)
  components/
    desktop/             DesktopBackdrop, DecorativeTaskbar: cenário
    window/              AeroWindow, WindowTitleBar, LocationBar, CommandBar,
                         PortfolioNavigation, SearchBox
    launcher/            StartMenu: seções + Aparência (tema, vidro, idioma)
    sections/            HeroSection, ProjectsSection, ProjectCard, ProjectThumbnail,
                         AboutSection, SkillsSection, ContactSection
    ui/                  Orb, OrbButton, BrandMark, Icon, AeroDialog
server/spotify.ts        núcleo do endpoint /api/spotify (credenciais só no servidor)
api/spotify.ts           função serverless da Vercel
scripts/placeholders.mjs relatório de conteúdo provisório
scripts/i18n-check.mjs   acusa texto de interface sem tradução
src/i18n/                textos da interface (ui.ts), idioma (locale.ts) e conteúdo traduzido (content.ts)
scripts/tech-icons.mjs   baixa os ícones das tecnologias (Devicon, Simple Icons)
scripts/spotify-auth.mjs obtém o refresh token do Spotify
scripts/generate-ambient.py gera o som de fundo template
public/favicon.png       favicon (gerado do logo)
```

**Regras herdadas do kit:**

- Moldura, controles de janela e orbes não mudam com o tema.
- O tema altera só o interior, e o vidro é independente do tema.
- Não há barra de status no rodapé.
- `src/styles/orbs.css` copia as receitas dos orbes do kit sem alteração e fica fora do Prettier, para poder ser comparado linha a linha.

## Sugestões para versões futuras

Fora do escopo da V1:

- **Imagens:** gerar miniaturas otimizadas automaticamente (vários tamanhos com `srcset`).
- **SEO:** metadados Open Graph e cartão de prévia para redes sociais; `sitemap`.
- **Detalhes do projeto:** página própria para cada projeto, em rota `#projetos/<id>` (hoje a galeria fica na janela Detalhes).
- **Testes:** testes de ponta a ponta versionados no repositório (Playwright + axe), executados em CI.
- **Navegadores:** conferir em Safari (iOS/macOS) e Firefox reais. As listras do título usam fundo fixo, que o Safari para iPhone não suporta.

### Sobre, Início, Tecnologias e top 10 do Spotify (atualização)

- **Foto do Início:** `originais/profile/foto_tela_inicial.jpg` (recorte em `PHOTO_CROP`, no `optimize-images.py`). A mesma foto aparece no menu Iniciar e na ficha do Sobre.
- **Destaque do TCC no Início:** `featured` no `portfolio.ts`, com a foto `foto_tcc.jpg` (gerada como `profile/foto-tcc.webp`), um título, um texto e o botão "Ver o projeto".
- **Sobre:** cartões separados. A **ficha rápida** (`about.facts`) só mostra os itens com `value`: preencha "Nasci em" e "Moro em" para eles aparecerem. O **carrossel** (`about.photos`) mostra 5 vagas "foto em breve" enquanto estiver vazio. Para adicionar fotos: coloque a imagem em `src/assets/`, importe no topo do `portfolio.ts` e acrescente `{ src, alt }`.
- **Tecnologias:** clicar num item abre uma explicação curta, logo abaixo dele. Os textos ficam em `src/data/skillInfo.ts`, em português e inglês. Os itens de Design e IHC têm ícones próprios em `src/assets/tech/`.
- **Spotify, meu top 10:** cole os links do Spotify (Compartilhar → Copiar link) em `spotify.favorites.tracks` e `spotify.favorites.artists`, no `portfolio.ts`, na ordem. Capas, nomes e fotos dos artistas vêm do Spotify pela função `/api/spotify-favorites`, com cache de um dia. Cada música tem um botão de prévia que abre o player oficial do Spotify, e a música de fundo do site se cala enquanto ele está aberto. Sem lista, aparecem 10 vagas "em breve". A aba não mostra mais "Mais ouvidos nas últimas 4 semanas".
- **Botão de artigo com confirmação:** em `portfolio.ts`, um projeto aceita `articleUrl` (hoje, o artigo do TCC no Aquanauta). O botão "Artigo do TCC" aparece no cartão e nos detalhes e abre uma janela "Abrir link externo" antes de sair do site; o link abre em nova aba só se o visitante escolher Continuar. Confira se o arquivo do Drive está compartilhado como "qualquer pessoa com o link".
- **Ficha do Sobre:** "Natural de" mostra Guarapuava, Paraná - Brasil (`about.facts`).
- **Fundo animado do destaque do TCC (Início):** o GIF `originais/profile/fundo_telainicial_aquanauta.gif` vira o vídeo `src/assets/video/fundo-tcc.mp4` (sem som, em loop), bem mais leve que o GIF. Para trocar, gere o vídeo de novo com `ffmpeg -i fundo_telainicial_aquanauta.gif -an -c:v libx264 -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart src/assets/video/fundo-tcc.mp4` e rode `npm run images` (gera o 1º quadro, `profile/fundo-tcc.webp`, que aparece enquanto o vídeo carrega e para quem pede menos animação).
- **Fundo dos artistas do top 10:** cada artista em `spotify.favorites.artists` é `{ artist, album }`. A capa do `album` (ID ou link do álbum no Spotify: Compartilhar → Copiar link do álbum) vira o fundo do ladrilho, escurecida embaixo para o nome ficar legível. Sem `album`, o ladrilho fica com o fundo normal. A API do Spotify não oferece outras fotos do artista além da de perfil, por isso o fundo usa a capa de um álbum.
