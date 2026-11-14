/**
 * Função serverless da Vercel: GET/POST /api/visits (contador de visitas).
 * Precisa de um banco Upstash Redis ligado ao projeto na Vercel (veja docs/GUIA.md).
 */
// Extensão .js de propósito (mesmo motivo de api/spotify.ts).
import { handleVisitsRequest } from '../server/visits.js';

const env = () => ({
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export function GET(request: Request): Promise<Response> {
  return handleVisitsRequest(request, env());
}

export function POST(request: Request): Promise<Response> {
  return handleVisitsRequest(request, env());
}
