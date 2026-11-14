/**
 * Núcleo do endpoint /api/visits (contador de visitas do Início). Usado pelo
 * servidor de desenvolvimento do Vite e pela função da Vercel em api/visits.ts.
 *
 * O total fica num banco Redis da Upstash (integração gratuita da Vercel, que
 * cria as variáveis KV_REST_API_URL e KV_REST_API_TOKEN). Sem elas, responde 503
 * e o site esconde o contador.
 *
 *   GET  → { count }               só lê o total
 *   POST → { count, counted }      conta uma visita e devolve o total
 *
 * Contra inflar o número (recarregar a página, scripts): cada endereço de rede
 * conta no máximo uma vez a cada COOLDOWN_SECONDS. O endereço não é guardado:
 * só um resumo (hash SHA-256) que se apaga sozinho ao fim desse prazo.
 */

export interface VisitsEnv {
  readonly KV_REST_API_URL?: string | undefined;
  readonly KV_REST_API_TOKEN?: string | undefined;
  readonly UPSTASH_REDIS_REST_URL?: string | undefined;
  readonly UPSTASH_REDIS_REST_TOKEN?: string | undefined;
}

const COUNT_KEY = 'portfolio:visits';
const COOLDOWN_SECONDS = 6 * 60 * 60;

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: HEADERS });

interface Store {
  readonly command: (...args: (string | number)[]) => Promise<unknown>;
}

/** Upstash REST: um comando por requisição, resposta `{ result }`. */
function upstash(url: string, token: string): Store {
  return {
    async command(...args) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      if (!response.ok) throw new Error(`upstash ${response.status}`);
      return ((await response.json()) as { result: unknown }).result;
    },
  };
}

/** Banco em memória, só para `npm run dev`/`preview` sem as variáveis configuradas. */
function memoryStore(): Store {
  const data = new Map<string, string>();
  return {
    async command(name, key, ...rest) {
      const k = String(key);
      if (name === 'GET') return data.get(k) ?? null;
      if (name === 'INCR') {
        const next = Number(data.get(k) ?? 0) + 1;
        data.set(k, String(next));
        return next;
      }
      if (name === 'SET') {
        if (rest.includes('NX') && data.has(k)) return null;
        data.set(k, String(rest[0]));
        return 'OK';
      }
      throw new Error(`comando ${String(name)} não simulado`);
    },
  };
}

let devStore: Store | null = null;

function storeFor(env: VisitsEnv, allowMemory: boolean): Store | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return upstash(url, token);
  if (allowMemory) return (devStore ??= memoryStore());
  return null;
}

async function visitorKey(request: Request): Promise<string> {
  const ip =
    request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`portfolio-visits:${ip}`));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `portfolio:visitor:${hex.slice(0, 32)}`;
}

/** `allowMemory`: só no servidor local (o total some ao reiniciar). */
export async function handleVisitsRequest(request: Request, env: VisitsEnv, allowMemory = false): Promise<Response> {
  const store = storeFor(env, allowMemory);
  if (!store) return json({ error: 'not-configured' }, 503);
  try {
    if (request.method === 'POST') {
      const fresh = await store.command('SET', await visitorKey(request), 1, 'NX', 'EX', COOLDOWN_SECONDS);
      if (fresh === 'OK') return json({ count: Number(await store.command('INCR', COUNT_KEY)), counted: true });
      return json({ count: Number((await store.command('GET', COUNT_KEY)) ?? 0), counted: false });
    }
    if (request.method === 'GET') return json({ count: Number((await store.command('GET', COUNT_KEY)) ?? 0) });
    return json({ error: 'method' }, 405);
  } catch (error) {
    console.error('[visitas]', error);
    return json({ error: 'upstream' }, 502);
  }
}
