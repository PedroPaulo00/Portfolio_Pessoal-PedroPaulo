/**
 * Núcleo do endpoint /api/spotify — independente de plataforma (Request/Response
 * padrão da Web). Usado pelo servidor de desenvolvimento do Vite e pela função
 * da Vercel em api/spotify.ts.
 *
 * Guarda as credenciais do DONO do portfólio no servidor e devolve só dados
 * públicos e enxutos (SpotifySnapshot). Escopos necessários no refresh token:
 *   user-read-currently-playing user-read-recently-played user-top-read
 */
import type {
  SpotifyArtist,
  SpotifyLink,
  SpotifyNowPlaying,
  SpotifyPlaylist,
  SpotifyProfile,
  SpotifyRecent,
  SpotifySnapshot,
  SpotifyTrack,
} from '../src/types/spotify.ts';

export interface SpotifyEnv {
  readonly SPOTIFY_CLIENT_ID?: string | undefined;
  readonly SPOTIFY_CLIENT_SECRET?: string | undefined;
  readonly SPOTIFY_REFRESH_TOKEN?: string | undefined;
}

/** Credenciais completas (após isConfigured). */
interface SpotifyCredentials {
  readonly SPOTIFY_CLIENT_ID: string;
  readonly SPOTIFY_CLIENT_SECRET: string;
  readonly SPOTIFY_REFRESH_TOKEN: string;
}

const API = 'https://api.spotify.com/v1';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken(env: SpotifyCredentials): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
  });
  if (!response.ok) throw new Error(`token ${response.status}`);
  const json = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/* ------------------------- mapeamento (tolerante) ------------------------- */

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' ? (v as Json) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const spotifyUrl = (v: unknown): string => str(obj(obj(v).external_urls).spotify);

/** Escolhe a imagem mais próxima de ~300 px (as listas vêm da maior para a menor). */
function image(images: unknown): string | null {
  const list = arr(images).map(obj);
  if (list.length === 0) return null;
  const sorted = [...list].sort(
    (a, b) => Math.abs((num(a.width) ?? 300) - 300) - Math.abs((num(b.width) ?? 300) - 300),
  );
  return str(sorted[0]?.url) || null;
}

function link(v: unknown): SpotifyLink {
  const o = obj(v);
  return { name: str(o.name), url: spotifyUrl(o) };
}

function track(v: unknown): SpotifyTrack | null {
  const o = obj(v);
  if (o.type !== undefined && o.type !== 'track') return null; // ignora podcasts/episódios
  const id = str(o.id);
  if (!id) return null;
  const album = obj(o.album);
  return {
    id,
    name: str(o.name),
    url: spotifyUrl(o),
    artists: arr(o.artists).map(link),
    album: str(album.name),
    image: image(album.images),
    durationMs: num(o.duration_ms) ?? 0,
  };
}

function artist(v: unknown): SpotifyArtist {
  const o = obj(v);
  return {
    id: str(o.id),
    name: str(o.name),
    url: spotifyUrl(o),
    image: image(o.images),
    genres: arr(o.genres)
      .map((g) => str(g))
      .filter(Boolean),
  };
}

/* ------------------------------ montagem ---------------------------------- */

/** O Spotify recusou por excesso de chamadas (HTTP 429) e pediu para esperar. */
// Sem "parameter properties" (constructor(readonly x)): o Node, que carrega
// este arquivo no servidor de desenvolvimento, não aceita essa sintaxe.
class RateLimited extends Error {
  readonly until: number;
  constructor(until: number) {
    super(`429: aguardar até ${new Date(until).toISOString()}`);
    this.until = until;
  }
}

/** Até quando o Spotify pediu para não chamar mais (0 = liberado). */
let blockedUntil = 0;

async function getJson(token: string, path: string): Promise<unknown> {
  if (Date.now() < blockedUntil) throw new RateLimited(blockedUntil);
  const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 204) return null; // nada tocando
  if (response.status === 429) {
    // Insistir durante o bloqueio pode prolongá-lo: respeita o Retry-After.
    const seconds = Number(response.headers.get('retry-after'));
    blockedUntil = Date.now() + (Number.isFinite(seconds) && seconds > 0 ? seconds : 60) * 1000;
    throw new RateLimited(blockedUntil);
  }
  if (!response.ok) throw new Error(`${path} ${response.status}`);
  return response.json();
}

/**
 * Perfil, mais ouvidos e playlists mudam devagar: buscados no máximo a cada
 * SLOW_MS. Só "tocando agora" e "últimas músicas" vão ao Spotify a cada
 * atualização (2 chamadas em vez de 6).
 */
const SLOW_MS = 60 * 60_000;
let slowCache: { readonly at: number; readonly data: readonly [unknown, unknown, unknown, unknown] } | null = null;

async function slowParts(token: string): Promise<readonly [unknown, unknown, unknown, unknown]> {
  if (slowCache && Date.now() - slowCache.at < SLOW_MS) return slowCache.data;
  const keep = (index: number) => (error: unknown) => {
    if (error instanceof RateLimited) throw error;
    return slowCache?.data[index] ?? null; // falha pontual: mantém o anterior
  };
  const data = await Promise.all([
    getJson(token, '/me'), // obrigatório
    getJson(token, '/me/top/artists?limit=8&time_range=short_term').catch(keep(1)),
    getJson(token, '/me/top/tracks?limit=10&time_range=short_term').catch(keep(2)),
    getJson(token, '/me/playlists?limit=20').catch(keep(3)),
  ] as const);
  slowCache = { at: Date.now(), data };
  return data;
}

