/**
 * Explicação curta de cada item de `skills` (Tecnologias), mostrada ao clicar
 * no item. A chave é o nome exato do item em qualquer idioma (veja portfolio.ts).
 * Item sem entrada aqui continua aparecendo, só sem a explicação.
 */
import type { Locale, Localized } from '../types/portfolio';

const INFO: readonly { readonly names: readonly string[]; readonly about: Localized }[] = [
  {
    names: ['JavaScript'],
    about: {
      pt: 'A linguagem da web: dá comportamento às páginas no navegador e também roda em servidores, com Node.js.',
      en: 'The language of the web: it adds behavior to pages in the browser and also runs on servers through Node.js.',
    },
  },
  {
    names: ['TypeScript'],
    about: {
      pt: 'JavaScript com tipos: o editor e o compilador apontam erros antes de o código rodar. Este portfólio é escrito nela.',
      en: 'JavaScript with types: the editor and compiler catch mistakes before the code runs. This portfolio is written in it.',
    },
  },
  {
    names: ['Dart'],
    about: {
      pt: 'Linguagem do Google usada pelo Flutter para criar apps de Android, iOS, web e desktop a partir de um só código.',
      en: 'Google’s language behind Flutter, used to build Android, iOS, web and desktop apps from a single codebase.',
    },
  },
  {
    names: ['Java'],
    about: {
      pt: 'Linguagem orientada a objetos muito usada em sistemas corporativos, Android e back-end (com Spring).',
      en: 'An object-oriented language widely used in enterprise systems, Android and back-end services (with Spring).',
    },
  },
  {
    names: ['Python'],
    about: {
      pt: 'Linguagem de sintaxe simples, usada em automação, ciência de dados, inteligência artificial e back-end.',
      en: 'A language with simple syntax, used for automation, data science, artificial intelligence and back-end work.',
    },
  },
  {
    names: ['C'],
    about: {
      pt: 'Linguagem de baixo nível, próxima do hardware: base de sistemas operacionais e de sistemas embarcados.',
      en: 'A low-level language close to the hardware: the foundation of operating systems and embedded systems.',
    },
  },
  {
    names: ['C++'],
    about: {
      pt: 'Evolução do C com orientação a objetos, usada em jogos, motores gráficos e programas de alto desempenho.',
      en: 'An evolution of C with object orientation, used in games, graphics engines and high-performance software.',
    },
  },
  {
    names: ['HTML5'],
    about: {
      pt: 'Linguagem de marcação que estrutura o conteúdo das páginas web: textos, imagens, links e formulários.',
      en: 'The markup language that structures web pages: text, images, links and forms.',
    },
  },
  {
    names: ['CSS3'],
    about: {
      pt: 'Linguagem de estilos da web: cores, layout, animações e responsividade. É ela que dá o visual Aero a este site.',
      en: 'The styling language of the web: colors, layout, animation and responsiveness. It gives this site its Aero look.',
    },
  },
  {
    names: ['Flutter'],
    about: {
      pt: 'Framework do Google para criar interfaces de Android, iOS, web e desktop com Dart. Usado no Diara.',
      en: 'Google’s framework for building Android, iOS, web and desktop interfaces with Dart. Used in Diara.',
    },
  },
  {
    names: ['React'],
    about: {
      pt: 'Biblioteca JavaScript para montar interfaces com componentes reutilizáveis. Este portfólio é feito em React.',
      en: 'A JavaScript library for building interfaces from reusable components. This portfolio is built with React.',
    },
  },
  {
    names: ['Spring'],
    about: {
      pt: 'Framework Java para back-end: APIs REST, injeção de dependências e acesso a banco de dados.',
      en: 'A Java back-end framework: REST APIs, dependency injection and database access.',
    },
  },
  {
    names: ['Electron'],
    about: {
      pt: 'Cria aplicativos desktop com tecnologias web (HTML, CSS e JavaScript). Usado no Aquanauta, meu TCC.',
      en: 'Builds desktop apps with web technologies (HTML, CSS and JavaScript). Used in Aquanauta, my thesis project.',
    },
  },
  {
    names: ['Node.js'],
    about: {
      pt: 'Executa JavaScript fora do navegador: em servidores, scripts e ferramentas de desenvolvimento.',
      en: 'Runs JavaScript outside the browser: on servers, in scripts and in development tools.',
    },
  },
  {
    names: ['Capacitor'],
    about: {
      pt: 'Transforma um app web em aplicativo nativo de Android e iOS, com acesso a recursos do aparelho.',
      en: 'Turns a web app into a native Android and iOS app, with access to device features.',
    },
  },
  {
    names: ['Git'],
    about: {
      pt: 'Controle de versão: guarda o histórico do código e permite trabalhar em ramificações sem perder nada.',
      en: 'Version control: it keeps the history of the code and lets you work on branches without losing anything.',
    },
  },
  {
    names: ['GitHub'],
    about: {
      pt: 'Plataforma que hospeda repositórios Git, com revisão de código, issues e automações.',
      en: 'A platform that hosts Git repositories, with code review, issues and automation.',
    },
  },
  {
    names: ['Docker'],
    about: {
      pt: 'Empacota aplicações em contêineres, para que rodem do mesmo jeito em qualquer máquina.',
      en: 'Packages applications into containers so they run the same way on any machine.',
    },
  },
  {
    names: ['Figma'],
    about: {
      pt: 'Ferramenta de design de interfaces no navegador, para criar layouts, componentes e protótipos.',
      en: 'A browser-based interface design tool for layouts, components and prototypes.',
    },
  },
  {
    names: ['Visual Studio Code'],
    about: {
      pt: 'Editor de código da Microsoft, leve e extensível, com depuração e terminal integrados.',
      en: 'Microsoft’s lightweight, extensible code editor with built-in debugging and terminal.',
    },
  },
  {
    names: ['Claude Code'],
    about: {
      pt: 'Assistente de programação da Anthropic que trabalha no terminal e no editor, lendo e alterando o projeto.',
      en: 'Anthropic’s coding assistant that works in the terminal and editor, reading and changing the project.',
    },
  },
  {
    names: ['OpenAI Codex'],
    about: {
      pt: 'Agente de programação da OpenAI que escreve, revisa e executa tarefas de código.',
      en: 'OpenAI’s coding agent that writes, reviews and runs coding tasks.',
    },
  },
  {
    names: ['ChatGPT'],
    about: {
      pt: 'Assistente de IA conversacional da OpenAI, útil para tirar dúvidas e revisar ideias e textos.',
      en: 'OpenAI’s conversational AI assistant, handy for answering questions and reviewing ideas and text.',
    },
  },
  {
    names: ['Gemini'],
    about: {
      pt: 'Família de modelos de inteligência artificial do Google, também disponível como assistente conversacional.',
      en: 'Google’s family of artificial intelligence models, also available as a conversational assistant.',
    },
  },
  {
    names: ['Firebase'],
    about: {
      pt: 'Plataforma do Google com autenticação, banco de dados (Firestore), hospedagem e notificações. Usado no Diara.',
      en: 'Google’s platform for authentication, database (Firestore), hosting and notifications. Used in Diara.',
    },
  },
  {
    names: ['PostgreSQL'],
    about: {
      pt: 'Banco de dados relacional de código aberto, robusto e fiel ao padrão SQL.',
      en: 'An open-source relational database, robust and faithful to the SQL standard.',
    },
  },
  {
    names: ['localStorage'],
    about: {
      pt: 'Armazenamento do navegador que guarda dados simples no próprio aparelho, sem servidor. Usado no SISTRAFA e aqui, para lembrar suas preferências.',
      en: 'Browser storage that keeps simple data on the device itself, with no server. Used in SISTRAFA and here, to remember your preferences.',
    },
  },
  {
    names: ['Prototipação de interfaces', 'Interface prototyping'],
    about: {
      pt: 'Criar versões navegáveis de uma interface antes de programar, para testar fluxos e ideias com quem vai usar.',
      en: 'Building clickable versions of an interface before coding, to test flows and ideas with the people who will use it.',
    },
  },
  {
    names: ['Responsividade', 'Responsive design'],
    about: {
      pt: 'Fazer a interface se adaptar a qualquer tamanho de tela, do celular ao monitor grande.',
      en: 'Making the interface adapt to any screen size, from phones to large monitors.',
    },
  },
  {
    names: ['Glassmorphism'],
    about: {
      pt: 'Estilo visual com painéis translúcidos e o fundo desfocado por trás, imitando vidro fosco.',
      en: 'A visual style with translucent panels and a blurred background behind them, like frosted glass.',
    },
  },
  {
    names: ['Skeuomorfismo', 'Skeuomorphism'],
    about: {
      pt: 'Design que imita materiais e objetos reais, como vidro, metal e botões em relevo, típico das interfaces dos anos 2000.',
      en: 'Design that imitates real materials and objects, such as glass, metal and raised buttons, typical of 2000s interfaces.',
    },
  },
  {
    names: ['Frutiger Aero'],
    about: {
      pt: 'Estética dos anos 2000 com vidro brilhante, água, céu azul e natureza, a do Windows Vista e 7. Inspirou este portfólio e o Aquanauta.',
      en: 'A 2000s aesthetic of glossy glass, water, blue skies and nature, the look of Windows Vista and 7. It inspired this portfolio and Aquanauta.',
    },
  },
  {
    names: ['Heurísticas de usabilidade', 'Usability heuristics'],
    about: {
      pt: 'Princípios para avaliar interfaces, como os 10 de Nielsen: estado do sistema visível, consistência, prevenção de erros e outros.',
      en: 'Principles for evaluating interfaces, such as Nielsen’s 10: visible system status, consistency, error prevention and more.',
    },
  },
];

const byName = new Map(INFO.flatMap((entry) => entry.names.map((name) => [name, entry.about] as const)));

/** Explicação curta do item (no idioma atual), ou undefined se não houver. */
export function skillInfo(name: string, locale: Locale): string | undefined {
  return byName.get(name)?.[locale];
}
