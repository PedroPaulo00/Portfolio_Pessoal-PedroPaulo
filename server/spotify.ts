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

async function getJson(token: string, path: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 204) return null; // nada tocando
  if (!response.ok) throw new Error(`${path} ${response.status}`);
  return response.json();
}

export async function getSpotifySnapshot(env: SpotifyCredentials): Promise<SpotifySnapshot> {
  const token = await accessToken(env);
  // O perfil é obrigatório; as demais partes degradam para vazio se falharem.
  const [me, current, recent, artists, tracks, playlists] = await Promise.all([
    getJson(token, '/me'),
    getJson(token, '/me/player/currently-playing').catch(() => null),
    getJson(token, '/me/player/recently-played?limit=10').catch(() => null),
    getJson(token, '/me/top/artists?limit=8&time_range=short_term').catch(() => null),
    getJson(token, '/me/top/tracks?limit=10&time_range=short_term').catch(() => null),
    getJson(token, '/me/playlists?limit=20').catch(() => null),
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
  // Dados intencionalmente públicos; cache curto na borda para poupar a API.
  'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
  'Access-Control-Allow-Origin': '*',
};

export function isConfigured(env: SpotifyEnv): env is SpotifyEnv & SpotifyCredentials {
  return Boolean(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_REFRESH_TOKEN);
}

export async function handleSpotifyRequest(env: SpotifyEnv): Promise<Response> {
  if (!isConfigured(env)) {
    return new Response(JSON.stringify({ error: 'not-configured' }), { status: 503, headers: HEADERS });
  }
  try {
    return new Response(JSON.stringify(await getSpotifySnapshot(env)), { status: 200, headers: HEADERS });
  } catch (error) {
    cachedToken = null;
    console.error('[spotify]', error);
    return new Response(JSON.stringify({ error: 'upstream' }), {
      status: 502,
      headers: { ...HEADERS, 'Cache-Control': 'no-store' },
    });
  }
}
