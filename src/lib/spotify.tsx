/**
 * Dados do Spotify no navegador: uma busca compartilhada (Início + aba Spotify),
 * atualizada periodicamente apenas com a aba do navegador visível.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SpotifyConfig } from '../types/portfolio';
import type { SpotifySnapshot } from '../types/spotify';

export type SpotifyState =
  | { readonly status: 'disabled' }
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: SpotifySnapshot; readonly receivedAt: number; readonly demo: boolean }
  | { readonly status: 'unavailable'; readonly reason: 'not-configured' | 'error' };

const SpotifyContext = createContext<SpotifyState>({ status: 'disabled' });

export interface SpotifyRefresh {
  /** Busca de novo agora, sem esperar o intervalo (e sem o cache da hospedagem). */
  readonly refresh: () => void;
  readonly refreshing: boolean;
  /** Resultado da última atualização manual, para o aviso ao leitor de tela. */
  readonly result: 'ok' | 'error' | null;
}

const RefreshContext = createContext<SpotifyRefresh>({ refresh: () => undefined, refreshing: false, result: null });

export function useSpotify(): SpotifyState {
  return useContext(SpotifyContext);
}

export function useSpotifyRefresh(): SpotifyRefresh {
  return useContext(RefreshContext);
}

async function loadDemo(): Promise<SpotifySnapshot> {
  // Import dinâmico: os dados de exemplo nem entram no bundle de produção.
  return (await import('../data/spotify-demo')).spotifyDemo;
}

export function SpotifyProvider({
  config,
  children,
}: {
  readonly config: SpotifyConfig;
  readonly children: ReactNode;
}) {
  const [state, setState] = useState<SpotifyState>(config.enabled ? { status: 'loading' } : { status: 'disabled' });
  const [refreshing, setRefreshing] = useState(false);
  const [result, setResult] = useState<'ok' | 'error' | null>(null);
  const loadRef = useRef<((fresh: boolean) => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (!config.enabled) return;
    let cancelled = false;
    let controller: AbortController | null = null;

    // Mantém os últimos dados bons se uma atualização posterior falhar.
    const fail = (reason: 'not-configured' | 'error') => {
      if (cancelled) return;
      setState((current) => (current.status === 'ready' ? current : { status: 'unavailable', reason }));
    };

    /** true = dados novos recebidos. `fresh` fura o cache curto da hospedagem. */
    let busy = false;
    const load = async (fresh: boolean): Promise<boolean> => {
      // Busca automática com outra em andamento: espera a próxima rodada (antes ela
      // cancelava o "Atualizar" do visitante, que então anunciava erro sem haver).
      if (busy && !fresh) return false;
      controller?.abort();
      const own = new AbortController();
      controller = own;
      busy = true;
      try {
        const url = fresh ? `${config.endpoint}?fresh=${Date.now()}` : config.endpoint;
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: fresh ? 'no-store' : 'default',
          signal: own.signal,
        });
        // 503 = credenciais ausentes; 404 = função não publicada nesta hospedagem.
        const notConfigured = response.status === 503 || response.status === 404;
        if (notConfigured && import.meta.env.DEV) {
          const data = await loadDemo();
          if (!cancelled) setState({ status: 'ready', data, receivedAt: Date.now(), demo: true });
          return true;
        }
        if (!response.ok) {
          fail(notConfigured ? 'not-configured' : 'error');
          return false;
        }
        const raw = (await response.json()) as SpotifySnapshot;
        const data = config.showFollowers ? raw : { ...raw, profile: { ...raw.profile, followers: null } };
        if (!cancelled) setState({ status: 'ready', data, receivedAt: Date.now(), demo: false });
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return false;
        fail('error');
        return false;
      } finally {
        if (controller === own) busy = false;
      }
    };
    loadRef.current = load;

    void load(false);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(false);
    }, config.refreshSeconds * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load(false);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      loadRef.current = null;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [config]);

  const refresh = useCallback(() => {
    const load = loadRef.current;
    if (!load || refreshing) return;
    setRefreshing(true);
    setResult(null);
    void load(true).then((ok) => {
      setRefreshing(false);
      setResult(ok ? 'ok' : 'error');
    });
  }, [refreshing]);

  const refreshValue = useMemo(() => ({ refresh, refreshing, result }), [refresh, refreshing, result]);

  return (
    <SpotifyContext.Provider value={state}>
      <RefreshContext.Provider value={refreshValue}>{children}</RefreshContext.Provider>
    </SpotifyContext.Provider>
  );
}
