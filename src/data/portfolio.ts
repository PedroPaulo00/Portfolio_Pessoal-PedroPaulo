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
import somFundo from '../assets/audio/som_fundo_novo.mp3';
import logo from '../assets/brands/logo.png';
import arquivosIcon from '../assets/desktop/arquivos.png';
import bonziIcon from '../assets/desktop/bonzi.png';
import bonziSurf from '../assets/desktop/bonzi-surf.webp';
import clippyAssistant from '../assets/desktop/clippy-assistente.webp';
import clippyIcon from '../assets/desktop/clippy.png';
import computadorIcon from '../assets/desktop/computador.png';
import cs16Icon from '../assets/desktop/cs16.png';
import lixeiraContent from '../assets/desktop/lixeira-conteudo.webp';
import lixeiraIcon from '../assets/desktop/lixeira.png';
import mediaPlayerIcon from '../assets/desktop/media-player.png';
import mediaPlayerVideo1 from '../assets/video/media-player-1.mp4';
import mediaPlayerVideo2 from '../assets/video/media-player-2.mp4';
import mediaPlayerVideo3 from '../assets/video/media-player-3.mp4';
import mediaPlayerVideo4 from '../assets/video/media-player-4.mp4';
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
import fotoTcc from '../assets/profile/foto-tcc.webp';
import aquanautaLogo from '../assets/projetos/logos/aquanauta.png';
import diaraLogo from '../assets/projetos/logos/diara.png';
import foldaeroLogo from '../assets/projetos/logos/foldaero.png';
import sistrafaLogo from '../assets/projetos/logos/sistrafa.png';
// TEMPLATE: logo provisório até o Flor Digital ter o seu (troque o import).
import florDigitalLogo from '../assets/projetos/logos/template.png';
import sistrafa1 from '../assets/projetos/sistrafa-1.webp';
import sistrafa2 from '../assets/projetos/sistrafa-2.webp';
import sistrafa3 from '../assets/projetos/sistrafa-3.webp';
import sistrafa4 from '../assets/projetos/sistrafa-4.webp';
import sistrafa5 from '../assets/projetos/sistrafa-5.webp';
import sistrafaThumb from '../assets/projetos/sistrafa-thumb.webp';
import type { PortfolioData } from '../types/portfolio';

const florAlt1 = {
  pt: 'Fundo do mar em arte ASCII, com plantas, flores e peixes, e a legenda "Um último mergulho…".',
  en: 'An ASCII-art seabed with plants, flowers and fish, captioned "Um último mergulho…" ("One last dive…").',
};

