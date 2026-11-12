# PROMPT PARA CLAUDE CODE — PORTFÓLIO PESSOAL AERO / WINDOWS 7

## 1. Contexto e objetivo

Você está trabalhando no repositório do meu **portfólio pessoal**, voltado à minha apresentação como **estudante em fase final de graduação na área de Computação e desenvolvedor de software**.

**Sua tarefa é construir o site primeiro, com alto nível de acabamento visual e técnico.** Não é hora de preencher um portfólio definitivo, buscar meus dados pessoais ou inventar informações sobre minha carreira. Nesta primeira entrega, os projetos, links, imagens e alguns textos serão **placeholders editáveis**. A prioridade é obter um site bonito, responsivo, navegável, consistente e pronto para receber conteúdo real depois.

### Contexto visual já estabelecido — NÃO redescobrir a estética

Você **já leu, analisou e compreendeu o `aero-ui-kit` que disponibilizei**. Use esse conhecimento e os arquivos locais do kit como a **fonte principal de verdade visual e técnica**. Não me peça para reenviar o kit, não recomece o trabalho de descoberta estética e não substitua sua linguagem visual por um design SaaS moderno genérico.

**A mudança mais importante em relação à direção anterior é esta:**

1. **O portfólio inteiro deve aparecer dentro de uma janela inspirada no Windows 7 / Windows Vista (Aero Glass)**, construída a partir das peças, tokens, padrões e recursos visuais do `aero-ui-kit`.
2. **Atrás dessa janela deve existir um fundo que simule uma área de trabalho da época**, concebido e implementado **do zero**, inspirado visualmente no `aero-ui-kit`.
3. **A área de trabalho é estritamente cenográfica**. Não crie um sistema operacional simulado, gerenciador de arquivos, janelas adicionais, aplicativos de mentira ou funcionalidades de desktop. O usuário interage com o **site do portfólio dentro da janela**, não com o cenário atrás dela.

O resultado deve parecer um **site pessoal autêntico apresentado dentro de uma janela Aero**, e não uma recriação funcional do Windows.

---

## 2. Diretrizes de design inegociáveis

### A. Desktop cenográfico (camada de fundo)

- Criar, via CSS e/ou recursos gráficos originais do projeto, um wallpaper autoral que evoque a época do Windows 7: gradientes suaves, luz difusa, auroras e profundidade visual. Inspire-se no kit sem copiar um wallpaper oficial pixel a pixel.
- Incluir, **somente se acrescentarem qualidade ao conjunto**, alguns detalhes discretos: ícones decorativos de área de trabalho, barra de tarefas cenográfica, área de relógio, orbe/elemento circular brilhante, reflexos e pequenas bordas iluminadas.
- O cenário **não terá links, menus, relógio real, ícones clicáveis, drag-and-drop, programas, notificações, botão Iniciar funcional ou persistência de estado**.
- Deixar absolutamente evidente na implementação que esses elementos são **decorativos**: não usar cursor `pointer`, não inserir controles enganosos na ordem de tabulação, não adicionar eventos de clique e usar atributos de acessibilidade adequados.
- O cenário deve emoldurar o portfólio, **jamais competir por atenção com o conteúdo**.

### B. Janela principal do portfólio

- A janela é o **elemento central** e deve transmitir imediatamente o acabamento Aero/Windows 7 do kit: vidro translúcido, bordas luminosas, reflexos, degradês, cantos arredondados, sombras, profundidade, detalhes de brilho e separação clara entre moldura e conteúdo.
- Estruturar a janela como uma composição crível: **moldura externa**, **barra de título**, **área de controles visuais da janela**, **barra ou faixa de navegação** e **conteúdo interno**.
- Os botões típicos da barra de título (minimizar, maximizar, fechar), caso representados, serão **apenas decorativos na V1**, porque fechar ou minimizar a janela impediria a navegação pelo site. Não implementar ações falsas nem fazê-los parecer operacionais para tecnologias assistivas.
- Usar os componentes e tokens do `aero-ui-kit` sempre que compatíveis; não copiar código de forma desnecessária nem introduzir uma segunda biblioteca de UI concorrente.
- Não exagerar em blur, reflexos ou transparência a ponto de prejudicar leitura e contraste. O vidro deve parecer convincente **e** funcional para um site real.
- Manter o conteúdo do portfólio em uma superfície legível, com hierarquia visual clara.
- No desktop, a janela deve aparecer centralizada e com respiro suficiente para que o fundo da área de trabalho continue visível.

