/**
 * Modelo de dados do portfólio. Todo o conteúdo editável segue estes tipos.
 *
 * Bilíngue (português e inglês): em src/data/portfolio.ts os textos são
 * `PortfolioData<'source'>`, com as duas línguas; os componentes recebem
 * `PortfolioData` (modo 'view'), já no idioma escolhido (src/i18n/content.ts).
 * - Prosa (`Prose`): obrigatoriamente `{ pt, en }` — o TypeScript recusa texto
 *   em uma língua só, então nada novo entra no site sem tradução.
 * - Nomes (`Name`): nomes próprios iguais nas duas línguas podem ser string.
 */

export type Locale = 'pt' | 'en';

/** Texto nas duas línguas do site. */
export interface Localized {
  readonly pt: string;
  readonly en: string;
}

/** 'source' = como está em portfolio.ts (bilíngue); 'view' = já no idioma atual. */
export type Mode = 'source' | 'view';
export type Prose<M extends Mode> = M extends 'source' ? Localized : string;
export type Name<M extends Mode> = M extends 'source' ? string | Localized : string;

export type SectionId = 'inicio' | 'projetos' | 'sobre' | 'tecnologias' | 'spotify' | 'contato' | 'privacidade';

export interface Section<M extends Mode = 'view'> {
  readonly id: SectionId;
  /** Rótulo exibido na navegação e na barra de localização. */
  readonly label: Prose<M>;
  /** Título no topo da seção, se diferente do rótulo da navegação. */
  readonly title?: Prose<M>;
  /** Frase curta usada no menu, na página inicial e abaixo do título da seção. */
  readonly description: Prose<M>;
}

export type ProjectCategory = 'profissional' | 'academico' | 'pessoal';

export type ProjectStatus = 'planejado' | 'em-andamento' | 'concluido' | 'pausado';

export interface ProjectImage<M extends Mode = 'view'> {
  /** Caminho importado (ex.: `import thumb from '../assets/projetos/x.webp'`) ou URL. */
  readonly src: string;
  /** Texto alternativo descrevendo o que a imagem mostra ('' = decorativa). */
  readonly alt: Prose<M>;
}

export interface Project<M extends Mode = 'view'> {
  /** Identificador único, estável e sem espaços (usado em chaves e âncoras). */
  readonly id: string;
  readonly name: Name<M>;
  readonly category: ProjectCategory;
  readonly summary: Prose<M>;
  readonly stack: readonly Name<M>[];
  /** Logo do projeto (decorativo: o nome aparece ao lado). Importado de src/assets/projetos/logos/. */
  readonly logo?: string;
  /** Cor do projeto (a mais presente no logo/capturas), em hex: tinge o fundo do card e dos detalhes. */
  readonly color?: string;
  /** Sem imagem, o card exibe uma miniatura gerada no estilo Aero (com o logo, se houver). */
  readonly thumbnail?: ProjectImage<M>;
  readonly status?: ProjectStatus;
  /** Sem URL, o botão correspondente não é exibido. */
  readonly repositoryUrl?: string;
  readonly demoUrl?: string;
  /** Artigo/relatório (ex.: o artigo do TCC). O botão pede confirmação antes de sair do site. */
  readonly articleUrl?: string;
  readonly details?: Prose<M>;
  /** Capturas exibidas na janela Detalhes (formato livre). */
  readonly gallery?: readonly ProjectImage<M>[];
}

export interface SkillGroup<M extends Mode = 'view'> {
  readonly title: Prose<M>;
  readonly items: readonly Name<M>[];
}

export interface ContactLink<M extends Mode = 'view'> {
  readonly label: Name<M>;
  /** Sem URL, o link não aparece. */
  readonly url?: string;
}

export interface Profile<M extends Mode = 'view'> {
  readonly name: string;
  readonly role: Prose<M>;
  readonly tagline: Prose<M>;
  /** Logo opcional exibido junto ao nome. Sem logo, usa-se a marca textual (iniciais). */
  readonly logo?: ProjectImage<M>;
  /** Foto de perfil na moldura do Início. Sem foto, o Início mostra o logo. */
  readonly photo?: ProjectImage<M>;
}

export interface Education<M extends Mode = 'view'> {
  /** Curso e instituição. */
  readonly course: Prose<M>;
  /** Momento da graduação (ano/período e previsão de conclusão). */
  readonly stage?: Prose<M>;
}

/** Tipo de item da ficha rápida do Sobre (define o ícone). */
export type AboutFactKind = 'born' | 'lives' | 'study' | 'languages' | 'passion' | 'focus';

export interface AboutFact<M extends Mode = 'view'> {
  readonly kind: AboutFactKind;
  readonly label: Prose<M>;
  /** Sem valor, o item não aparece no site (para preencher depois). */
  readonly value?: Prose<M>;
}

/** Foto em destaque no Início (ex.: a apresentação do TCC). */
export interface FeaturedPhoto<M extends Mode = 'view'> {
  readonly image: ProjectImage<M>;
  readonly title: Prose<M>;
  readonly text: Prose<M>;
}