export const portfolio: PortfolioData<'source'> = {
  profile: {
    name: 'Pedro Paulo de Lima',
    role: {
      pt: 'Desenvolvedor de Sites e Aplicativos | Graduando em Ciência da Computação',
      en: 'Web & App Developer | Computer Science Undergraduate',
    },
    tagline: {
      pt: 'Estudo Ciência da Computação na UNICENTRO e crio sites e aplicativos. Gosto muito de fazer sites e landing pages para profissionais e pequenos negócios, como consultórios médicos e lojas: páginas bonitas, rápidas e fáceis de usar no celular, que apresentem bem o seu trabalho. Também desenvolvo aplicativos com identidade visual própria, como o Aquanauta e o FoldAero, e este portfólio é um exemplo do cuidado que coloco em cada projeto.',
      en: 'I’m studying Computer Science at UNICENTRO and I build websites and apps. I especially enjoy making websites and landing pages for professionals and small businesses, like medical practices and shops: good-looking, fast pages that are easy to use on a phone and present your work well. I also build apps with their own visual identity, like Aquanauta and FoldAero, and this portfolio is an example of the care I put into every project.',
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
        pt: 'Música é a minha maior paixão e está presente em todos os meus dias. Veja o que estou ouvindo agora!',
        en: 'Music is my biggest passion and it’s part of every single day. See what I’m listening to right now!',
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
      logo: aquanautaLogo,
      color: '#1fa89a', // cor mais presente no logo/capturas: tinge o fundo do card
      name: { pt: 'Aquanauta (TCC)', en: 'Aquanauta (Undergraduate thesis)' },
      category: 'academico',
      summary: {
        pt: 'Aplicativo desktop de bem-estar digital que criei no meu TCC para incentivar hábitos saudáveis em quem passa muito tempo no computador. Reúne monitoramento de atividade, ciclos Pomodoro e lembretes de hidratação, alongamento, descanso dos olhos e organização da rotina.',
        en: 'A digital well-being desktop app built for my undergraduate thesis to encourage healthy habits during long computer sessions. It combines activity monitoring, Pomodoro cycles and reminders for hydration, stretching, eye rest and daily routine.',
      },
      stack: ['Electron', 'JavaScript', 'HTML5', 'CSS3', 'Node.js', 'localStorage'],
      status: 'concluido',
      // Artigo do TCC (Google Drive): o botão pede confirmação antes de abrir.
      articleUrl: 'https://drive.google.com/file/d/1U15mf-N3OZpTMGDtZW2CBChxeqQ5ujMi/view',
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
        pt: 'Projeto de TCC em Ciência da Computação na UNICENTRO, desenvolvido com arquitetura Electron e módulos JavaScript independentes. Integra monitoramento de atividade, notificações contextuais, Pomodoro configurável, agenda, controle de medicamentos e mascote interativa.\n\nA interface usa gradientes, transparências e animações inspirados no Frutiger Aero e no Windows Vista/7. Os dados ficam guardados no próprio computador, sem precisar de internet.\n\nFui desenvolvendo aos poucos, com testes manuais e uma avaliação heurística feita por mim, baseada nas dez heurísticas de Nielsen. Os testes com usuários reais ficam para uma próxima etapa.',
        en: 'Undergraduate thesis project in Computer Science at UNICENTRO, built on an Electron architecture with independent JavaScript modules. It brings together activity monitoring, contextual notifications, a configurable Pomodoro timer, a planner, medication tracking and an interactive mascot.\n\nThe interface uses gradients, transparency and animations inspired by Frutiger Aero and Windows Vista/7. All data is stored locally, so no internet connection is needed.\n\nI built it step by step, with manual testing and a heuristic evaluation I ran myself, based on Nielsen’s ten heuristics. Testing with real users is left for a next stage.',
      },
    },
    {
      id: 'sistrafa',
      logo: sistrafaLogo,
      color: '#14c98c', // cor mais presente no logo/capturas: tinge o fundo do card
      name: { pt: 'SISTRAFA (Estágio-Pesquisa)', en: 'SISTRAFA (Research internship)' },
      category: 'academico',
      summary: {
        pt: 'Aplicação web progressiva (PWA) do meu estágio-pesquisa para apoiar policiais e bombeiros no atendimento a ocorrências com fauna silvestre: triagem de risco passo a passo, orientações de manejo justificadas, registro fotográfico e relatório em PDF, tudo funcionando sem internet.',
        en: 'A progressive web app (PWA) from my research internship that supports police officers and firefighters handling wildlife incidents: step-by-step risk triage, justified handling guidance, photo records and a PDF report, all working offline.',
      },
      stack: [
        'HTML5',
        'CSS3',
        'JavaScript',
        'PWA',
        'Service Worker',
        'IndexedDB',
        'localStorage',
        'jsPDF',
        { pt: 'API do iNaturalist', en: 'iNaturalist API' },
      ],
      status: 'em-andamento',
      thumbnail: {
        src: sistrafaThumb,
        alt: {
          pt: 'Telas do SISTRAFA: início, pergunta da avaliação de risco, checklist operacional e ficha da jararaca no guia de fauna.',
          en: 'SISTRAFA screens: home, a risk-assessment question, the operational checklist and the jararaca entry in the wildlife guide.',
        },
      },
      gallery: [
        {
          src: sistrafa1,
          alt: {
            pt: 'Tela inicial com o atalho "Situação de risco", o botão "Nova ocorrência" e os acessos ao guia, contatos e perfil.',
            en: 'Home screen with the "Risk situation" shortcut, the "New incident" button and links to the guide, contacts and profile.',
          },
        },
        {
          src: sistrafa2,
          alt: {
            pt: 'Avaliação de risco: uma pergunta por vez, com orientação de segurança destacada conforme a resposta.',
            en: 'Risk assessment: one question at a time, with safety guidance highlighted according to the answer.',
          },
        },
        {
          src: sistrafa3,
          alt: {
            pt: 'Checklist operacional da avaliação inicial e da segurança da equipe, baseado em protocolo de atuação policial.',
            en: 'Operational checklist for the initial assessment and team safety, based on a police field protocol.',
          },
        },
        {
          src: sistrafa4,
          alt: {
            pt: 'Ficha da jararaca no guia de fauna, com nível de risco, como reconhecer e cuidados no manejo.',
            en: 'Jararaca (lancehead viper) entry in the wildlife guide, with risk level, identification tips and handling precautions.',
          },
        },
        {
          src: sistrafa5,
          alt: {
            pt: 'Orientações apresentadas na revisão da ocorrência, cada uma com a justificativa ("Por quê").',
            en: 'Guidance shown when reviewing the incident, each with its justification ("Why").',
          },
        },
      ],
      details: {
        pt: 'Estágio-pesquisa do curso de Ciência da Computação da UNICENTRO, em parceria com o Laboratório de Anatomia Patológica Veterinária. Ocorrências com animais silvestres costumam ser atendidas por agentes sem formação em manejo de fauna, muitas vezes em locais sem conexão.\n\nO SISTRAFA organiza o atendimento em oito etapas, com perguntas condicionais apresentadas uma por vez, um checklist baseado em protocolo de atuação policial e 22 regras que geram orientações acompanhadas de justificativa. Permite cadastrar animais individuais ou em lotes, registrar fotografias com metadados Exif, código SHA-256 e histórico de alterações (preservando o arquivo original), consultar um guia de 29 espécies complementado pela API do iNaturalist e gerar o relatório em PDF no próprio aparelho.\n\nFoi feito em HTML, CSS e JavaScript puros, sem servidor de dados, com Service Worker, localStorage e IndexedDB para funcionar sem internet.\n\nA avaliação usou testes automatizados no Chrome, Edge e Firefox (persistência, uso sem conexão, relatórios, leiaute em oito tamanhos de tela e contraste); a validação do conteúdo por especialistas e os testes em campo são as próximas etapas. O trabalho resultou em um artigo científico.',
        en: 'Research internship in the Computer Science program at UNICENTRO, in partnership with the Veterinary Pathology Laboratory. Wildlife incidents are often handled by officers with no training in animal handling, frequently in places without a connection.\n\nSISTRAFA organizes each incident into eight steps, with conditional questions shown one at a time, a checklist based on a police field protocol and 22 rules that produce guidance together with its justification. It records individual animals or batches, stores photos with Exif metadata, a SHA-256 hash and a change history (keeping the original file), includes a guide to 29 species complemented by the iNaturalist API, and generates the PDF report on the device.\n\nIt is built with plain HTML, CSS and JavaScript, with no data server, using a Service Worker, localStorage and IndexedDB to work offline.\n\nEvaluation used automated tests in Chrome, Edge and Firefox (persistence, offline use, reports, layout at eight screen sizes and contrast); content validation by specialists and field testing are the next steps. The work resulted in a scientific paper.',
      },
    },
    {
      id: 'diara',
      logo: diaraLogo,
      color: '#1e9bf0', // cor mais presente no logo/capturas: tinge o fundo do card
      name: 'Diara (PET-Saúde Digital - GT04)',
      category: 'academico',
      summary: {
        pt: 'Aplicativo para monitoramento e controle da glicose e do diabetes, desenvolvido em equipe no PET-Saúde Digital (GT 04). Reúne o registro de medições, refeições e medicamentos, gráficos e lembretes para acompanhar o tratamento no dia a dia.',
        en: 'An app for monitoring and managing blood glucose and diabetes, built as a team in the PET-Saúde Digital program (GT 04). It brings together glucose readings, meals and medication, charts and reminders to follow the treatment day to day.',
      },
      stack: [
        'Flutter',
        'Dart',
        'Firebase Authentication',
        'Cloud Firestore',
        'fl_chart',
        { pt: 'Notificações locais', en: 'Local notifications' },
        { pt: 'Widget de tela inicial', en: 'Home-screen widget' },
      ],
      status: 'em-andamento',
      details: {
        pt: 'Projeto do Grupo Tutorial 04 do PET-Saúde Digital, desenvolvido em Flutter com Firebase (autenticação e Cloud Firestore). O app permite registrar medições de glicose, refeições, medicamentos e anotações; acompanhar o histórico e gráficos de evolução; configurar lembretes com notificações; e exportar os dados em CSV e PDF para compartilhar com profissionais de saúde.\n\nMinhas contribuições incluem o widget de tela inicial com a última medição de glicose, o login com Google e por SMS e a nova identidade do aplicativo, com o nome Diara e o logotipo.',
        en: 'A project from Tutorial Group 04 of the PET-Saúde Digital program, built with Flutter and Firebase (authentication and Cloud Firestore). The app records glucose readings, meals, medication and notes; shows history and trend charts; schedules reminders with notifications; and exports data as CSV and PDF to share with health professionals.\n\nMy contributions include the home-screen widget showing the latest glucose reading, sign-in with Google and by SMS, and the app’s new identity, with the Diara name and logo.',
      },
    },
    {
      id: 'foldaero',
      logo: foldaeroLogo,
      color: '#79b829', // cor mais presente no logo/capturas: tinge o fundo do card
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
        pt: 'Primeiro aplicativo da AquariusFresh Lab, projeto independente de desenvolvimento de software. O app organiza mídias armazenadas no próprio dispositivo, sem enviá-las para servidores. Usa o Capacitor para combinar interface web e recursos nativos: leitura da galeria, criação de miniaturas, abertura de vídeos, renomeação e exclusão com confirmação do sistema.\n\nO maior desafio é conciliar as diferenças entre Android e iOS numa interface responsiva, funcional e inspirada no Frutiger Aero.',
        en: 'The first app from AquariusFresh Lab, an independent software development project. The app organizes media stored on the device itself, without uploading it to servers. It uses Capacitor to combine a web interface with native features: reading the gallery, generating thumbnails, opening videos, and renaming and deleting with system confirmation.\n\nThe biggest challenge is reconciling the differences between Android and iOS in a responsive, functional interface inspired by Frutiger Aero.',
      },
    },
    {
      id: 'flordigital',
      logo: florDigitalLogo,
      color: '#1b2a44', // cor mais presente no logo/capturas: tinge o fundo do card
      name: 'Flor Digital',
      category: 'pessoal',
      summary: {
        pt: 'Projeto criativo na web, com visuais e animações de inspiração aquática, que funciona como uma experiência interativa de arte e texto. Explora a programação front-end como forma de expressão visual.',
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
        pt: 'Projeto feito por diversão, que explora composição de cenas, tipografia monoespaçada, transições, animações e desenhos em Canvas. Mostra o meu interesse por interfaces personalizadas e por unir design e programação, indo além dos aplicativos utilitários.',
        en: 'A project made for fun that explores scene composition, monospaced typography, transitions, animations and drawings on Canvas. It shows my interest in custom interfaces and in combining design and programming, going beyond utility apps.',
      },
    },
  ],

  about: {
    paragraphs: [
      {
        pt: 'Meu interesse por tecnologia começou na infância e ganhou força com o exemplo da minha irmã, doutora e professora de Ciência da Computação. Durante a graduação na UNICENTRO, passei por várias áreas da Computação e me identifiquei mais com a criação de sites, o desenvolvimento de aplicativos e o design de interfaces. No TCC, criei o Aquanauta, um aplicativo desktop de bem-estar digital com monitoramento de atividade, lembretes, organização da rotina e uma interface inspirada no Frutiger Aero.',
        en: 'My interest in technology started in childhood and grew with the example of my sister, who has a PhD and teaches Computer Science. During my degree at UNICENTRO I tried out different areas of computing and connected most with building websites, developing apps and interface design. For my thesis I built Aquanauta, a digital well-being desktop app with activity monitoring, reminders, routine planning and a Frutiger Aero-inspired interface.',
      },
      {
        pt: 'Costumo trabalhar por etapas: planejo a estrutura, construo funcionalidade por funcionalidade, testo e vou refinando até o resultado ficar consistente. Dou valor a código organizado e fácil de manter, à responsividade, a uma interface bem cuidada e a decisões técnicas que resolvam problemas reais. Também uso ferramentas de IA como apoio, sempre me preocupando em entender, revisar e validar o que elas sugerem. Num site, penso em quem vai visitar: a informação certa logo de cara, um visual que combine com o negócio e um caminho fácil até o contato, seja pelo WhatsApp, por um agendamento ou pelo endereço no mapa.',
        en: 'I like to work in steps: I plan the structure, build feature by feature, then test and refine until the result feels consistent. I care about clean, maintainable code, responsiveness, a well-crafted interface and technical decisions that solve real problems. I also use AI tools as support, always making sure I understand, review and validate what they suggest. On a website, I think about the visitor: the right information up front, a look that fits the business and an easy path to getting in touch, whether by WhatsApp, a booking or the address on a map.',
      },
      {
        pt: 'Fora do código, minha maior paixão é a música: ela está comigo em quase tudo o que faço, inclusive enquanto programo. Por isso este portfólio tem uma seção com o que ando ouvindo no Spotify.',
        en: 'Outside of code, my biggest passion is music: it’s with me in almost everything I do, including while I program. That’s why this portfolio has a section showing what I’ve been listening to on Spotify.',
      },
    ],
    // Ficha rápida (cartão no topo do Sobre). Item sem `value` não aparece:
    // preencha onde nasceu e onde mora quando quiser mostrar.
    facts: [
      {
        kind: 'born',
        label: { pt: 'Natural de', en: 'Hometown' },
        value: { pt: 'Guarapuava, Paraná - Brasil', en: 'Guarapuava, Paraná - Brazil' },
      },
      {
        kind: 'study',
        label: { pt: 'Estudo', en: 'Studying' },
        value: { pt: 'Ciência da Computação na UNICENTRO', en: 'Computer Science at UNICENTRO' },
      },
      {
        kind: 'focus',
        label: { pt: 'Foco', en: 'Focus' },
        value: {
          pt: 'Sites, landing pages, aplicativos e design de interfaces',
          en: 'Websites, landing pages, apps and interface design',
        },
      },
      {
        kind: 'languages',
        label: { pt: 'Idiomas', en: 'Languages' },
        value: { pt: 'Português, inglês e espanhol', en: 'Portuguese, English and Spanish' },
      },
      {
        kind: 'passion',
        label: { pt: 'Maior paixão', en: 'Greatest passion' },
        value: { pt: 'Música', en: 'Music' },
      },
    ],
    // Carrossel de fotos do Sobre. Vazio = vagas "foto em breve". Para adicionar:
    // coloque a imagem em src/assets/, importe no topo e acrescente { src, alt }.
    photos: [],
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
      { pt: 'Criação de sites e landing pages', en: 'Websites and landing pages' },
      { pt: 'Desenvolvimento mobile', en: 'Mobile development' },
      { pt: 'Aplicações desktop', en: 'Desktop applications' },
      { pt: 'Design responsivo', en: 'Responsive design' },
      { pt: 'Nostalgia Digital', en: 'Digital nostalgia' },
      { pt: 'Inteligência artificial aplicada ao desenvolvimento', en: 'AI applied to software development' },
      {
        pt: 'Interfaces skeuomórficas, Frutiger Aero e glassmorphism',
        en: 'Skeuomorphic interfaces, Frutiger Aero and glassmorphism',
      },
    ],
    languages: [
      { flag: 'br', label: { pt: 'Português (nativo)', en: 'Portuguese (native)' } },
      { flag: 'us', label: { pt: 'Inglês (fluente)', en: 'English (fluent)' } },
      { flag: 'es', label: { pt: 'Espanhol (compreensão)', en: 'Spanish (reading and listening)' } },
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
      pt: 'Precisa de um site ou de uma landing page para o seu consultório, loja ou negócio? Faço páginas sob medida, bonitas, rápidas e pensadas para o celular. Também tenho interesse em oportunidades e parcerias em desenvolvimento de sites e aplicativos. Me chame para conversar sobre a sua ideia!',
      en: 'Need a website or a landing page for your practice, shop or business? I build custom pages that look good, load fast and are designed for phones. I’m also interested in opportunities and collaborations in website and app development. Reach out to talk about your idea!',
    },
    email: 'pppedro95@gmail.com',
    secondaryEmail: 'pedropaulo0720@outlook.com',
    // Sem `url`, o canal não aparece. Falta: LinkedIn e currículo (veja docs/Pendencias_Futuras.docx).
    links: [
      { label: 'WhatsApp', url: 'https://wa.me/5542998665139', display: '+55 (42) 9 9866-5139' },
      { label: 'GitHub', url: 'https://github.com/PedroPaulo00' },
      { label: 'Instagram', url: 'https://www.instagram.com/pedropaulo.mp3/' },
      // Facebook: quando o perfil existir, troque `soon: true` por url: 'https://facebook.com/...'.
      { label: 'Facebook', soon: true },
      { label: 'LinkedIn' },
      { label: { pt: 'Currículo (PDF)', en: 'Résumé (PDF)' } },
    ],
  },

  // Perfil e atividade do Spotify, servidos pela função /api/spotify (veja docs/GUIA.md).
  // Público: perfil, tocando agora, últimas músicas e o meu top 10 (preferidos, escolhidos à mão).
  // Destaque com foto no Início: a apresentação do TCC.
  featured: {
    image: {
      src: fotoTcc,
      alt: {
        pt: 'Pedro Paulo de Lima em pé diante da projeção com o título do TCC, Aquanauta, durante a apresentação',
        en: 'Pedro Paulo de Lima standing in front of the projected title of his thesis, Aquanauta, during the presentation',
      },
    },
    title: { pt: 'Apresentação do meu TCC', en: 'Presenting my thesis' },
    text: {
      pt: 'Apresentando o Aquanauta, um aplicativo de bem-estar digital que cuida da saúde de quem passa muito tempo no computador, no curso de Ciência da Computação da UNICENTRO.',
      en: 'Presenting Aquanauta, a digital well-being app that looks after the health of people who spend long hours at the computer, in the Computer Science program at UNICENTRO.',
    },
  },

  spotify: {
    enabled: true,
    endpoint: '/api/spotify',
    refreshSeconds: 30,
    showPlaylists: false,
    showFollowers: false,
    // Meu top 10 (aba Spotify): cole os links do Spotify (Compartilhar → Copiar
    // link), na ordem. Vazio = 10 vagas "em breve".
    favorites: {
      endpoint: '/api/spotify-favorites',
      // Ordem: 1 a 10. SOJOURN, Mimesis, Last of a Dying Breed, Center Mass,
      // Man of the Year, Bad Omens, CAROUSEL, California, LMLY e REDRED.
      tracks: [
        '3xXJHuTxbSF69tfqg061iT',
        '0nLkVbVlIYIPsCTUYYiOuu',
        '7b9FXvaDafdfqKuoq9ai5Q',
        '2BHSRlGgJwzTPfYvAax28m',
        '6shJnGf3t1jV284X9wY0uV',
        '6QcOEPC0bX799hITIgj3vU',
        '6axFhlgJgvquwOyRhw18BS',
        '0nhjj0YiyxWv2oOYpwrfCR',
        '3kPoV6L9vXpbxoM4Ux0KnX',
        '2fCwv2ppU5nTRTckomIGsd',
      ],
      // Artistas, na ordem. `album` (ID ou link do álbum no Spotify) é opcional:
      // a capa dele vira o fundo do ladrilho do artista.
      artists: [
        { artist: '3YQKmKGau1PzlVlkL1iodx', album: '1KFWgQTw3EMTQebaaepVBI' }, // Twenty One Pilots — Clancy
        { artist: '3MZsBdqDrRTJihTHQrO6Dq', album: '0amPedWJXGfUKNw1cfNAnr' }, // Joji — BALLADS 1
        { artist: '5Rl15oVamLq7FbSb0NNBNy', album: '6aPyqaE53xagYyLIYZjB1e' }, // 5 Seconds of Summer — 5SOS5
        { artist: '6O9vGMmTwzihULICPCsNf2', album: '7GZtz7PZ16q4fNci27FIVG' }, // Balu Brigada — Find A Way (EP)
        { artist: '3vEL65ycUboLH76pgdtqlF', album: '0vVoKZmi97XxytJghdjvHF' }, // South Arcade — F.A.M.O.U.S (single)
        { artist: '3SXwqSqAoBz9WCI9PDQzY6', album: '0JICUfSKOdGqzE9FJSrNci' }, // Fontaines D.C. — Dopamine Chamber
        { artist: '1McMsnEElThX1knmY4oliG', album: '3WZZF72ihlKPZBS4zSsNHl' }, // Olivia Rodrigo — you seem pretty sad for a girl so in love
        { artist: '4NHQUGzhtTLFvgF5SZesLK', album: '0HO9NtwyP7ZqB1jZ70MJL6' }, // Tove Lo — Dirt Femme
        { artist: '7AZm56bjPk0tYl6LTyJu9N', album: '2ZdaLdroDh69cI4FqsRo19' }, // Blusher — LAST MAN STANDING (single)
        { artist: '1Xyo4u8uXC1ZmMpatF05PJ', album: '4yP0hdKOZPNshxUOjY0cZj' }, // The Weeknd — After Hours
      ],
    },
  },

  // Som de fundo (som_fundo_novo.mp3). Toca e repete sem fim só o trecho de
  // 1:20 a 3:23 (em segundos: 80 a 203); começa direto em 1:20.
  sound: {
    src: somFundo,
    loop: [80, 203],
    defaultVolume: 50,
  },

  // Ícones da área de trabalho (coluna à esquerda, telas ≥ 1024 px). Sem `href`,
  // o ícone é só cenário. Para torná-lo clicável, informe uma URL ou '#secao'.
  // Ícones com `image` usam a imagem própria no lugar do desenho de `kind`.
  // As imagens saem de src/assets/originais/ via `npm run images`.
  desktopIcons: [
    {
      id: 'lixeira',
      label: { pt: 'Lixeira', en: 'Recycle Bin' },
      kind: 'lixeira',
      image: lixeiraIcon,
      content: { image: lixeiraContent, alt: { pt: 'Escudo do Corinthians', en: 'Corinthians crest' } },
    },
    { id: 'computador', label: { pt: 'Meu computador', en: 'Computer' }, kind: 'computador', image: computadorIcon },
    { id: 'arquivos', label: { pt: 'Arquivos', en: 'Files' }, kind: 'arquivos', image: arquivosIcon },
    { id: 'msn', label: 'MSN', kind: 'template', image: msnIcon, app: 'messenger' },
    {
      id: 'media-player',
      label: 'Media Player',
      kind: 'template',
      image: mediaPlayerIcon,
      app: 'media-player',
      // Para mais vídeos: coloque o .mp4 em src/assets/video/, importe acima e
      // acrescente aqui (anterior/próximo seguem esta ordem).
      playlist: [mediaPlayerVideo1, mediaPlayerVideo2, mediaPlayerVideo3, mediaPlayerVideo4],
    },
    { id: 'the-sims-2', label: 'The Sims 2', kind: 'template', image: theSimsIcon },
    { id: 'cs-16', label: 'CS 1.6', kind: 'template', image: cs16Icon },
    { id: 'minecraft', label: 'Minecraft', kind: 'template', image: minecraftIcon },
    {
      id: 'bonzi',
      label: 'BonziBuddy',
      kind: 'template',
      image: bonziIcon,
      surf: { image: bonziSurf, alt: { pt: 'BonziBuddy surfando', en: 'BonziBuddy surfing' } },
    },
    { id: 'clippy', label: 'Clippy', kind: 'template', image: clippyIcon, assistant: clippyAssistant },
  ],

  // Política de privacidade (rota #privacidade). Revise se algo mudar no site
  // (ex.: um formulário de contato ou outra ferramenta de estatísticas).
  privacy: {
    updated: '2026-11-20',
    intro: {
      pt: 'Este portfólio foi feito para ser visitado sem que você precise entregar dados pessoais. Esta página explica o que é guardado, por quem e por quê, de acordo com a Lei Geral de Proteção de Dados (LGPD).',
      en: 'This portfolio is designed so you can visit it without handing over personal data. This page explains what is stored, by whom and why, in line with Brazil’s General Data Protection Law (LGPD).',
    },
    sections: [
      {
        title: { pt: 'O que fica no seu navegador', en: 'What stays in your browser' },
        paragraphs: [
          {
            pt: 'O site guarda no armazenamento local do seu navegador apenas preferências: tema, modo do vidro, idioma, volume do som de fundo e o histórico de navegação entre as seções. Esses dados não saem do seu aparelho, e você pode apagá-los limpando os dados do site no navegador. Não usamos cookies.',
            en: 'The site keeps only preferences in your browser’s local storage: theme, glass mode, language, background sound volume and the navigation history between sections. This data never leaves your device, and you can delete it by clearing the site data in your browser. We do not use cookies.',
          },
        ],
      },
      {
        title: { pt: 'Estatísticas de visitas', en: 'Visit statistics' },
        paragraphs: [
          {
            pt: 'Usamos o Vercel Web Analytics para contar visitas e saber quais seções são vistas. Ele não usa cookies, não identifica você e não acompanha sua navegação em outros sites: registra, de forma agregada, a seção visitada, o país, o tipo de navegador e de aparelho e o site de onde você veio.',
            en: 'We use Vercel Web Analytics to count visits and see which sections are viewed. It uses no cookies, does not identify you and does not follow you across other sites: it records, in aggregate, the section visited, the country, the browser and device type, and the referring site.',
          },
          {
            pt: 'O contador de visitas da página inicial guarda apenas o total. Para não contar a mesma pessoa várias vezes, o servidor guarda por até 6 horas um código gerado a partir do endereço IP (um resumo irreversível, não o endereço em si), que depois é apagado automaticamente. O banco de dados desse contador fica na Upstash.',
            en: 'The visit counter on the home page stores only the total. To avoid counting the same person several times, the server keeps, for up to 6 hours, a code derived from the IP address (an irreversible digest, not the address itself), which is then deleted automatically. The counter’s database is hosted by Upstash.',
          },
        ],
      },
      {
        title: { pt: 'Hospedagem', en: 'Hosting' },
        paragraphs: [
          {
            pt: 'O site é hospedado pela Vercel. Como em qualquer servidor, ela recebe dados técnicos das requisições, como endereço IP e navegador, para entregar as páginas e protegê-las contra abusos, conforme a política de privacidade da própria Vercel.',
            en: 'The site is hosted by Vercel. As with any server, it receives technical request data, such as IP address and browser, to deliver the pages and protect them against abuse, under Vercel’s own privacy policy.',
          },
        ],
      },
      {
        title: { pt: 'Spotify', en: 'Spotify' },
        paragraphs: [
          {
            pt: 'A seção Spotify mostra dados públicos da minha própria conta, como perfil e músicas ouvidas. Nenhum dado seu é enviado ao Spotify pelo site, mas as capas dos álbuns são carregadas diretamente dos servidores do Spotify, que recebem os dados técnicos dessa requisição.',
            en: 'The Spotify section shows public data from my own account, such as my profile and the songs I listened to. The site sends none of your data to Spotify, but album covers are loaded directly from Spotify’s servers, which receive the technical data of that request.',
          },
        ],
      },
      {
        title: { pt: 'Links externos', en: 'External links' },
        paragraphs: [
          {
            pt: 'Os links para WhatsApp, GitHub, Instagram, demonstrações de projetos e outros serviços levam a sites de terceiros, que têm políticas de privacidade próprias. As prévias de músicas da aba Spotify usam o player do próprio Spotify, que só é carregado quando você pede uma prévia e segue a política de privacidade do Spotify.',
            en: 'Links to WhatsApp, GitHub, Instagram, project demos and other services lead to third-party sites, which have their own privacy policies. The song previews in the Spotify tab use Spotify’s own player, which only loads when you ask for a preview and follows Spotify’s privacy policy.',
          },
        ],
      },
      {
        title: { pt: 'Contato', en: 'Contact' },
        paragraphs: [
          {
            pt: 'Para dúvidas sobre esta política ou sobre seus dados, escreva para pppedro95@gmail.com.',
            en: 'For questions about this policy or about your data, write to pppedro95@gmail.com.',
          },
        ],
      },
    ],
  },
};
