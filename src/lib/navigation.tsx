import { createContext, useContext, type MouseEvent, type ReactNode } from 'react';
import { routeHref, sameRoute, type Route } from './router';

interface Navigation {
  readonly route: Route;
  readonly navigate: (route: Route) => void;
}

const NavigationContext = createContext<Navigation | null>(null);

export const NavigationProvider = NavigationContext.Provider;

export function useNavigation(): Navigation {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('useNavigation precisa de <NavigationProvider>.');
  return value;
}

interface RouteLinkProps {
  readonly to: Route;
  readonly className?: string;
  readonly children: ReactNode;
  /** Marca o destino atual (aria-current="page") quando igual à rota ativa. */
  readonly markCurrent?: boolean;
}

/**
 * Link real (<a href="#...">): abre em nova aba com Ctrl/Cmd/botão do meio e é
 * anunciado como link. Clique simples navega dentro da janela, registrando histórico.
 */
export function RouteLink({ to, className, children, markCurrent = false }: RouteLinkProps) {
  const { route, navigate } = useNavigation();
  const current = markCurrent && sameRoute(route, to);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={routeHref(to)} className={className} aria-current={current ? 'page' : undefined} onClick={onClick}>
      {children}
    </a>
  );
}
