import { useEffect, useMemo, useRef, useState } from 'react';
import startLogo from './assets/brands/start-logo.png';
import portfolioIcon from './assets/desktop/portfolio.png';
import { DecorativeTaskbar } from './components/desktop/DecorativeTaskbar';
import { DesktopBackdrop } from './components/desktop/DesktopBackdrop';
import { DesktopIcons, PortfolioShortcut } from './components/desktop/DesktopIcons';
import { VolumeControl } from './components/desktop/VolumeControl';
import { StartMenu } from './components/launcher/StartMenu';
import { AboutSection } from './components/sections/AboutSection';
import { ContactSection } from './components/sections/ContactSection';
import { HeroSection } from './components/sections/HeroSection';
import { PrivacySection } from './components/sections/PrivacySection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { SpotifySection } from './components/spotify/SpotifySection';
import { Icon } from './components/ui/Icon';
import { AeroWindow, type WindowState } from './components/window/AeroWindow';
import { CommandBar } from './components/window/CommandBar';
import { LocationBar, type Crumb } from './components/window/LocationBar';
import { PortfolioNavigation } from './components/window/PortfolioNavigation';
import { SearchBox } from './components/window/SearchBox';
import { ViewMenu } from './components/window/ViewMenu';
import { WindowTitleBar } from './components/window/WindowTitleBar';
import { PROJECT_CATEGORIES } from './data/labels';
import { portfolio } from './data/portfolio';
import { localize } from './i18n/content';
import { useI18n } from './i18n/I18n';
import { useAmbientSound } from './lib/ambient';
import { NavigationProvider, RouteLink } from './lib/navigation';
import {
  applyGlassMode,
  applyTheme,
  getGlassMode,
  getTheme,
  supportsBackdropBlur,
  type GlassMode,
  type Theme,
} from './lib/preferences';
import { getProjectView, saveProjectView, type ProjectView } from './lib/projectView';
import { routeHref, useRouter, type Route } from './lib/router';
import { pageview } from '@vercel/analytics';
import { SpotifyProvider, useSpotify, useSpotifyRefresh } from './lib/spotify';
import type { Section } from './types/portfolio';
import './styles/controls.css';
import './components/window/interior.css';
import './components/sections/sections.css';
import './styles/app.css';
// Por último: microinterações sobrepõem transições dos componentes.
import './styles/motion.css';

const MENU_ID = 'portfolio-menu';
const HOME: Route = { section: 'inicio' };

