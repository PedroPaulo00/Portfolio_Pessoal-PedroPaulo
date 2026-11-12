/**
 * Função serverless da Vercel: GET /api/spotify.
 * Configure SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET e SPOTIFY_REFRESH_TOKEN nas
 * variáveis de ambiente do projeto na Vercel (veja docs/GUIA.md).
 */
import { handleSpotifyRequest } from '../server/spotify.ts';

export function GET(): Promise<Response> {
  return handleSpotifyRequest({
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: process.env.SPOTIFY_REFRESH_TOKEN,
  });
}
