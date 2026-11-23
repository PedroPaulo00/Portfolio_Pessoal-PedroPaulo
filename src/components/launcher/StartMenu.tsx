import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { ACHIEVEMENT_TOTAL, useUnlockedAchievements } from '../../lib/achievements';
import type { GlassMode, Theme } from '../../lib/preferences';
import type { Locale, Profile, Section, SectionId } from '../../types/portfolio';
import { BrandMark } from '../ui/BrandMark';
import { Icon } from '../ui/Icon';
import '../ui/achievements.css';
import './launcher.css';

interface StartMenuProps {
  readonly id: string;
  readonly open: boolean;
  /** Botão que abriu o menu: define a âncora e recebe o foco ao fechar. */
  readonly opener: HTMLElement | null;
  readonly onClose: () => void;
  readonly profile: Profile;
  readonly sections: readonly Section[];
  /** Devolve true se o destino mudou (o foco vai para o título da nova vista). */
  readonly onNavigate: (section: SectionId) => boolean;
  readonly theme: Theme;
  readonly onThemeChange: (theme: Theme) => void;
  readonly glass: GlassMode;
  readonly onGlassChange: (mode: GlassMode) => void;
  readonly blurSupported: boolean;
  /** Vista exibida ao abrir: lista de seções ou Aparência. */
  readonly initialView?: 'main' | 'settings';
  readonly locale: Locale;
  readonly onLocaleChange: (locale: Locale) => void;
  /** Desligar (volta ao botão de ligar) ou reiniciar (vídeo de inicialização de novo). */
  readonly onPower: (action: PowerAction) => void;
}

export type PowerAction = 'shutdown' | 'restart';

const GLASS_OPTIONS = ['blur', 'clear', 'opaque'] as const satisfies readonly GlassMode[];
const THEME_OPTIONS = ['light', 'dark'] as const satisfies readonly Theme[];
/** Nome de cada idioma na própria língua (igual nas duas interfaces). i18n-exempt */
const LOCALE_OPTIONS: readonly { value: Locale; label: string; lang: string }[] = [
  { value: 'pt', label: 'Português', lang: 'pt-BR' },
  { value: 'en', label: 'English', lang: 'en' },
];

/** Busca sem diferenciar acentos nem maiúsculas ("inicio" acha "Início"). */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const EDGE = 12;
const LOGO_OVERHANG = 34;

/**
 * Menu do portfólio no estilo do menu Iniciar (kit 7H): lista clara à esquerda,
 * coluna de vidro escuro à direita com o logo. Contém apenas ações reais:
 * ir para seções e ajustar a aparência. Não é um menu de sistema operacional.
 */