export function App() {
  const { locale, t, setLocale } = useI18n();
  // Conteúdo já no idioma atual (portfolio.ts guarda as duas línguas).
  const content = useMemo(() => localize(portfolio, locale), [locale]);
  const { profile, projects, about, skills, contact } = content;
  // A aba Spotify só existe com a integração ligada em portfolio.ts.
  const sections = content.sections.filter((item) => item.id !== 'spotify' || portfolio.spotify.enabled);
  const router = useRouter();
  const sound = useAmbientSound(portfolio.sound);
  const { navigate } = router;
  // Com o Spotify desligado, #spotify cai no Início em vez de uma vista vazia.
  // (constante de módulo: referência estável, sem reexecutar os efeitos de foco).
  const route: Route = router.route.section === 'spotify' && !portfolio.spotify.enabled ? HOME : router.route;

  const [theme, setTheme] = useState<Theme>(getTheme);
  const [glass, setGlass] = useState<GlassMode>(() => getGlassMode());
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState<{ open: boolean; opener: HTMLElement | null; view: 'main' | 'settings' }>({
    open: false,
    opener: null,
    view: 'main',
  });
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  // Janela aberta, minimizada (volta pela barra de tarefas) ou fechada (volta pelo
  // ícone "Portfólio"). Fora de cena, só a área de trabalho fica à vista.
  const [windowState, setWindowState] = useState<WindowState>('open');
  // Ir para outro destino (menu, ícone, voltar/avançar) traz a janela de volta.
  const [shownRoute, setShownRoute] = useState(route);
  if (shownRoute !== route) {
    setShownRoute(route);
    if (windowState !== 'open') setWindowState('open');
  }
  // Modo de exibição dos projetos ("Visualizar"), salvo no navegador.
  const [projectView, setProjectView] = useState<ProjectView>(getProjectView);
  const changeProjectView = (view: ProjectView) => {
    saveProjectView(view);
    setProjectView(view);
  };

  const titleLogoRef = useRef<HTMLButtonElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const appearanceRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const windowButtonRef = useRef<HTMLButtonElement>(null);
  const shortcutRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);
  const keepFocusOnce = useRef(false);

  // A política de privacidade é uma vista fora da navegação principal.
  const privacySection: Section = { id: 'privacidade', label: t.privacy, description: t.privacyDescription };
  const section: Section =
    route.section === 'privacidade'
      ? privacySection
      : (sections.find((item) => item.id === route.section) ?? sections[0]!);

  // Estatísticas (Vercel Web Analytics): cada seção conta como um caminho
  // (/projetos, /projetos/academico…), já que a rota fica no # da URL.
  useEffect(() => {
    pageview({ route: routeHref(route).replace('#', '/'), path: routeHref(route).replace('#', '/') });
  }, [route]);

  // Título do documento: muda com o destino e com o idioma.
  useEffect(() => {
    const where = route.category ? t.projectsOf(t.category[route.category].plural) : section.label;
    document.title = route.section === 'inicio' ? t.windowTitle(profile.name) : t.documentTitle(where, profile.name);
  }, [route.section, route.category, section.label, profile.name, t]);

  // A cada destino (não ao trocar de idioma): rolagem até a janela e foco no título da vista.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = mainRef.current;
    if (main && main.getBoundingClientRect().top < 0) {
      main.scrollIntoView({ block: 'start' });
    }
    if (keepFocusOnce.current) {
      keepFocusOnce.current = false;
      return;
    }
    main?.querySelector<HTMLElement>('[data-view-heading]')?.focus({ preventScroll: true });
  }, [route]);

  // Sem a janela, a área de trabalho não rola (a barra de rolagem some) e, no
  // celular, os ícones de cenário aparecem (desktop-icons.css).
  useEffect(() => {
    document.documentElement.classList.toggle('window-away', windowState !== 'open');
    return () => document.documentElement.classList.remove('window-away');
  }, [windowState]);

  // Janela fechada: o foco vai para o ícone "Portfólio", que a abre de novo.
  useEffect(() => {
    if (windowState === 'closed') shortcutRef.current?.focus({ preventScroll: true });
  }, [windowState]);

  /** Ponto (dentro da janela) de onde ela encolhe e para onde volta. */
  const setWindowOrigin = (x: number, y: number) => {
    windowRef.current?.style.setProperty('--window-origin-x', `${Math.round(x)}px`);
    windowRef.current?.style.setProperty('--window-origin-y', `${Math.round(y)}px`);
  };

  const toggleWindow = () => {
    const frame = windowRef.current;
    const button = windowButtonRef.current;
    if (windowState === 'open') {
      // Ao minimizar, a janela encolhe em direção ao botão dela na barra de tarefas
      // (o mesmo ponto vale para a volta).
      if (frame && button) {
        const from = frame.getBoundingClientRect();
        const to = button.getBoundingClientRect();
        setWindowOrigin(to.left + to.width / 2 - from.left, to.top + to.height / 2 - from.top);
      }
      // O foco vai para o botão da janela na barra: é por ele que se restaura
      // (quem minimizou pelo "−" da moldura ficaria com o foco numa janela inerte).
      button?.focus({ preventScroll: true });
      setWindowState('minimized');
    } else {
      setWindowState('open');
    }
  };

  const closeWindow = () => {
    const frame = windowRef.current;
    if (frame) {
      // Fecha (e reabre) a partir do meio da parte visível da janela.
      const from = frame.getBoundingClientRect();
      setWindowOrigin(from.width / 2, Math.max(0, window.innerHeight / 2 - from.top));
    }
    setWindowState('closed');
  };

  const reopenWindow = () => {
    setWindowState('open');
    // Depois de voltar a ser focável (sai do `inert` no próximo render).
    requestAnimationFrame(() =>
      mainRef.current?.querySelector<HTMLElement>('[data-view-heading]')?.focus({ preventScroll: true }),
    );
  };

  const openMenu = (opener: HTMLElement | null, view: 'main' | 'settings' = 'main') =>
    setMenu({ open: true, opener, view });

  const changeTheme = (next: Theme) => {
    applyTheme(next, true);
    setTheme(next);
  };
  const changeGlass = (next: GlassMode) => {
    applyGlassMode(next, true);
    setGlass(next);
  };

  const submitSearch = () => {
    if (route.section !== 'projetos') {
      keepFocusOnce.current = true;
      navigate({ section: 'projetos' });
    }
  };

  const copyEmail = async () => {
    if (!contact.email) return;
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setStatus(t.emailCopied);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatus(t.copyFailed);
    }
  };

  const crumbs: Crumb[] = [{ label: profile.name, onSelect: () => navigate({ section: 'inicio' }) }];
  if (route.section !== 'inicio') {
    crumbs.push({ label: section.label, onSelect: () => navigate({ section: route.section }) });
  }
  if (route.category) crumbs.push({ label: t.category[route.category].plural });

  return (
    <SpotifyProvider config={portfolio.spotify}>
      <NavigationProvider value={{ route, navigate }}>
        {/* Primeiro item do Tab. Não altera o hash (que é a rota): foca o título da vista. */}
        <a
          className="skip-link"
          href="#conteudo"
          onClick={(event) => {
            event.preventDefault();
            setWindowState('open');
            const heading = mainRef.current?.querySelector<HTMLElement>('[data-view-heading]');
            heading?.focus();
            heading?.scrollIntoView({ block: 'center' });
          }}
        >
          {t.skipToContent}
        </a>
        {/* WCAG 1.4.2: som que toca sozinho precisa ser desligável logo no início. */}
        {!sound.muted ? (
          <button type="button" className="skip-link skip-link--second" onClick={sound.toggleMute}>
            {t.muteBackground}
          </button>
        ) : null}
        <DesktopBackdrop />
        {content.desktopIcons.length > 0 ? <DesktopIcons icons={content.desktopIcons} /> : null}
        {windowState === 'closed' ? (
          <PortfolioShortcut image={portfolioIcon} buttonRef={shortcutRef} onOpen={reopenWindow} />
        ) : null}

        <div className={`desktop-stage${content.desktopIcons.length > 0 ? ' desktop-stage--with-icons' : ''}`}>
          <AeroWindow
            state={windowState}
            windowRef={windowRef}
            titleBar={
              <WindowTitleBar
                profile={profile}
                title={t.windowTitle(profile.name)}
                menuId={MENU_ID}
                menuOpen={menu.open}
                logoButtonRef={titleLogoRef}
                onOpenMenu={() => openMenu(titleLogoRef.current)}
                onMinimize={toggleWindow}
                onClose={closeWindow}
              />
            }
          >
            {/* Região rotulada: histórico, localização, pesquisa e comandos da janela. */}
            <section className="window-tools" aria-label={t.windowTools}>
              <LocationBar
                canGoBack={router.canGoBack}
                canGoForward={router.canGoForward}
                onBack={router.back}
                onForward={router.forward}
                crumbs={crumbs}
                search={<SearchBox value={query} onChange={setQuery} onSubmit={submitSearch} />}
              />

              <CommandBar
                label={t.sectionActions(section.label)}
                trailing={
                  <>
                    {route.section === 'projetos' ? (
                      <ViewMenu value={projectView} onChange={changeProjectView} />
                    ) : null}
                    <button
                      ref={appearanceRef}
                      type="button"
                      className="command-button"
                      aria-haspopup="dialog"
                      aria-controls={MENU_ID}
                      title={t.appearanceTitle}
                      onClick={() => openMenu(appearanceRef.current, 'settings')}
                    >
                      <Icon name="configuracoes" size={16} />
                      <span className="command-button__label">{t.appearance}</span>
                    </button>
                  </>
                }
              >
                <SectionCommands
                  route={route}
                  hasEmail={Boolean(contact.email)}
                  copied={copied}
                  onCopyEmail={copyEmail}
                />
              </CommandBar>
              {/* Feedback para leitores de tela, sem rodapé visível (kit 7F). */}
              <div className="sr-only" role="status" aria-live="polite">
                {status}
              </div>
            </section>

            <div className="window-layout">
              <PortfolioNavigation sections={sections} />
              <main className="window-main" id="conteudo" ref={mainRef}>
                {/* A chave por destino remonta a vista e dispara a transição de entrada. */}
                <div className="view" key={routeHref(route)}>
                  {route.section === 'inicio' ? <HeroSection profile={profile} sections={sections} /> : null}
                  {route.section === 'projetos' ? (
                    <ProjectsSection
                      section={section}
                      projects={projects}
                      category={route.category}
                      query={query}
                      onClearQuery={() => setQuery('')}
                      view={projectView}
                    />
                  ) : null}
                  {route.section === 'sobre' ? <AboutSection section={section} about={about} /> : null}
                  {route.section === 'tecnologias' ? <SkillsSection section={section} skills={skills} /> : null}
                  {route.section === 'spotify' && portfolio.spotify.enabled ? (
                    <SpotifySection section={section} showPlaylists={portfolio.spotify.showPlaylists} />
                  ) : null}
                  {route.section === 'contato' ? <ContactSection section={section} contact={contact} /> : null}
                  {route.section === 'privacidade' ? (
                    <PrivacySection section={section} privacy={content.privacy} />
                  ) : null}
                </div>
              </main>
            </div>
          </AeroWindow>
        </div>

        <DecorativeTaskbar
          profile={profile}
          section={section}
          windowState={windowState}
          onToggleWindow={toggleWindow}
          windowButtonRef={windowButtonRef}
          onOpenDateSettings={(opener) => openMenu(opener, 'settings')}
          startButton={
            <button
              ref={startButtonRef}
              type="button"
              className="start-button"
              aria-label={t.startLabel(profile.name)}
              aria-haspopup="dialog"
              aria-controls={MENU_ID}
              aria-expanded={menu.open}
              title={t.start}
              onClick={() => openMenu(startButtonRef.current)}
            >
              <span className="start-button__orb" aria-hidden="true">
                <img className="start-button__logo" src={startLogo} alt="" width={28} height={28} />
              </span>
            </button>
          }
          volumeControl={<VolumeControl sound={sound} />}
          languageControl={
            <button
              type="button"
              className="language-button"
              aria-label={t.languageButton}
              title={t.languageButton}
              onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
            >
              {t.languageShort}
            </button>
          }
        />

        <StartMenu
          id={MENU_ID}
          open={menu.open}
          opener={menu.opener}
          initialView={menu.view}
          onClose={() => setMenu((current) => ({ ...current, open: false }))}
          profile={profile}
          sections={sections}
          onNavigate={(id) => {
            const changed = route.section !== id || route.category !== undefined;
            setWindowState('open');
            navigate({ section: id });
            return changed;
          }}
          theme={theme}
          onThemeChange={changeTheme}
          glass={glass}
          onGlassChange={changeGlass}
          blurSupported={supportsBackdropBlur()}
          locale={locale}
          onLocaleChange={setLocale}
        />
      </NavigationProvider>
    </SpotifyProvider>
  );
}

