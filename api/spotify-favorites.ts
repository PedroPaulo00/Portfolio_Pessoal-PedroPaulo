/**
 * Função serverless da Vercel: GET /api/spotify-favorites?tracks=...&artists=...
 * Dados públicos do top 10 do dono (músicas e artistas). Usa as mesmas
 * variáveis de ambiente de /api/spotify (veja docs/GUIA.md).
 */
// Extensão .js de propósito: a Vercel compila cada arquivo para .js e não reescreve
// o import; com '.ts' a função quebra ao carregar (FUNCTION_INVOCATION_FAILED).
import { handleSpotifyFavoritesRequest } from '../server/spotify.js';

export function GET(request: Request): Promise<Response> {
  return handleSpotifyFavoritesRequest(
    {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
    },
    request.url,
  );
}
