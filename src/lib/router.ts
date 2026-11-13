/**
 * Roteamento leve por hash, integrado ao histórico do navegador.
 *
 *   #inicio · #projetos · #projetos/academico · #sobre · #tecnologias · #spotify · #contato
 *
 * Voltar/avançar da janela chamam history.back()/forward(), então ficam em sincronia
 * com os botões do navegador. Cada entrada guarda seu índice em history.state para
 * saber se há destino antes/depois; um novo destino descarta o ramo "avançar".
 */
import { useCallback, useEffect, useState } from 'react';
import { CATEGORY_ORDER } from '../data/labels';
import type { ProjectCategory, SectionId } from '../types/portfolio';

export interface Route {
  readonly section: SectionId;
  readonly category?: ProjectCategory;
}

const SECTIONS: readonly SectionId[] = [
  'inicio',
  'projetos',
  'sobre',
  'tecnologias',
  'spotify',
  'contato',
  'privacidade',
];
const MAX_KEY = 'portfolio-aero:history-max';

export function parseHash(hash: string): Route {
  const [rawSection = '', rawCategory] = decodeURIComponent(hash.replace(/^#\/?/, '')).split('/');
  const section = SECTIONS.find((id) => id === rawSection) ?? 'inicio';
  const category = CATEGORY_ORDER.find((id) => id === rawCategory);
  return section === 'projetos' && category ? { section, category } : { section };
}

export function routeHref(route: Route): string {
  return route.category ? `#${route.section}/${route.category}` : `#${route.section}`;
}

export function sameRoute(a: Route, b: Route): boolean {
  return a.section === b.section && a.category === b.category;
}

function readIndex(): number | null {
  const state: unknown = history.state;
  if (state && typeof state === 'object' && 'idx' in state && typeof state.idx === 'number') return state.idx;
  return null;
}

function readMax(): number {
  try {
    return Number(sessionStorage.getItem(MAX_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeMax(value: number): void {
  try {
    sessionStorage.setItem(MAX_KEY, String(value));
  } catch {
    /* sem armazenamento: o limite vale só na memória */
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  const [position, setPosition] = useState(() => {
    let idx = readIndex();
    if (idx === null) {
      idx = 0;
      history.replaceState({ idx }, '', routeHref(parseHash(location.hash)));
      writeMax(0);
    }
    return { idx, max: Math.max(readMax(), idx) };
  });

  useEffect(() => {
    const onPop = () => {
      const next = parseHash(location.hash);
      let idx = readIndex();
      setPosition((current) => {
        if (idx === null) {
          // Hash editado manualmente: vira uma nova entrada no fim do histórico.
          idx = current.idx + 1;
          history.replaceState({ idx }, '', routeHref(next));
          writeMax(idx);
          return { idx, max: idx };
        }
        return { idx, max: Math.max(current.max, idx) };
      });
      setRoute(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback(
    (next: Route) => {
      if (sameRoute(next, route)) return;
      const idx = position.idx + 1;
      history.pushState({ idx }, '', routeHref(next));
      writeMax(idx);
      setPosition({ idx, max: idx });
      setRoute(next);
    },
    [route, position.idx],
  );

  return {
    route,
    navigate,
    back: () => history.back(),
    forward: () => history.forward(),
    canGoBack: position.idx > 0,
    canGoForward: position.idx < position.max,
  };
}