### C. Visual geral

- Estética **Frutiger Aero / skeuomorphism da era Windows 7 e Vista**, coerente com o kit já interpretado.
- Priorizar qualidade de acabamento em vez de enfeites em excesso: estados de hover refinados, orbes quando pertinentes, iluminação consistente, bordas finas, botões bem construídos e microinterações discretas.
- **Não** transformar o projeto em landing page SaaS, dashboard corporativo, terminal hacker, interface flat ou cópia literal do Windows.
- Evitar assets com licença duvidosa. Reaproveitar recursos já presentes no repositório quando possível; se precisar de outros, criar recursos originais e leves.
- Preservar a identidade do kit e torná-la reconhecível em toda a experiência.

---

## 3. Estrutura de conteúdo da primeira versão

Construa a estrutura do portfólio com texto em **português brasileiro**, preparado para futura substituição por informações reais.

### Seções / navegação

1. **Início** — apresentação curta: nome em placeholder, título profissional como “Desenvolvedor de Software • Graduando em Computação”, breve descrição e CTA **“Ver projetos”**.
2. **Projetos** — principal vitrine do site, com cards bem acabados, miniaturas temporárias e categorias claras. Incluir exemplos identificados explicitamente como **“Projeto profissional 01”**, **“Projeto acadêmico 01”**, **“Projeto pessoal 01”** etc. São modelos de card, **não conquistas ou projetos declarados como reais**.
3. **Sobre** — pequena área para trajetória acadêmica, interesses em tecnologia e perfil de desenvolvedor. Conteúdo provisório, sem inventar universidade, cursos, experiências ou resultados.
4. **Tecnologias** — espaço organizado para futuras linguagens, frameworks e ferramentas; usar rótulos editáveis ou categorias genéricas, sem presumir competências específicas.
5. **Contato** — espaço para e-mail e links de GitHub, LinkedIn ou outras redes, **sem inventar perfis reais**. Campos e URLs ausentes devem ter placeholders ou ficar desabilitados de modo acessível até serem configurados.

### Cards de projeto

Cada card deve estar pronto para receber:

- nome;
- categoria (acadêmico, profissional ou pessoal);
- resumo curto;
- imagem/thumbnail;
- stack de tecnologias;
- estado de desenvolvimento (opcional);
- URL de repositório (opcional);
- URL de demonstração (opcional);
- detalhes adicionais (opcionais).

**Requisito crucial:** criar um **modelo único e reutilizável** para os projetos. Seus dados devem ficar concentrados em um arquivo de configuração fácil de editar. Não hardcodar seis cards com HTML/JSX duplicado. Botões de links inexistentes não devem abrir `#` nem simular destinos.

### Navegação

- A navegação deve funcionar de verdade no **conteúdo interno da janela**.
- Preferir uma experiência simples e rápida: seções, abas ou roteamento leve, escolhendo a solução mais compatível com o projeto atual.
- O CTA “Ver projetos” deve levar à área de projetos.
- Não criar páginas vazias apenas para aparentar complexidade.

---

## 4. Responsividade: desktop primeiro, mas celular de verdade

O conceito principal é uma janela Aero sobre uma área de trabalho. Porém, o projeto **precisa funcionar muito bem em celulares**.

