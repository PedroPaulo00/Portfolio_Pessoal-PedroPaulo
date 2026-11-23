import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { PROJECT_CATEGORIES } from '../../data/labels';
import { portfolio } from '../../data/portfolio';
import { useI18n } from '../../i18n/I18n';
import { useNavigation } from '../../lib/navigation';
import type { Route } from '../../lib/router';
import './assistant.css';

interface AssistantProps {
  /** Animação do assistente (WebP animado, fundo transparente). */
  readonly image: string;
  /** A janela do portfólio está aberta (não minimizada nem fechada). */
  readonly windowOpen: boolean;
  /** Abre (ou restaura) a janela do portfólio. */
  readonly onOpenWindow: () => void;
  /** Muda a cada novo clique no ícone: o balão volta a abrir. */
  readonly summon: number;
  /** Saiu de cena (depois da animação de sumir). */
  readonly onGone: () => void;
  /** Minimizado pela barra de tarefas: some até ser restaurado. */
  readonly minimized?: boolean;
}

interface Option {
  readonly label: string;
  readonly run: () => void;
}

const LEAVE_MS = 420;
const EDGE = 12;
const DRAG_THRESHOLD = 5;

/** Mesmo tamanho do CSS (assistant.css: clamp(96px, 22vw, 120px)). */
const figureSize = () => Math.min(120, Math.max(96, window.innerWidth * 0.22));

/** Mantém o Clippy inteiro na tela, acima da barra de tarefas. */
function clamp(x: number, y: number) {
  const size = figureSize();
  const taskbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height')) || 40;
  return {
    x: Math.min(Math.max(EDGE, x), window.innerWidth - size - EDGE),
    y: Math.min(Math.max(EDGE, y), window.innerHeight - taskbar - size - 2),
  };
}

/**
 * O Clippy, como o assistente do Office 97: surge no canto da tela com o balão
 * amarelo e comenta o que o visitante está vendo ("Parece que você está..."),
 * com atalhos para outras partes do portfólio. Muda de assunto sozinho quando a
 * seção muda, conta curiosidades do site e pode ser arrastado para qualquer
 * lugar. Clicar nele mostra ou esconde o balão; "Ocultar" o faz ir embora.
 */
