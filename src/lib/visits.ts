/**
 * Contador de visitas (Início). Conta uma vez por sessão do navegador (a aba
 * aberta); recarregar ou navegar entre seções só lê o total. Se o servidor não
 * tiver o banco configurado ou falhar, devolve null e o contador não aparece.
 *
 * Aparelhos do dono: abra o site uma vez com ?naocontar no endereço
 * (ex.: https://portfolio-pedropaulo.vercel.app/?naocontar) e aquele navegador
 * passa a só ler o total, sem somar. Para desfazer: ?contar.
 */
import { useEffect, useState } from 'react';

const ENDPOINT = '/api/visits';
const SESSION_KEY = 'portfolio-aero:visit-counted';
const OWNER_KEY = 'portfolio-aero:no-count';

/** Lê/aplica ?naocontar e ?contar e tira o parâmetro do endereço. */
function isOwnerDevice(): boolean {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('naocontar')) localStorage.setItem(OWNER_KEY, '1');
    if (url.searchParams.has('contar')) localStorage.removeItem(OWNER_KEY);
    if (url.searchParams.has('naocontar') || url.searchParams.has('contar')) {
      url.searchParams.delete('naocontar');
      url.searchParams.delete('contar');
      window.history.replaceState(window.history.state, '', url);
    }
    return localStorage.getItem(OWNER_KEY) === '1';
  } catch {
    return false;
  }
}

function alreadyCounted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markCounted(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* sem armazenamento: pode contar de novo ao recarregar (o servidor limita) */
  }
}

export function useVisitCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const count = !isOwnerDevice() && !alreadyCounted();
    fetch(ENDPOINT, {
      method: count ? 'POST' : 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { count?: unknown };
        if (typeof data.count !== 'number' || !Number.isFinite(data.count)) return;
        if (count) markCounted();
        setCount(data.count);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return count;
}