- **Desktop:** janela central com cenário visível ao redor; conteúdo organizado e densidade equilibrada.
- **Tablet:** janela se adapta à largura, preservando borda e barra de título, com redução de espaços sem deformar os componentes.
- **Celular:** janela ocupa quase toda a largura útil e pode se estender verticalmente; preservar a identidade Aero na moldura, mas simplificar o cenário de fundo (barra de tarefas e ícones decorativos podem ser ocultos se atrapalharem).
- Nunca exigir hover, arrastar a janela ou usar desktop para acessar seções essenciais.
- Não gerar rolagem horizontal, sobreposição de textos, botões inacessíveis ou barras de rolagem aninhadas desconfortáveis.
- Definir uma estratégia intencional de rolagem: priorizar **um fluxo de scroll previsível**, mesmo quando a página parecer uma janela de aplicativo.
- Testar pelo menos larguras de **360 px, 390 px, 768 px, 1366 px e 1920 px**.

---

## 5. Arquitetura, código e qualidade

Antes de modificar arquivos, inspecione **somente o necessário** para entender a estrutura existente, o framework, as dependências, os assets e a integração com o `aero-ui-kit`.

- **Respeite a stack já existente no repositório.** Não migre de framework nem reinstale todo o projeto sem motivo técnico real. Se o repositório ainda não possuir stack de app, proponha e adote uma solução web leve, de boa manutenção (por exemplo, Vite + React + TypeScript, se fizer sentido no contexto).
- Reutilize variáveis, recursos gráficos, componentes e padrões do kit sempre que possível.
- Organize separadamente: apresentação, layout da janela, desktop decorativo, componentes reutilizáveis e dados do portfólio.
- Componentes sugeridos (adapte à stack): `DesktopBackdrop`, `DecorativeTaskbar`, `AeroWindow`, `WindowTitleBar`, `PortfolioNavigation`, `HeroSection`, `ProjectsSection`, `ProjectCard`, `AboutSection`, `SkillsSection`, `ContactSection`.
- Centralize nome, textos, seções, links e projetos em arquivos editáveis e tipados quando aplicável (ex.: `src/data/portfolio.ts`).
- Usar HTML semântico, navegação por teclado, foco visível, contraste adequado, alternativas textuais e respeito a `prefers-reduced-motion`.
- Usar animações suaves e leves, evitando dependências desproporcionais e efeitos que prejudiquem desempenho em dispositivos modestos.
- Respeitar `backdrop-filter` com fallback visual quando não disponível.
- Evitar imagens gigantes, fontes não licenciadas, bibliotecas pesadas ou efeitos contínuos desnecessários.
- Não acrescentar backend, banco de dados, login, painel administrativo, CMS, analytics, automações ou integrações externas nesta fase.
- Não apagar recursos existentes de outros projetos nem alterar configurações externas sem necessidade.

---

## 6. Execução obrigatória em GRUPOS DE FUNCIONALIDADES

**Não tente fazer tudo de forma caótica.** Divida a implementação nos grupos abaixo, na **ordem especificada**. Cada grupo tem um nível de esforço recomendado para **Claude Code com Opus 5.5**. Esses níveis são recomendações para **eu selecionar manualmente** na interface; você **não deve presumir que consegue trocar o esforço automaticamente**.

Primeiro, apresente um plano curto confirmando os grupos e qualquer ajuste estritamente necessário à stack real. Depois **implemente somente o Grupo 1**. Ao finalizar cada grupo, informe o que fez, quais arquivos alterou, o resultado das verificações e qual grupo vem a seguir. **Pare no limite de cada grupo**, para que eu possa ajustar o esforço e solicitar a continuação. Não interrompa por questões triviais que possa resolver com bom julgamento.

