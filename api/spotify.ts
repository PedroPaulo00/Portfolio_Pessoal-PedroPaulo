/**
 * Função serverless da Vercel: GET /api/spotify.
 * Configure SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET e SPOTIFY_REFRESH_TOKEN nas
 * variáveis de ambiente do projeto na Vercel (veja docs/GUIA.md).
 */
// Extensão .js de propósito: a Vercel compila cada arquivo para .js e não reescreve
// o import; com '.ts' a função quebra ao carregar (FUNCTION_INVOCATION_FAILED).
import { handleSpotifyRequest } from '../server/spotify.js';

export function GET(): Promise<Response> {
  return handleSpotifyRequest({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
  });
}