export interface About<M extends Mode = 'view'> {
  readonly paragraphs: readonly Prose<M>[];
  /** Ficha rápida: onde nasceu, onde mora, o que estuda... */
  readonly facts?: readonly AboutFact<M>[];
  /** Carrossel de fotos. Vazio: mostra vagas "foto em breve". */
  readonly photos?: readonly ProjectImage<M>[];
  readonly interests: readonly Prose<M>[];
  readonly education?: Education<M>;
  /** Experiências e conquistas publicáveis (estágios, prêmios, certificados). */
  readonly highlights?: readonly Prose<M>[];
  /** Idiomas, com a bandeira opcional ao lado (br, us ou es). */
  readonly languages?: readonly Language<M>[];
}

export type LanguageFlag = 'br' | 'us' | 'es';

export interface Language<M extends Mode = 'view'> {
  readonly flag?: LanguageFlag;
  readonly label: Prose<M>;
}

export interface Contact<M extends Mode = 'view'> {
  readonly intro: Prose<M>;
  /** E-mail principal: usado no link e no botão "Copiar e-mail". */
  readonly email?: string;
  readonly secondaryEmail?: string;
  readonly links: readonly ContactLink<M>[];
}

export interface PrivacyPolicy<M extends Mode = 'view'> {
  /** Data da última revisão (AAAA-MM-DD). */
  readonly updated: string;
  readonly intro: Prose<M>;
  readonly sections: readonly { readonly title: Prose<M>; readonly paragraphs: readonly Prose<M>[] }[];
}

export interface SpotifyConfig {
  /** false oculta o cartão do Início e a aba Spotify. */
  readonly enabled: boolean;
  /** Endpoint da função serverless (server/spotify.ts). */
  readonly endpoint: string;
  /** Intervalo de atualização de "tocando agora", em segundos (aba visível). */
  readonly refreshSeconds: number;
  /** Exibe as playlists públicas na aba Spotify. */
  readonly showPlaylists: boolean;
  /** Exibe o número de seguidores no cartão "Meu perfil". */
  readonly showFollowers: boolean;
  /**
   * Meu top 10, escolhido à mão: IDs ou links do Spotify (até 10 de cada), na
   * ordem. Capas, nomes e fotos vêm do Spotify pelo `endpoint`. Cada artista
   * pode ter um `album` (ID ou link), cuja capa vira o fundo do ladrilho dele.
   */
  readonly favorites?: {
    readonly endpoint: string;
    readonly tracks: readonly string[];
    readonly artists: readonly (string | { readonly artist: string; readonly album?: string })[];
  };
}

export interface SoundConfig {
  /** Arquivo de áudio (importado de src/assets/audio). */
  readonly src: string;
  /** Trecho que se repete, em segundos: [início, fim]. Sem isso, o arquivo inteiro. */
  readonly loop?: readonly [number, number];
  /** Volume inicial de 0 a 100 (o visitante pode mudar; a escolha fica salva). */
  readonly defaultVolume: number;
}

/** Desenhos prontos para os ícones da área de trabalho (ou use `image`). */
export type DesktopIconKind = 'lixeira' | 'computador' | 'arquivos' | 'vscode' | 'template';

export interface DesktopIcon<M extends Mode = 'view'> {
  /** Identificador único, sem espaços. */
  readonly id: string;
  /** Rótulo embaixo do ícone (até 2 linhas). */
  readonly label: Name<M>;
  readonly kind: DesktopIconKind;
  /** Imagem própria (importada de src/assets/), no lugar do desenho de `kind`. */
  readonly image?: string;
  /**
   * Destino ao clicar: URL externa (abre em nova aba) ou rota interna como
   * '#projetos'. Sem `href`, o clique abre uma janela-modelo ("em breve") com
   * o ícone e o nome, até o conteúdo de verdade ser definido.
   */
  readonly href?: string;
  /** Conteúdo da janela ao clicar (no lugar da janela-modelo): uma imagem. */
  readonly content?: DesktopIconContent<M>;
  /**
   * Ao clicar, a imagem surfa pela tela (por cima da janela e da barra de
   * tarefas) até ser clicada, no lugar de abrir uma janela.
   */
  readonly surf?: DesktopIconContent<M>;
  /**
   * Ao clicar, aparece como assistente (o Clippy): a animação no canto da tela
   * com o balão de dicas, no lugar de abrir uma janela.
   */
  readonly assistant?: string;
  /** Janela própria feita em código (ex.: 'messenger', o MSN com o "toc toc"). */
  readonly app?: 'messenger' | 'media-player';
  /** Vídeos do Media Player (app 'media-player'), na ordem de reprodução. */
  readonly playlist?: readonly string[];
}

export interface DesktopIconContent<M extends Mode = 'view'> {
  /** Imagem importada de src/assets/. */
  readonly image: string;
  /** Descrição da imagem para leitores de tela. */
  readonly alt: Name<M>;
}

export interface PortfolioData<M extends Mode = 'view'> {
  readonly profile: Profile<M>;
  readonly sections: readonly Section<M>[];
  readonly projects: readonly Project<M>[];
  readonly about: About<M>;
  readonly skills: readonly SkillGroup<M>[];
  readonly contact: Contact<M>;
  readonly spotify: SpotifyConfig;
  readonly sound: SoundConfig;
  /** Destaque com foto no Início, abaixo da apresentação. */
  readonly featured?: FeaturedPhoto<M>;
  /** Ícones da área de trabalho, de cima para baixo (só em telas ≥ 1024 px). */
  readonly desktopIcons: readonly DesktopIcon<M>[];
  /** Política de privacidade (rota #privacidade, fora da navegação principal). */
  readonly privacy: PrivacyPolicy<M>;
}