export function StartMenu(props: StartMenuProps) {
  const { id, open, opener, onClose, profile, sections, onNavigate, onPower, initialView = 'main' } = props;
  const { t } = useI18n();
  const secrets = useUnlockedAchievements().size;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [query, setQuery] = useState('');
  // Lista de opções de desligamento (seta ao lado de "Desligar").
  const [powerOptions, setPowerOptions] = useState(false);
  const powerArrowRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  // Fechou por navegar para uma seção: o foco vai para o título da nova vista
  // (App), não de volta ao acionador.
  const closedByNavigation = useRef(false);

  // Abre/fecha o <dialog> nativo (foco preso, Esc, camada superior). Layout effect:
  // precisa estar aberto antes do posicionamento abaixo, sem pintar fora do lugar.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setView(initialView);
      setQuery('');
      setPowerOptions(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialView]);

  const position = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || !opener) return;
    const anchor = opener.getBoundingClientRect();
    const { width, height } = dialog.getBoundingClientRect();
    const fromBottom = anchor.top > window.innerHeight / 2;
    const left = Math.max(EDGE, Math.min(anchor.left, window.innerWidth - width - EDGE));
    // O quadro do logo ultrapassa o topo do painel em ~34 px: reservar esse espaço.
    const preferredTop = fromBottom ? anchor.top - height - 6 : anchor.bottom + 6 + LOGO_OVERHANG;
    const top = Math.max(EDGE + LOGO_OVERHANG, Math.min(preferredTop, window.innerHeight - height - EDGE));
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
  }, [opener]);

  useLayoutEffect(() => {
    if (!open) return;
    position();
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    return () => {
      window.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('resize', position);
    };
  }, [open, view, position]);

  // Foco ao trocar de vista dentro do menu.
  useEffect(() => {
    if (!open) return;
    if (view === 'settings') backButtonRef.current?.focus();
  }, [open, view]);

  const handleClose = () => {
    onClose();
    if (closedByNavigation.current) {
      closedByNavigation.current = false;
      return;
    }
    opener?.focus();
  };

  const closeWhenOutside = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!inside) event.currentTarget.close();
  };

  const normalized = fold(query.trim());
  const visibleSections = sections.filter((section) => fold(section.label).includes(normalized));

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className="start-menu"
      aria-labelledby={headingId}
      onClose={handleClose}
      onClick={closeWhenOutside}
    >
      <h2 id={headingId} className="sr-only">
        {t.menuOf(profile.name)}
      </h2>
      <div className="start-menu__layout">
        <div className="start-menu__main">
          {view === 'main' ? (
            <>
              <nav className="start-menu__list" aria-label={t.portfolioSections}>
                {visibleSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className="start-menu__item"
                    onClick={() => {
                      // Já está nessa seção: o foco volta a quem abriu o menu.
                      closedByNavigation.current = onNavigate(section.id);
                      onClose();
                    }}
                  >
                    <Icon name={section.id} size={28} />
                    <span>{section.label}</span>
                  </button>
                ))}
                {visibleSections.length === 0 ? (
                  <p className="start-menu__empty" role="status">
                    {t.noShortcut}
                  </p>
                ) : null}
              </nav>
              <div className="start-menu__search">
                <label className="sr-only" htmlFor={`${id}-search`}>
                  {t.searchShortcuts}
                </label>
                <input
                  id={`${id}-search`}
                  className="start-menu__search-input"
                  type="search"
                  placeholder={t.searchSections}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <svg className="start-menu__search-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10" cy="10" r="6" />
                  <path d="m15 15 5 5" />
                </svg>
              </div>
            </>
          ) : (
            <SettingsView
              {...props}
              backButtonRef={backButtonRef}
              onBack={() => {
                setView('main');
                requestAnimationFrame(() => settingsButtonRef.current?.focus());
              }}
            />
          )}
        </div>

        <aside className="start-menu__side">
          {/* Quadro do usuário, como no menu Iniciar do Windows 7: a foto do dono. */}
          <span className="start-menu__brand">
            {profile.photo ? (
              <img className="start-menu__photo" src={profile.photo.src} alt="" width={48} height={48} />
            ) : (
              <BrandMark profile={profile} size={48} />
            )}
          </span>
          <p className="start-menu__owner">{profile.name}</p>
          {/* Easter eggs achados: aparece só depois do primeiro (antes disso, a graça é descobrir). */}
          {secrets > 0 ? (
            <p className="start-menu__secrets" title={t.secretsHint}>
              <strong>{t.secretsFound(secrets, ACHIEVEMENT_TOTAL)}</strong>
              <span className="start-menu__secrets-bar" aria-hidden="true">
                <span
                  className="start-menu__secrets-fill"
                  style={{ width: `${(secrets / ACHIEVEMENT_TOTAL) * 100}%` }}
                />
              </span>
            </p>
          ) : null}
          <button
            ref={settingsButtonRef}
            type="button"
            className="start-menu__side-link"
            aria-pressed={view === 'settings'}
            onClick={() => setView(view === 'settings' ? 'main' : 'settings')}
          >
            <Icon name="configuracoes" size={20} />
            {t.appearance}
          </button>
          <button
            type="button"
            className="start-menu__side-link"
            onClick={() => {
              closedByNavigation.current = onNavigate('privacidade');
              onClose();
            }}
          >
            <Icon name="privacidade" size={20} />
            {t.privacy}
          </button>
          {/* Desligar | ▸ (a seta abre "Reiniciar"), no pé da coluna, como no Windows 7. */}
          <div className="start-menu__power">
            {powerOptions ? (
              <div
                id={`${id}-power-options`}
                className="start-menu__power-options"
                onKeyDown={(event) => {
                  if (event.key !== 'Escape') return;
                  // Esc fecha só a lista, não o menu inteiro.
                  event.preventDefault();
                  event.stopPropagation();
                  setPowerOptions(false);
                  powerArrowRef.current?.focus();
                }}
              >
                <button
                  type="button"
                  className="start-menu__power-option"
                  autoFocus
                  onClick={() => {
                    closedByNavigation.current = true;
                    onClose();
                    onPower('restart');
                  }}
                >
                  <PowerGlyph restart />
                  {t.restart}
                </button>
                <button
                  type="button"
                  className="start-menu__power-option"
                  onClick={() => {
                    closedByNavigation.current = true;
                    onClose();
                    onPower('shutdown');
                  }}
                >
                  <PowerGlyph />
                  {t.shutDown}
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="start-menu__power-button"
              onClick={() => {
                closedByNavigation.current = true;
                onClose();
                onPower('shutdown');
              }}
            >
              {t.shutDown}
            </button>
            <button
              ref={powerArrowRef}
              type="button"
              className="start-menu__power-arrow"
              aria-label={t.shutDownOptions}
              title={t.shutDownOptions}
              aria-expanded={powerOptions}
              aria-controls={powerOptions ? `${id}-power-options` : undefined}
              onClick={() => setPowerOptions((current) => !current)}
            >
              <span className="start-menu__power-caret" aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>
    </dialog>
  );
}