| Ordem | Grupo | Prioridade | Esforço Opus 5.5 | O que entregar |
|---|---|---|---|---|
| **1** | Auditoria pontual do projeto e fundação | P0 / indispensável | **Medium** | Identificar stack e recursos do kit, organizar pastas, tokens e base executável, planejar componentes sem reescrever o kit. |
| **2** | Cenário de área de trabalho + janela Aero | P0 / identidade visual central | **High** | Construir wallpaper autoral, desktop puramente decorativo, barra de tarefas cenográfica e a janela principal com acabamento visual inspirado no kit. |
| **3** | Estrutura do portfólio e navegação | P0 / experiência funcional | **Medium** | Criar seções, navegação real, hero, CTA, componentes reutilizáveis e modelos de projeto carregados de uma configuração centralizada. |
| **4** | Responsividade e adaptação da janela | P0 / uso real | **High** | Ajustar layouts de desktop/tablet/celular, rolagem, menu em telas pequenas e preservar identidade visual em diferentes larguras. |
| **5** | Microinterações e polimento visual | P1 / refinamento | **High** | Ajustar vidro, sombras, orbes, gradientes, reflexos, transições e feedback dos controles verdadeiramente interativos, sem exageros. |
| **6** | Acessibilidade, desempenho e manutenção | P1 / qualidade | **Medium** | Melhorar semântica, teclado, foco, contraste, movimento reduzido, carregamento, CSS/TS e facilidade de substituição dos placeholders. |
| **7** | Testes finais, correções e entrega | P0 / aprovação da V1 | **High** | Executar build e verificações disponíveis, revisar responsividade e navegação, corrigir falhas, documentar execução e atualização dos dados. |

### Quando considerar Extra High (`xhigh`)

Use **Extra High apenas se o Grupo 2 ou 4 revelar problemas arquiteturais complexos** (por exemplo, conflitos difíceis entre o kit, a renderização do vidro, efeitos e responsividade) que não forem solucionados adequadamente com High. **Não comece em Max.** Max não é necessário para um portfólio inicial desta natureza, salvo dificuldades excepcionais comprovadas.

### Regra de conclusão de cada grupo

Ao concluir um grupo, retorne **resumidamente**:

1. **Entregas realizadas** (itens concretos);
2. **Arquivos criados/modificados** (caminhos principais);
3. **Verificações** executadas e resultados (não afirme que testou algo que não testou);
4. **Pendências ou riscos**, se existirem;
5. **Próximo grupo e esforço recomendado**.

Não apresente textos enormes de autodescrição. Priorize código funcional, boas decisões e relatório objetivo.

---

## 7. Critérios de aceite da versão inicial

Só considere o site inicial entregue quando:

- [ ] O resultado é visualmente reconhecível como **Frutiger Aero / Windows 7-Vista**, alinhado ao `aero-ui-kit`.
- [ ] O **portfólio está contido numa janela Aero** com moldura, barra de título e conteúdo legível.
- [ ] Há uma **área de trabalho cenográfica original ao fundo**, sem quaisquer funcionalidades de sistema operacional.
- [ ] A navegação do portfólio e o CTA de projetos funcionam.
- [ ] Os cards de projeto são **templates reutilizáveis**, com dados centralizados e sem informações inventadas.
- [ ] O site funciona em celular, tablet e desktop, sem overflow horizontal nem conteúdo essencial inacessível.
- [ ] A estética visual não prejudica contraste, desempenho, teclado ou legibilidade.
- [ ] O build final passa, ou eventuais impedimentos são explicitamente documentados.
- [ ] Existe uma instrução curta e clara sobre **onde substituir nome, projetos, imagens, tecnologias e links reais**.
- [ ] O cenário de desktop não virou um projeto paralelo complexo.

---

## 8. Restrições de escopo

**Faça agora:** estrutura, design, componentes, responsividade, navegação, placeholders, polimento, testes e organização para futura edição.

**Deixe para depois:** cadastro de meus projetos reais, curadoria de imagens finais, textos definitivos de apresentação, SEO avançado, domínio/deploy, formulário com backend, banco de dados, dashboard administrativo e quaisquer funções de desktop simulado.

Se identificar melhorias futuras interessantes, **registre-as como sugestões**, sem implementá-las fora do escopo.

**Comece pelo Grupo 1 (Medium).** Relembre brevemente a estratégia e execute-o sobre o repositório atual, aproveitando a análise que já realizou do `aero-ui-kit`.
