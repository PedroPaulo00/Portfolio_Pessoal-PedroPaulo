#!/usr/bin/env node
/**
 * Obtém o SPOTIFY_REFRESH_TOKEN do dono do portfólio (executar UMA vez, localmente).
 *
 *   1. Crie um app em https://developer.spotify.com/dashboard
 *      - Redirect URI: http://127.0.0.1:8888/callback   (exatamente assim)
 *      - API: Web API
 *   2. Coloque em .env.local:
 *        SPOTIFY_CLIENT_ID=...
 *        SPOTIFY_CLIENT_SECRET=...
 *   3. npm run spotify:auth   → abra o link, autorize com SUA conta.
 *
 * O refresh token é gravado em .env.local (ignorado pelo git). Copie os três
 * valores também para as variáveis de ambiente da hospedagem (Vercel).
 */
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';

const ENV_FILE = new URL('../.env.local', import.meta.url);
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';
const SCOPES = ['user-read-currently-playing', 'user-read-recently-played', 'user-top-read'];

function readEnv() {
  if (!existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    readFileSync(ENV_FILE, 'utf8')
      .split(/\r?\n/)
      .filter((line) => /^\s*[A-Z_]+\s*=/.test(line))
      .map((line) => {
        const [key, ...rest] = line.split('=');
        return [
          key.trim(),
          rest
            .join('=')
            .trim()
            .replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}

function saveRefreshToken(token) {
  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '';
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${current.replace(/\s*$/, '')}\n${line}\n`;
  writeFileSync(ENV_FILE, next.replace(/^\n/, ''));
}

const env = readEnv();
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Defina SPOTIFY_CLIENT_ID e SPOTIFY_CLIENT_SECRET em .env.local antes (veja .env.example).');
  process.exit(1);
}

const state = randomBytes(16).toString('hex');
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    state,
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', REDIRECT_URI);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }
  const done = (status, message) => {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }).end(message);
    server.close();
  };
  if (url.searchParams.get('state') !== state) return done(400, 'Estado inválido. Rode o script de novo.');
  const code = url.searchParams.get('code');
  if (!code) return done(400, `Autorização negada: ${url.searchParams.get('error') ?? 'sem código'}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
  });
  const json = await response.json();
  if (!response.ok || !json.refresh_token) {
    console.error('Falha ao trocar o código:', json);
    return done(500, 'Falha ao obter o token. Veja o terminal.');
  }
  saveRefreshToken(json.refresh_token);
  console.log('\nSPOTIFY_REFRESH_TOKEN gravado em .env.local.');
  console.log('Rode `npm run dev` e abra a aba Spotify. Para publicar, copie as 3 variáveis para a hospedagem.');
  done(200, 'Pronto! Pode fechar esta aba e voltar ao terminal.');
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Abra este link no navegador e autorize com a SUA conta do Spotify:\n');
  console.log(authUrl, '\n');
});
