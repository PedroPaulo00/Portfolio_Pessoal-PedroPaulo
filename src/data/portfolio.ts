/**
 * CONTEÚDO DO PORTFÓLIO — edite aqui.
 *
 * Bilíngue: todo texto corrido é `{ pt: '…', en: '…' }`. O TypeScript recusa
 * texto em uma língua só (nomes próprios iguais nas duas, como "GitHub", podem
 * ser string). O idioma exibido segue o navegador do visitante ou a escolha dele.
 *
 * - URLs opcionais ausentes = botão/link não exibido (nunca "#").
 * - Imagens: coloque arquivos em src/assets/ e importe-os aqui.
 */
import somFundo from '../assets/audio/som-fundo.mp3';
import logo from '../assets/brands/logo.png';
import arquivosIcon from '../assets/desktop/arquivos.png';
import computadorIcon from '../assets/desktop/computador.png';
import cs16Icon from '../assets/desktop/cs16.png';
import lixeiraIcon from '../assets/desktop/lixeira.png';
import minecraftIcon from '../assets/desktop/minecraft.png';
import msnIcon from '../assets/desktop/msn.png';
import theSimsIcon from '../assets/desktop/thesims.png';
import aquanauta1 from '../assets/projetos/aquanauta-1.webp';
import aquanauta2 from '../assets/projetos/aquanauta-2.webp';
import aquanauta3 from '../assets/projetos/aquanauta-3.webp';
import aquanautaThumb from '../assets/projetos/aquanauta-thumb.webp';
import florDigital1 from '../assets/projetos/flor-digital-1.webp';
import florDigital2 from '../assets/projetos/flor-digital-2.webp';
import florDigitalThumb from '../assets/projetos/flor-digital-thumb.webp';
import photo from '../assets/profile/foto.webp';
import type { PortfolioData } from '../types/portfolio';

const florAlt1 = {
  pt: 'Fundo do mar em arte ASCII, com plantas, flores e peixes, e a legenda "Um último mergulho…".',
  en: 'An ASCII-art seabed with plants, flowers and fish, captioned "Um último mergulho…" ("One last dive…").',
};