interface SectionCommandsProps {
  readonly route: Route;
  readonly hasEmail: boolean;
  readonly copied: boolean;
  readonly onCopyEmail: () => void;
}

/** Ações contextuais reais de cada seção. */
function SectionCommands({ route, hasEmail, copied, onCopyEmail }: SectionCommandsProps) {
  const { t } = useI18n();
  switch (route.section) {
    case 'inicio':
      return (
        <>
          <RouteLink to={{ section: 'projetos' }} className="command-button">
            <Icon name="projetos" size={16} />
            {t.viewProjects}
          </RouteLink>
          <RouteLink to={{ section: 'contato' }} className="command-button">
            <Icon name="contato" size={16} />
            {t.contact}
          </RouteLink>
        </>
      );
    case 'projetos':
      return (
        <>
          <RouteLink to={{ section: 'projetos' }} markCurrent className="command-button">
            {t.all}
          </RouteLink>
          {PROJECT_CATEGORIES.map((category) => (
            <RouteLink key={category} to={{ section: 'projetos', category }} markCurrent className="command-button">
              <Icon name={category} size={16} />
              {t.category[category].plural}
            </RouteLink>
          ))}
        </>
      );
    case 'sobre':
      return (
        <>
          <RouteLink to={{ section: 'tecnologias' }} className="command-button">
            <Icon name="tecnologias" size={16} />
            {t.viewSkills}
          </RouteLink>
          <RouteLink to={{ section: 'contato' }} className="command-button">
            <Icon name="contato" size={16} />
            {t.contact}
          </RouteLink>
        </>
      );
    case 'tecnologias':
      return (
        <RouteLink to={{ section: 'projetos' }} className="command-button">
          <Icon name="projetos" size={16} />
          {t.viewProjects}
        </RouteLink>
      );
    case 'spotify':
      return <SpotifyCommands />;
    case 'privacidade':
      return (
        <RouteLink to={{ section: 'contato' }} className="command-button">
          <Icon name="contato" size={16} />
          {t.contact}
        </RouteLink>
      );
    case 'contato':
      return (
        <button
          type="button"
          className="command-button"
          disabled={!hasEmail}
          title={hasEmail ? undefined : t.emailNotConfigured}
          onClick={onCopyEmail}
        >
          <Icon name="contato" size={16} />
          {copied ? t.emailCopiedShort : t.copyEmail}
        </button>
      );
  }
}

/** Ação da aba Spotify: abrir o perfil no app/site do Spotify (quando disponível). */
function SpotifyCommands() {
  const { t } = useI18n();
  const state = useSpotify();
  const { refresh, refreshing, result } = useSpotifyRefresh();
  if (state.status === 'disabled') return null;
  const busy = refreshing || state.status === 'loading';
  return (
    <>
      <button
        type="button"
        className={`command-button${busy ? ' is-busy' : ''}`}
        aria-disabled={busy}
        onClick={refresh}
        title={t.spotifyRefreshTitle}
      >
        <span className="command-button__spin">
          <Icon name="atualizar" size={16} />
        </span>
        {refreshing ? t.spotifyRefreshing : t.spotifyRefresh}
      </button>
      {state.status === 'ready' && state.data.profile.url ? (
        <a className="command-button" href={state.data.profile.url} target="_blank" rel="noreferrer">
          <Icon name="spotify" size={16} />
          {t.openInSpotify}
          <span className="sr-only">{t.newTab}</span>
        </a>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {result === 'ok' ? t.spotifyUpdated : ''}
        {result === 'error' ? t.spotifyUpdateFailed : ''}
      </span>
    </>
  );
}
