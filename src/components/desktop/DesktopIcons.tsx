import { useId, useLayoutEffect, useRef, useState, type JSX, type MouseEvent, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18n';
import { useNavigation } from '../../lib/navigation';
import { parseHash } from '../../lib/router';
import type { DesktopIcon, DesktopIconKind } from '../../types/portfolio';
import { AeroDialog } from '../ui/AeroDialog';
import { Surfer } from './Surfer';
import './desktop-icons.css';

/**
 * Ícones da área de trabalho, à esquerda, estilo Windows 7. Todos clicáveis:
 * com `href`, é um link ('#secao' navega dentro da janela; URL abre em nova aba);
 * sem `href`, abre uma janela-modelo ("em breve") com o ícone e o nome.
 *
 * Como no Windows, a lista desce em coluna e passa para a coluna seguinte quando
 * a tela é baixa. A largura ocupada vai para --desktop-icons-span (no <html>):
 * a janela e o atalho "Portfólio" usam esse valor para não cobrir os ícones.
 */
export function DesktopIcons({ icons }: { readonly icons: readonly DesktopIcon[] }) {
  const { t } = useI18n();
  const navRef = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState<DesktopIcon | null>(null);
  // Ícone com `surf` em ação: a imagem passeia pela tela até ser clicada.
  const [surfing, setSurfing] = useState<{
    readonly icon: DesktopIcon;
    readonly from: DOMRect;
    readonly host: Element;
  } | null>(null);

  const openIcon = (icon: DesktopIcon, button: HTMLElement) => {
    if (!icon.surf) {
      setOpened(icon);
      return;
    }
    if (surfing) return; // já está na tela
    // Fora da faixa dos ícones (que forma uma camada própria, abaixo da barra de
    // tarefas): no contêiner da área de trabalho, para passar por cima de tudo.
    setSurfing({ icon, from: button.getBoundingClientRect(), host: button.closest('.os') ?? document.body });
  };

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const root = document.documentElement;
    const measure = () => {
      // Borda direita do ícone mais à direita (0 se a lista estiver escondida).
      let right = 0;
      for (const item of nav.querySelectorAll('li')) {
        const box = item.getBoundingClientRect();
        if (box.width > 0) right = Math.max(right, box.right);
      }
      root.style.setProperty('--desktop-icons-span', `${Math.ceil(right)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      root.style.removeProperty('--desktop-icons-span');
    };
  }, [icons.length]);

  return (
    <nav ref={navRef} className="desktop-icons" aria-label={t.desktopShortcuts}>
      <ul className="desktop-icons__list">
        {icons.map((icon) => (
          <li key={icon.id}>
            {icon.href ? (
              <IconLink icon={icon} href={icon.href} />
            ) : (
              <IconButton icon={icon} onOpen={(button) => openIcon(icon, button)} />
            )}
          </li>
        ))}
      </ul>
      <AeroDialog open={opened !== null} title={opened?.label ?? ''} onClose={() => setOpened(null)}>
        {opened?.content ? (
          <div className="desktop-window">
            <img
              className="desktop-window__image"
              src={opened.content.image}
              alt={opened.content.alt}
              decoding="async"
            />
          </div>
        ) : opened ? (
          <TemplateWindow icon={opened} />
        ) : null}
      </AeroDialog>
      {surfing?.icon.surf
        ? createPortal(
            <Surfer
              image={surfing.icon.surf.image}
              alt={surfing.icon.surf.alt}
              from={surfing.from}
              onGone={() => setSurfing(null)}
            />,
            surfing.host,
          )
        : null}
    </nav>
  );
}

/** Conteúdo provisório da janela de um ícone (até o conteúdo real existir). */
function TemplateWindow({ icon }: { readonly icon: DesktopIcon }) {
  const { t } = useI18n();
  return (
    <div className="desktop-template">
      <div className="desktop-template__head">
        <span className="desktop-template__icon">
          <IconImage icon={icon} size={64} />
        </span>
        <div>
          <p className="desktop-template__name">{icon.label}</p>
          <span className="badge desktop-template__badge">{t.comingSoon}</span>
        </div>
      </div>
      <p>{t.desktopTemplate(icon.label)}</p>
      <div className="desktop-template__placeholder" aria-hidden="true">
        {t.underConstruction}
      </div>
    </div>
  );
}

interface PortfolioShortcutProps {
  readonly image: string;
  readonly buttonRef: Ref<HTMLButtonElement>;
  readonly onOpen: () => void;
}

/**
 * Atalho "Portfólio", no centro da área de trabalho: aparece quando a janela é
 * fechada e a abre de novo com um clique (ou Enter). Fica longe dos ícones de
 * cenário, só com a imagem e o nome (sem quadro atrás).
 */
export function PortfolioShortcut({ image, buttonRef, onOpen }: PortfolioShortcutProps) {
  const { t } = useI18n();
  return (
    <div className="portfolio-shortcut">
      <button
        ref={buttonRef}
        type="button"
        className="portfolio-shortcut__button"
        aria-label={t.openPortfolio(t.portfolioShortcut)}
        onClick={onOpen}
      >
        <img className="portfolio-shortcut__image" src={image} alt="" width={64} height={64} draggable={false} />
        <span className="desktop-icon__label portfolio-shortcut__label">{t.portfolioShortcut}</span>
      </button>
    </div>
  );
}

function IconLink({ icon, href }: { readonly icon: DesktopIcon; readonly href: string }) {
  const { t } = useI18n();
  const { navigate } = useNavigation();
  const internal = href.startsWith('#');

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!internal || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(parseHash(href));
  };

  return (
    <a
      className="desktop-icon desktop-icon--link"
      href={href}
      onClick={onClick}
      {...(internal ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      <IconImage icon={icon} />
      <span className="desktop-icon__label">
        {icon.label}
        {internal ? null : <span className="sr-only">{t.opensNewTab}</span>}
      </span>
    </a>
  );
}

function IconButton({
  icon,
  onOpen,
}: {
  readonly icon: DesktopIcon;
  readonly onOpen: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className="desktop-icon desktop-icon--link"
      aria-haspopup={icon.surf ? undefined : 'dialog'}
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <IconImage icon={icon} />
      <span className="desktop-icon__label">{icon.label}</span>
    </button>
  );
}

function IconImage({ icon, size = 48 }: { readonly icon: DesktopIcon; readonly size?: number }) {
  if (icon.image) {
    return <img className="desktop-icon__image" src={icon.image} alt="" width={size} height={size} draggable={false} />;
  }
  return <IconArt kind={icon.kind} />;
}

/* ---------------------------------------------------------------------------
   Desenhos originais (grade 48), luz de cima, volume e brilho contidos (kit 7D).
   --------------------------------------------------------------------------- */

function IconArt({ kind }: { readonly kind: DesktopIconKind }) {
  const id = useId().replace(/:/g, '');
  const u = (name: string) => `url(#${id}${name})`;
  return (
    <svg className="desktop-icon__image" width={48} height={48} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfe9ff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#8cc9ef" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}blue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fe2ff" />
          <stop offset="0.5" stopColor="#2b93dc" />
          <stop offset="1" stopColor="#0d5aa6" />
        </linearGradient>
        <linearGradient id={`${id}steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f8fb" />
          <stop offset="0.5" stopColor="#b9c9d6" />
          <stop offset="1" stopColor="#71889c" />
        </linearGradient>
        <linearGradient id={`${id}amber`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffeaa8" />
          <stop offset="0.55" stopColor="#f4bd4c" />
          <stop offset="1" stopColor="#d48a1c" />
        </linearGradient>
        <linearGradient id={`${id}paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dce9f4" />
        </linearGradient>
        <linearGradient id={`${id}code`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4fb6ff" />
          <stop offset="0.6" stopColor="#1170c4" />
          <stop offset="1" stopColor="#0b4f94" />
        </linearGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ART[kind](u)}
    </svg>
  );
}

type Paint = (name: string) => string;

const ART: Record<DesktopIconKind, (u: Paint) => JSX.Element> = {
  // Lixeira de vidro (cesto translúcido com tampa e reciclagem sutil).
  lixeira: (u) => (
    <>
      <ellipse cx="24" cy="43" rx="13" ry="2.5" fill="#000" opacity="0.22" />
      <path
        d="M11 12h26l-3 29a3 3 0 0 1-3 2.7H17a3 3 0 0 1-3-2.7Z"
        fill={u('glass')}
        stroke="#5b8fb5"
        strokeWidth="1"
      />
      <path d="M17 16l1.6 24M24 16v24M31 16l-1.6 24" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M17 16l1.6 24M31 16l-1.6 24" stroke="#5b8fb5" strokeOpacity="0.35" strokeWidth="0.6" />
      <path
        d="M24 24.5a4 4 0 0 1 3.5 2l-1.4.7 3.6 1 .6-3.6-1.4.7a6 6 0 0 0-9.8-.8m-1.9 4.8a6 6 0 0 0 9.8.8"
        fill="none"
        stroke="#2c9a3f"
        strokeOpacity="0.7"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect x="9.5" y="8.5" width="29" height="5" rx="2.2" fill={u('steel')} stroke="#5d7385" strokeWidth="0.8" />
      <rect x="11" y="9.2" width="26" height="1.8" rx="0.9" fill="#fff" opacity="0.7" />
    </>
  ),

  // Meu computador: monitor com tela azul e pedestal.
  computador: (u) => (
    <>
      <ellipse cx="24" cy="44" rx="12" ry="2" fill="#000" opacity="0.22" />
      <path d="M19 35h10l1.5 6h-13Z" fill={u('steel')} stroke="#5d7385" strokeWidth="0.8" />
      <rect x="14" y="40.5" width="20" height="2.5" rx="1.2" fill={u('steel')} stroke="#5d7385" strokeWidth="0.8" />
      <rect x="4" y="7" width="40" height="29" rx="2.5" fill={u('steel')} stroke="#4c6275" strokeWidth="1" />
      <rect x="7" y="10" width="34" height="22.5" rx="1" fill={u('blue')} />
      <path d="M7 24c8-6 18-8 34-6v14.5H7Z" fill="#7fd8ff" opacity="0.35" />
      <path d="M7 10h34v8.5C30 15 18 15.5 7 19.5Z" fill={u('gloss')} opacity="0.55" />
    </>
  ),

  // Arquivos: pasta com documentos.
  arquivos: (u) => (
    <>
      <ellipse cx="24" cy="43.5" rx="17" ry="2.2" fill="#000" opacity="0.22" />
      <path
        d="M4 12a2 2 0 0 1 2-2h11l3.5 4H42a2 2 0 0 1 2 2v24a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"
        fill={u('amber')}
        stroke="#a8701d"
        strokeWidth="1"
      />
      <rect
        x="9"
        y="15"
        width="26"
        height="17"
        rx="1"
        fill={u('paper')}
        stroke="#a9bccc"
        strokeWidth="0.6"
        transform="rotate(-4 22 23)"
      />
      <rect x="12" y="13" width="26" height="17" rx="1" fill={u('paper')} stroke="#a9bccc" strokeWidth="0.6" />
      <path d="M15 18h18M15 21.5h18M15 25h12" stroke="#7aa6c9" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M4 21h40v19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill={u('amber')} stroke="#a8701d" strokeWidth="1" />
      <path d="M5 22h38v5H5Z" fill={u('gloss')} opacity="0.65" />
    </>
  ),

  // Editor de código (inspirado no VS Code): faixa azul dobrada com </>.
  vscode: (u) => (
    <>
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="#000" opacity="0.22" />
      <path
        d="M34 4.5 42.5 8.6a2.5 2.5 0 0 1 1.5 2.3v26.2a2.5 2.5 0 0 1-1.5 2.3L34 43.5 13 25.5l-6 4.6-3-1.5V19.4l3-1.5 6 4.6Z"
        fill={u('code')}
        stroke="#0a3f78"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M34 4.5v39L13 25.5Z" fill="#0b4f94" opacity="0.45" />
      <path d="M34 4.5 42.5 8.6a2.5 2.5 0 0 1 1.5 2.3v6.5L34 13Z" fill={u('gloss')} opacity="0.6" />
      <path
        d="m24.5 19-5 5 5 5m8-10 5 5-5 5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  // Espaço reservado para os atalhos que ainda serão definidos.
  template: () => (
    <>
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="6"
        fill="#ffffff"
        fillOpacity="0.18"
        stroke="#ffffff"
        strokeOpacity="0.85"
        strokeWidth="1.6"
        strokeDasharray="4 3"
      />
      <path d="M24 16v16M16 24h16" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),
};
