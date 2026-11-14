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
- **Início automático:** o site tenta tocar ao abrir. Os navegadores bloqueiam som antes da primeira interação do visitante (clique, toque ou tecla); nesse caso, ele começa nessa primeira interação. Isso é regra do navegador e não pode ser contornado.
- **Acessibilidade:** o 2º Tab mostra **"Silenciar som de fundo"** (WCAG 1.4.2).

### 7. Papel de parede e botão Iniciar

- **Imagens originais:** ficam em `src/assets/originais/`, separadas por tipo: `brands/` (logos AFL, Windows e Spotify), `desktop/` (ícones da área de trabalho), `profile/` (foto), `projetos/` (capturas), `tech/` (ícones de tecnologias enviados em imagem), `wallpaper/` e `referencias/` (modelos visuais, como o `exemplo_MSN.png`). Elas não entram no site publicado. O site usa versões otimizadas, geradas por `npm run images` (requer Python + Pillow).
- **Para trocar uma imagem:** substitua o arquivo em `originais/` mantendo o nome e rode `npm run images`. A relação entre cada original e a versão que o site usa está no início de [`scripts/optimize-images.py`](../scripts/optimize-images.py).
- **Papel de parede:** o original é `src/assets/originais/wallpaper/wallpaper_xp.png` (o anterior, `Wallpaper_fundo.png`, continua na pasta). O site usa `src/assets/wallpaper/wallpaper-1920.webp` e `wallpaper-1280.webp`, para celular. Para trocar, mude o nome do arquivo em `optimize-images.py` e rode `npm run images`.
- **Botão Iniciar:** o site usa `src/assets/brands/start-logo.png`.
- **Ícones da área de trabalho:** ficam em `desktopIcons`, em `portfolio.ts`, na ordem de cima para baixo. Hoje são Lixeira, Meu computador, Arquivos, MSN, The Sims 2, CS 1.6 e Minecraft, todos com imagens próprias. Cada ícone aceita:
  - `label`: o texto embaixo do ícone;
  - `kind`: um desenho pronto (`lixeira`, `computador`, `arquivos`, `vscode` ou `template`);
  - `image`: uma imagem própria importada de `src/assets/desktop/`, que substitui o desenho. Para um ícone novo, coloque o original em `originais/desktop/`, acrescente uma linha em `ICONS` no `optimize-images.py` e rode `npm run images`;
  - `href`: o destino, como `'#projetos'` ou uma URL. Sem `href`, o ícone é só cenário.
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
- **Aparência:** tema claro/escuro do conteúdo e vidro da janela (translúcido sem blur, que é o padrão; translúcido + blur; ou opaco). As duas escolhas são independentes e ficam salvas no navegador.
- **Barra de tarefas:** funcionam o botão **Iniciar** (abre o menu), o **volume** do som de fundo e o **relógio** (hh:mm:ss, no horário do visitante; a data completa aparece ao passar o mouse).
- **Elementos decorativos:** os outros ícones da bandeja, o botão da janela e os controles minimizar/maximizar/fechar são só cenário.

### Orbes por função

- **01 Safira:** ação principal ("Ver projetos").
- **09 Obsidiana:** utilidades e ações secundárias (voltar/avançar, "Entrar em contato").

### Responsividade

- **Rolagem:** existe uma só, a da página. A janela cresce com o conteúdo, e o fundo e a barra de tarefas ficam fixos.
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