export function Assistant({ image, windowOpen, onOpenWindow, summon, onGone, minimized = false }: AssistantProps) {
  const { t } = useI18n();
  const c = t.clippy;
  const { route, navigate } = useNavigation();
  const figureRef = useRef<HTMLButtonElement>(null);
  // Começa no canto de baixo à direita, logo acima da barra de tarefas.
  const [pos, setPos] = useState(() => clamp(Infinity, Infinity));
  const [balloon, setBalloon] = useState(true);
  const [tip, setTip] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const gone = useRef(onGone);
  useEffect(() => {
    gone.current = onGone;
  }, [onGone]);

  // Assunto atual: muda com a seção e com a janela aberta/fechada. A cada troca
  // (ou novo clique no ícone) o balão volta, como o original fazia.
  const topic = windowOpen ? `${route.section}/${route.category ?? ''}` : 'desktop';
  const [seen, setSeen] = useState({ topic, summon });
  if (seen.topic !== topic || seen.summon !== summon) {
    setSeen({ topic, summon });
    setBalloon(true);
    setTip(null);
  }

  useEffect(() => {
    const onResize = () => setPos((current) => clamp(current.x, current.y));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Arrastar muda o lugar; tocar/clicar sem arrastar mostra ou esconde o balão.
  // A alternância acontece no fim do toque (pointerup), não no "click": no
  // celular o navegador às vezes não gera o click depois de um toque.
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    drag.current = { px: event.clientX, py: event.clientY, x: pos.x, y: pos.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.px;
    const dy = event.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setPos(clamp(d.x + dx, d.y + dy));
  };
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) setBalloon((open) => !open);
    drag.current = null;
  };
  const onPointerCancel = () => {
    drag.current = null;
  };

  const leave = () => setLeaving(true);
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => gone.current(), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  const go = (to: Route) => () => navigate(to);
  const options = (): readonly Option[] => {
    if (tip !== null) return [];
    if (!windowOpen) return [{ label: c.openPortfolio, run: onOpenWindow }];
    const spotify = portfolio.spotify.enabled;
    switch (route.section) {
      case 'inicio':
        return [
          { label: c.seeServices, run: go({ section: 'servicos' }) },
          { label: c.seeProjects, run: go({ section: 'projetos' }) },
          { label: c.aboutHim, run: go({ section: 'sobre' }) },
          { label: c.contact, run: go({ section: 'contato' }) },
        ];
      case 'projetos':
        return [
          ...PROJECT_CATEGORIES.filter((category) => category !== route.category).map((category) => ({
            label: c.onlyCategory(t.category[category].plural),
            run: go({ section: 'projetos', category }),
          })),
          ...(route.category ? [{ label: c.seeProjects, run: go({ section: 'projetos' }) }] : []),
          { label: c.contact, run: go({ section: 'contato' }) },
        ];
      case 'sobre':
        return [
          ...(spotify ? [{ label: c.listening, run: go({ section: 'spotify' }) }] : []),
          { label: c.technologies, run: go({ section: 'tecnologias' }) },
        ];
      case 'servicos':
        return [
          { label: c.contact, run: go({ section: 'contato' }) },
          { label: c.seeProjects, run: go({ section: 'projetos' }) },
        ];
      case 'tecnologias':
        return [
          { label: c.seeProjects, run: go({ section: 'projetos' }) },
          { label: c.contact, run: go({ section: 'contato' }) },
        ];
      case 'spotify':
        return [
          { label: c.aboutHim, run: go({ section: 'sobre' }) },
          { label: c.contact, run: go({ section: 'contato' }) },
        ];
      default:
        return [{ label: c.home, run: go({ section: 'inicio' }) }];
    }
  };
  const message = tip !== null ? c.tips[tip % c.tips.length]! : windowOpen ? c[route.section] : c.desktop;

  // Balão acima do Clippy (ou abaixo, se ele estiver no alto) e do lado que tem espaço.
  // Tela baixa (celular deitado): não cabe em cima nem embaixo; vai para o lado.
  const side = window.innerHeight < 520;
  // No alto da tela: balão embaixo dele (ou, ao lado, alinhado pelo topo).
  const below = pos.y < window.innerHeight * 0.45;
  const leftSide = pos.x + figureSize() / 2 < window.innerWidth / 2;

  return (
    <div
      className={`assistant${leaving ? ' assistant--leaving' : ''}${minimized ? ' assistant--minimized' : ''}`}
      inert={minimized}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && balloon) {
          event.stopPropagation();
          setBalloon(false);
          figureRef.current?.focus();
        }
      }}
    >
      {balloon && !leaving ? (
        <section
          className={`assistant__balloon${side ? ' assistant__balloon--side' : ''}${below ? ' assistant__balloon--below' : ''}${leftSide ? ' assistant__balloon--left' : ''}`}
          aria-label={c.label}
          key={`${topic}-${tip ?? ''}`}
        >
          {tip !== null ? <p className="assistant__title">{c.tipTitle}</p> : null}
          <p className="assistant__message" aria-live="polite">
            {message}
          </p>
          {options().length > 0 ? (
            <ul className="assistant__options">
              {options().map((option) => (
                <li key={option.label}>
                  <button type="button" className="assistant__option" onClick={option.run}>
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="assistant__actions">
            <button
              type="button"
              className="assistant__button"
              onClick={() =>
                setTip((current) => (current === null ? Math.floor(Math.random() * c.tips.length) : current + 1))
              }
            >
              {c.tip}
            </button>
            {tip !== null ? (
              <button type="button" className="assistant__button" onClick={() => setTip(null)}>
                {c.back}
              </button>
            ) : null}
            <button type="button" className="assistant__button" onClick={leave}>
              {c.hide}
            </button>
          </div>
        </section>
      ) : null}
      <button
        ref={figureRef}
        type="button"
        className="assistant__figure"
        aria-label={c.label}
        title={c.drag}
        aria-expanded={balloon}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={(event) => {
          // Só o teclado (Enter/Espaço, detail 0); mouse e toque já foram tratados.
          if (event.detail !== 0) return;
          setBalloon((open) => !open);
        }}
      >
        {/* Chave por assunto: a cada troca, ele dá um pulinho. */}
        <span className="assistant__hop" key={topic}>
          <img className="assistant__image" src={image} alt="" draggable={false} />
        </span>
      </button>
    </div>
  );
}