interface SettingsViewProps extends StartMenuProps {
  readonly onBack: () => void;
  readonly backButtonRef: React.Ref<HTMLButtonElement>;
}

function SettingsView({
  id,
  theme,
  onThemeChange,
  glass,
  onGlassChange,
  blurSupported,
  locale,
  onLocaleChange,
  onBack,
  backButtonRef,
}: SettingsViewProps) {
  const { t } = useI18n();
  const themeLabel: Record<Theme, string> = { light: t.themeLight, dark: t.themeDark };
  const glassLabel: Record<GlassMode, string> = { blur: t.glassBlur, clear: t.glassClear, opaque: t.glassOpaque };
  return (
    <div className="start-menu__settings">
      <button ref={backButtonRef} type="button" className="start-menu__back" onClick={onBack}>
        <span aria-hidden="true" className="start-menu__back-arrow" />
        {t.back}
      </button>

      <fieldset className="start-menu__fieldset">
        <legend>{t.contentTheme}</legend>
        {THEME_OPTIONS.map((option) => (
          <label key={option} className="start-menu__option">
            <input
              type="radio"
              name={`${id}-theme`}
              value={option}
              checked={theme === option}
              onChange={() => onThemeChange(option)}
            />
            {themeLabel[option]}
          </label>
        ))}
      </fieldset>

      <fieldset className="start-menu__fieldset">
        <legend>{t.windowGlass}</legend>
        {GLASS_OPTIONS.map((option) => {
          const unavailable = option === 'blur' && !blurSupported;
          return (
            <label key={option} className="start-menu__option">
              <input
                type="radio"
                name={`${id}-glass`}
                value={option}
                checked={glass === option}
                disabled={unavailable}
                aria-describedby={unavailable ? `${id}-blur-note` : undefined}
                onChange={() => onGlassChange(option)}
              />
              {glassLabel[option]}
            </label>
          );
        })}
        {!blurSupported ? (
          <p id={`${id}-blur-note`} className="start-menu__note">
            {t.blurUnsupported}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="start-menu__fieldset">
        <legend>{t.language}</legend>
        {LOCALE_OPTIONS.map((option) => (
          <label key={option.value} className="start-menu__option">
            <input
              type="radio"
              name={`${id}-locale`}
              value={option.value}
              checked={locale === option.value}
              onChange={() => onLocaleChange(option.value)}
            />
            <span lang={option.lang}>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

/** Símbolo de energia (desligar) ou seta circular (reiniciar), em traço branco. */
function PowerGlyph({ restart = false }: { readonly restart?: boolean }) {
  return (
    <svg className="start-menu__power-glyph" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      {restart ? (
        <>
          <path d="M13 8a5 5 0 1 1-1.6-3.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M12.6 1.6v3.3H9.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path d="M5 4.2a5 5 0 1 0 6 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 1.8v5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