export async function getSpotifySnapshot(env: SpotifyCredentials): Promise<SpotifySnapshot> {
  if (Date.now() < blockedUntil) throw new RateLimited(blockedUntil);
  const token = await accessToken(env);
  // O perfil é obrigatório; as demais partes degradam para vazio se falharem.
  const ignore = (error: unknown) => {
    if (error instanceof RateLimited) throw error;
    return null;
  };
  const [[me, artists, tracks, playlists], current, recent] = await Promise.all([
    slowParts(token),
    getJson(token, '/me/player/currently-playing').catch(ignore),
    getJson(token, '/me/player/recently-played?limit=10').catch(ignore),
  ]);

  const meObj = obj(me);
  const profile: SpotifyProfile = {
    id: str(meObj.id),
    name: str(meObj.display_name, str(meObj.id)),
    url: spotifyUrl(meObj),
    image: image(meObj.images),
    followers: num(obj(meObj.followers).total),
  };

  let nowPlaying: SpotifyNowPlaying | null = null;
  const currentObj = obj(current);
  const currentTrack = track(currentObj.item);
  if (currentTrack && currentObj.currently_playing_type === 'track') {
    nowPlaying = {
      track: currentTrack,
      isPlaying: currentObj.is_playing === true,
      progressMs: num(currentObj.progress_ms) ?? 0,
    };
  }

  const recentItems: SpotifyRecent[] = arr(obj(recent).items).flatMap((item) => {
    const t = track(obj(item).track);
    return t ? [{ track: t, playedAt: str(obj(item).played_at) }] : [];
  });

  // Só playlists públicas criadas pelo próprio dono.
  const publicPlaylists: SpotifyPlaylist[] = arr(obj(playlists).items)
    .map(obj)
    .filter((p) => p.public === true && str(obj(p.owner).id) === profile.id)
    .map((p) => ({
      id: str(p.id),
      name: str(p.name),
      url: spotifyUrl(p),
      image: image(p.images),
      tracks: num(obj(p.tracks).total) ?? num(obj(p.items).total),
    }));

  return {
    profile,
    nowPlaying,
    recent: recentItems,
    topArtists: arr(obj(artists).items).map(artist),
    topTracks: arr(obj(tracks).items).flatMap((t) => {
      const mapped = track(t);
      return mapped ? [mapped] : [];
    }),
    playlists: publicPlaylists,
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------ HTTP ------------------------------------- */

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  // Dados intencionalmente públicos; cache na borda (compartilhado entre todos os
  // visitantes) para poupar a API. Se a função falhar, a borda serve a última cópia.
  'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120, stale-if-error=86400',
  'Access-Control-Allow-Origin': '*',
};

export function isConfigured(env: SpotifyEnv): env is SpotifyEnv & SpotifyCredentials {
  return Boolean(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REFRESH_TOKEN);
}

/* ---------------------- limite de chamadas ao Spotify --------------------- */

/**
 * O botão "Atualizar" fura o cache da borda (`?fresh=`), então qualquer um poderia
 * disparar chamadas sem parar até o Spotify bloquear a conta (HTTP 429). Por
 * instância da função: no máximo uma busca a cada MIN_INTERVAL_MS (as demais
 * recebem a última resposta), chamadas simultâneas compartilham a mesma busca e,
 * se o Spotify falhar, serve-se a última resposta boa de até STALE_MS atrás.
 * Com HTTP 429, nenhuma chamada sai até passar o tempo pedido pelo Spotify.
 */
const MIN_INTERVAL_MS = 20_000;
const STALE_MS = 6 * 60 * 60_000;
let lastGood: { readonly body: string; readonly at: number } | null = null;
let inFlight: Promise<string> | null = null;

function snapshotBody(env: SpotifyCredentials): Promise<string> {
  if (lastGood && Date.now() - lastGood.at < MIN_INTERVAL_MS) return Promise.resolve(lastGood.body);
  inFlight ??= getSpotifySnapshot(env)
    .then((snapshot) => {
      const body = JSON.stringify(snapshot);
      lastGood = { body, at: Date.now() };
      return body;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export async function handleSpotifyRequest(env: SpotifyEnv): Promise<Response> {
  if (!isConfigured(env)) {
    return new Response(JSON.stringify({ error: 'not-configured' }), { status: 503, headers: HEADERS });
  }
  try {
    return new Response(await snapshotBody(env), { status: 200, headers: HEADERS });
  } catch (error) {
    // Token inválido pode ser a causa; no 429 o token está bom e não é refeito.
    if (!(error instanceof RateLimited)) cachedToken = null;
    console.error('[spotify]', error instanceof RateLimited ? error.message : error);
    if (lastGood && Date.now() - lastGood.at < STALE_MS) {
      return new Response(lastGood.body, { status: 200, headers: { ...HEADERS, 'Cache-Control': 'no-store' } });
    }
    return new Response(JSON.stringify({ error: 'upstream' }), {
      status: 502,
      headers: { ...HEADERS, 'Cache-Control': 'no-store' },
    });
  }
}