export const portfolio: PortfolioData<'source'> = {
  profile: {
    name: 'Pedro Paulo de Lima',
    role: {
      pt: 'Desenvolvedor de Software | Graduando em Ciência da Computação',
      en: 'Software Developer | Computer Science Undergraduate',
    },
    tagline: {
      pt: 'Sou graduando em Ciência da Computação pela UNICENTRO, com foco em desenvolvimento web, mobile e experiências digitais. Gosto de criar aplicações que combinem funcionalidade, usabilidade e identidade visual, como o Aquanauta e o FoldAero. Tenho interesse em oportunidades de desenvolvimento de software e em projetos que valorizem a experiência do usuário.',
      en: 'I am a Computer Science undergraduate at UNICENTRO, focused on web and mobile development and digital experiences. I enjoy building applications that combine functionality, usability and visual identity, such as Aquanauta and FoldAero. I am interested in software development opportunities and in projects that value the user experience.',
    },
    logo: { src: logo, alt: { pt: '', en: '' } },
    photo: { src: photo, alt: { pt: 'Foto de Pedro Paulo de Lima', en: 'Photo of Pedro Paulo de Lima' } },
  },

  sections: [
    {
      id: 'inicio',
      label: { pt: 'Início', en: 'Home' },
      description: {
        pt: 'Apresentação e atalhos para o portfólio.',
        en: 'Introduction and shortcuts to the portfolio.',
      },
    },
    {
      id: 'projetos',
      label: { pt: 'Projetos', en: 'Projects' },
      description: { pt: 'Trabalhos acadêmicos e pessoais.', en: 'Academic and personal work.' },
    },
    {
      id: 'sobre',
      label: { pt: 'Sobre', en: 'About' },
      description: {
        pt: 'Formação, trajetória, conquistas e perfil de desenvolvedor.',
        en: 'Education, background, achievements and developer profile.',
      },
    },
    {
      id: 'tecnologias',
      label: { pt: 'Tecnologias', en: 'Technologies' },
      description: {
        pt: 'Linguagens, frameworks e ferramentas com que trabalho.',
        en: 'Languages, frameworks and tools I work with.',
      },
    },
    {
      id: 'spotify',
      label: { pt: 'Spotify', en: 'Spotify' },
      title: { pt: 'O que estou ouvindo', en: 'What I’m listening to' },
      description: {
        pt: 'A música faz parte do meu dia a dia. Acompanhe o que estou escutando agora!',
        en: 'Music is part of my everyday life. See what I’m listening to right now!',
      },
    },
    {
      id: 'contato',
      label: { pt: 'Contato', en: 'Contact' },
      description: { pt: 'E-mail, GitHub e redes.', en: 'Email, GitHub and social media.' },
    },
  ],

  projects: [
    {
      id: 'aquanauta',
      name: { pt: 'Aquanauta (TCC)', en: 'Aquanauta (Undergraduate thesis)' },
      category: 'academico',
      summary: {
        pt: 'Aplicação desktop de bem-estar digital criada no meu TCC para incentivar hábitos saudáveis durante o uso prolongado do computador. Reúne monitoramento de atividade, ciclos Pomodoro e lembretes de hidratação, alongamento, descanso ocular e organização da rotina.',
        en: 'A digital well-being desktop app built for my undergraduate thesis to encourage healthy habits during long computer sessions. It combines activity monitoring, Pomodoro cycles and reminders for hydration, stretching, eye rest and daily routine.',
      },
      stack: ['Electron', 'JavaScript', 'HTML5', 'CSS3', 'Node.js', 'localStorage'],
      status: 'concluido',
      repositoryUrl: 'https://github.com/PedroPaulo00/TCC_AQUANAUTA',
      demoUrl: 'https://tcc-aquanauta.vercel.app/',
      thumbnail: {
        src: aquanautaThumb,
        alt: {
          pt: 'Capturas do Aquanauta: janela principal, cadastro de medicamento e notificação de hidratação.',
          en: 'Aquanauta screenshots: main window, medication form and hydration notification.',
        },
      },
      gallery: [
        {
          src: aquanauta1,
          alt: {
            pt: 'Janela principal do Aquanauta, com o mascote, o temporizador Pomodoro e os lembretes de hidratação, alongamento e descanso dos olhos.',
            en: 'Aquanauta main window, with the mascot, the Pomodoro timer and the hydration, stretching and eye-rest reminders.',
          },
        },
        {
          src: aquanauta2,
          alt: {
            pt: 'Janela "Adicionar Medicamento", com nome, dose, horários, dias da semana e observações.',
            en: '"Add Medication" window, with name, dose, times, weekdays and notes.',
          },
        },
        {
          src: aquanauta3,
          alt: {
            pt: 'Notificação de hidratação: "Hora de beber água! Mantenha-se hidratado."',
            en: 'Hydration notification: "Time to drink water! Stay hydrated."',
          },
        },
      ],
      details: {
        pt: 'Projeto de TCC em Ciência da Computação na UNICENTRO, desenvolvido com arquitetura Electron e módulos JavaScript independentes. Integra monitoramento de atividade, notificações contextuais, Pomodoro configurável, agenda, controle de medicamentos e mascote interativa. A interface utiliza gradientes, transparências e animações inspirados no Frutiger Aero e no Windows Vista/7. Os dados são mantidos localmente, sem depender de conexão. O desenvolvimento foi incremental e incluiu testes manuais e uma inspeção heurística individual baseada nas dez heurísticas de Nielsen; testes com usuários reais ficaram como possibilidade futura.',
        en: 'Undergraduate thesis project in Computer Science at UNICENTRO, built on an Electron architecture with independent JavaScript modules. It brings together activity monitoring, contextual notifications, a configurable Pomodoro timer, a planner, medication tracking and an interactive mascot. The interface uses gradients, transparency and animations inspired by Frutiger Aero and Windows Vista/7. All data is stored locally, with no need for a connection. Development was incremental and included manual testing and an individual heuristic evaluation based on Nielsen’s ten heuristics; testing with real users was left as future work.',
      },
    },
    {
      id: 'foldaero',
      name: 'FoldAero',
      category: 'pessoal',
      summary: {
        pt: 'Galeria de fotos, vídeos e GIFs para Android e iOS, com interface inspirada nos Windows XP, Vista e 7. O projeto busca unir organização de mídia, privacidade local e uma experiência visual nostálgica.',
        en: 'A photo, video and GIF gallery for Android and iOS, with an interface inspired by Windows XP, Vista and 7. The project combines media organization, local privacy and a nostalgic visual experience.',
      },
      stack: [
        'JavaScript',
        'HTML5',
        'CSS3',
        'Capacitor',
        'Android',
        'iOS',
        { pt: 'Plugin nativo próprio', en: 'Custom native plugin' },
      ],
      status: 'em-andamento',
      repositoryUrl: 'https://github.com/PedroPaulo00/FoldAero',
      details: {
        pt: 'Primeiro aplicativo da AquariusFresh Lab, projeto independente de desenvolvimento de software. O app organiza mídias armazenadas no próprio dispositivo, sem enviá-las para servidores. Utiliza Capacitor para combinar interface web e recursos nativos: leitura da galeria, criação de miniaturas, abertura de vídeos, renomeação e exclusão com confirmação do sistema. O desafio central é conciliar as diferenças entre Android e iOS com uma interface responsiva, funcional e inspirada no Frutiger Aero.',
        en: 'The first app from AquariusFresh Lab, an independent software development project. The app organizes media stored on the device itself, without uploading it to servers. It uses Capacitor to combine a web interface with native features: reading the gallery, generating thumbnails, opening videos, and renaming and deleting with system confirmation. The core challenge is reconciling the differences between Android and iOS with a responsive, functional interface inspired by Frutiger Aero.',
      },
    },
    {
      id: 'flordigital',
      name: 'Flor Digital',
      category: 'pessoal',
      summary: {
        pt: 'Projeto criativo na web com elementos visuais e animações de inspiração aquática, baseado em uma experiência interativa com arte e texto. Explora programação front-end como forma de expressão visual.',
        en: 'A creative web project with ocean-inspired visuals and animations, built as an interactive experience with art and text. It explores front-end programming as a form of visual expression.',
      },
      stack: ['HTML5', 'CSS3', 'JavaScript', 'Canvas'],
      status: 'concluido',
      repositoryUrl: 'https://github.com/PedroPaulo00/FlorDigital_s2',
      demoUrl: 'https://a-noite-estrelada.vercel.app/',
      thumbnail: { src: florDigitalThumb, alt: florAlt1 },
      gallery: [
        { src: florDigital1, alt: florAlt1 },
        {
          src: florDigital2,
          alt: {
            pt: 'Oceano em arte ASCII com peixes e a frase "Não sei desenhar o oceano, mas sei programar um pra você."',
            en: 'An ASCII-art ocean with fish and the line "Não sei desenhar o oceano, mas sei programar um pra você." ("I can’t draw the ocean, but I can code one for you.")',
          },
        },
      ],
      details: {
        pt: 'Projeto recreativo que explora composição de cenas, tipografia monoespaçada, transições, animações e conteúdo desenhado em Canvas. Demonstra interesse por interfaces personalizadas e pela combinação de design e programação além de aplicações utilitárias.',
        en: 'A playful project that explores scene composition, monospaced typography, transitions, animations and content drawn on Canvas. It shows an interest in custom interfaces and in combining design and programming beyond utility apps.',
      },
    },
  ],

  about: {
    paragraphs: [
      {
        pt: 'Meu interesse por tecnologia começou na infância e foi fortalecido pelo exemplo da minha irmã, doutora e professora de Ciência da Computação. Ao longo da graduação na UNICENTRO, explorei diferentes áreas da Computação e me identifiquei principalmente com desenvolvimento web, mobile e design de interfaces. No meu TCC, desenvolvi o Aquanauta, uma aplicação desktop de bem-estar digital que reúne monitoramento de atividade, lembretes, organização da rotina e uma interface inspirada no Frutiger Aero.',
        en: 'My interest in technology began in childhood and grew stronger through the example of my sister, who holds a PhD and teaches Computer Science. Throughout my degree at UNICENTRO I explored different areas of computing and connected most with web and mobile development and interface design. For my undergraduate thesis I built Aquanauta, a digital well-being desktop app that brings together activity monitoring, reminders, routine planning and a Frutiger Aero-inspired interface.',
      },
      {
        pt: 'Costumo desenvolver de forma iterativa: planejo a estrutura, implemento por funcionalidades, testo e refino a experiência até alcançar um resultado consistente. Valorizo organização do código, manutenção, responsividade, atenção à interface e decisões técnicas que resolvam problemas reais. Também utilizo ferramentas de IA como apoio ao desenvolvimento, mantendo o foco em compreender, revisar e validar as soluções.',
        en: 'I work iteratively: I plan the structure, build feature by feature, then test and refine the experience until the result is consistent. I value well-organized, maintainable code, responsiveness, attention to the interface and technical decisions that solve real problems. I also use AI tools to support development, while staying focused on understanding, reviewing and validating the solutions.',
      },
    ],
    education: {
      course: {
        pt: 'Bacharelado em Ciência da Computação — Universidade Estadual do Centro-Oeste (UNICENTRO)',
        en: 'Bachelor’s degree in Computer Science — Universidade Estadual do Centro-Oeste (UNICENTRO), Brazil',
      },
      stage: {
        pt: '4º ano da graduação · previsão de conclusão: julho de 2027',
        en: '4th year · expected graduation: July 2027',
      },
    },
    highlights: [
      { pt: 'Estágio na área de TI — Campo Real (2024)', en: 'IT internship — Campo Real (2024)' },
      {
        pt: 'Campeão paranaense da Olimpíada Brasileira de Robótica (OBR), 2013',
        en: 'Paraná state champion, Brazilian Robotics Olympiad (OBR), 2013',
      },
      { pt: '8º lugar na etapa nacional da OBR, 2013', en: '8th place in the OBR national stage, 2013' },
      {
        pt: 'Desenvolvimento do Aquanauta como TCC em Ciência da Computação',
        en: 'Built Aquanauta as my Computer Science undergraduate thesis',
      },
    ],
    interests: [
      { pt: 'UI/UX e Interação Humano-Computador', en: 'UI/UX and Human-Computer Interaction' },
      { pt: 'Desenvolvimento web', en: 'Web development' },
      { pt: 'Desenvolvimento mobile', en: 'Mobile development' },
      { pt: 'Aplicações desktop', en: 'Desktop applications' },
      { pt: 'Design responsivo', en: 'Responsive design' },
      { pt: 'Inteligência artificial aplicada ao desenvolvimento', en: 'AI applied to software development' },
      {
        pt: 'Interfaces skeuomórficas, Frutiger Aero e glassmorphism',
        en: 'Skeuomorphic interfaces, Frutiger Aero and glassmorphism',
      },
    ],
    languages: [
      { pt: 'Português (nativo)', en: 'Portuguese (native)' },
      { pt: 'Inglês (fluente)', en: 'English (fluent)' },
      { pt: 'Espanhol (compreensão)', en: 'Spanish (reading and listening)' },
    ],
  },

  skills: [
    {
      title: { pt: 'Linguagens', en: 'Languages' },
      items: ['JavaScript', 'TypeScript', 'Dart', 'Java', 'Python', 'C', 'C++', 'HTML5', 'CSS3'],
    },
    {
      title: { pt: 'Frameworks e bibliotecas', en: 'Frameworks and libraries' },
      items: ['Flutter', 'React', 'Spring', 'Electron', 'Node.js', 'Capacitor'],
    },
    {
      title: { pt: 'Ferramentas', en: 'Tools' },
      items: [
        'Git',
        'GitHub',
        'Docker',
        'Figma',
        'Visual Studio Code',
        'Claude Code',
        'OpenAI Codex',
        'ChatGPT',
        'Gemini',
      ],
    },
    {
      title: { pt: 'Bancos de dados e infraestrutura', en: 'Databases and infrastructure' },
      items: ['Firebase', 'PostgreSQL', 'localStorage'],
    },
    {
      title: { pt: 'Design e IHC', en: 'Design and HCI' },
      items: [
        { pt: 'Prototipação de interfaces', en: 'Interface prototyping' },
        { pt: 'Responsividade', en: 'Responsive design' },
        'Glassmorphism',
        { pt: 'Skeuomorfismo', en: 'Skeuomorphism' },
        'Frutiger Aero',
        { pt: 'Heurísticas de usabilidade', en: 'Usability heuristics' },
      ],
    },
  ],

  contact: {
    intro: {
      pt: 'Tenho interesse em oportunidades e colaborações em desenvolvimento web, mobile e aplicações desktop, especialmente projetos que unam tecnologia e experiência do usuário. Entre em contato para conversar sobre ideias, projetos ou oportunidades.',
      en: 'I am interested in opportunities and collaborations in web, mobile and desktop development, especially projects that bring technology and user experience together. Get in touch to talk about ideas, projects or opportunities.',
    },
    email: 'pppedro95@gmail.com',
    secondaryEmail: 'pedropaulo0720@outlook.com',
    // Sem `url`, o canal não aparece. Falta: LinkedIn e currículo (veja docs/Pendencias_Futuras.docx).
    links: [
      { label: 'GitHub', url: 'https://github.com/PedroPaulo00' },
      { label: 'Instagram', url: 'https://www.instagram.com/pedropaulo.mp3/' },
      { label: 'LinkedIn' },
      { label: { pt: 'Currículo (PDF)', en: 'Résumé (PDF)' } },
    ],
  },

  // Perfil e atividade do Spotify, servidos pela função /api/spotify (veja docs/GUIA.md).
  // Público: perfil, tocando agora, últimas músicas e mais ouvidos do mês.
  spotify: {
    enabled: true,
    endpoint: '/api/spotify',
    refreshSeconds: 30,
    showPlaylists: false,
    showFollowers: false,
  },

  // Som de fundo (som-fundo.mp3, arquivo inteiro em loop). O loop começa em 0,14 s
  // para pular o silêncio que o codificador MP3 põe no início (sem pausa a cada volta).
  sound: {
    src: somFundo,
    loop: [0.14, 98.35],
    defaultVolume: 50,
  },

  // Ícones da área de trabalho (coluna à esquerda, telas ≥ 1024 px). Sem `href`,
  // o ícone é só cenário. Para torná-lo clicável, informe uma URL ou '#secao'.
  // Ícones com `image` usam a imagem própria no lugar do desenho de `kind`.
  // As imagens saem de src/assets/originais/ via `npm run images`.
  desktopIcons: [
    { id: 'lixeira', label: { pt: 'Lixeira', en: 'Recycle Bin' }, kind: 'lixeira', image: lixeiraIcon },
    { id: 'computador', label: { pt: 'Meu computador', en: 'Computer' }, kind: 'computador', image: computadorIcon },
    { id: 'arquivos', label: { pt: 'Arquivos', en: 'Files' }, kind: 'arquivos', image: arquivosIcon },
    { id: 'msn', label: 'MSN', kind: 'template', image: msnIcon },
    { id: 'the-sims-2', label: 'The Sims 2', kind: 'template', image: theSimsIcon },
    { id: 'cs-16', label: 'CS 1.6', kind: 'template', image: cs16Icon },
    { id: 'minecraft', label: 'Minecraft', kind: 'template', image: minecraftIcon },
  ],
};
