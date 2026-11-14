import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleSpotifyRequest, type SpotifyEnv } from './server/spotify.ts';
import { handleVisitsRequest, type VisitsEnv } from './server/visits.ts';

/**
 * Pré-carrega as fontes WOFF2 do build (Frutiger 400/700), que de outro modo só
 * seriam descobertas depois do CSS — reduz a troca de fonte no primeiro paint.
 */
function preloadFonts(): Plugin {
  return {
    name: 'portfolio-preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return;
        return Object.keys(ctx.bundle)
          .filter((file) => file.endsWith('.woff2'))
          .map((file) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: `./${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head' as const,
          }));
      },
    },
  };
}

/**
 * /api/spotify em `npm run dev` e `npm run preview`, lendo as credenciais de
 * .env.local (nunca enviado ao navegador: só variáveis VITE_* são expostas).
 * Em produção, o mesmo núcleo roda como função serverless (api/spotify.ts).
 */
function spotifyApi(): Plugin {
  let env: SpotifyEnv = {};
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/api/spotify')) return next();
    handleSpotifyRequest(env)
      .then(async (response) => {
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      })
      .catch(next);
  };
  return {
    name: 'portfolio-spotify-api',
    configResolved(config) {
      env = loadEnv(config.mode, config.root, 'SPOTIFY_');
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

/**
 * /api/visits em `npm run dev` e `npm run preview`. Com KV_REST_API_URL/TOKEN em
 * .env.local usa o banco real; sem eles, um contador em memória (zera ao reiniciar).
 */
function visitsApi(): Plugin {
  let env: VisitsEnv = {};
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/api/visits')) return next();
    const request = new Request(`http://localhost${req.url}`, {
      method: req.method ?? 'GET',
      headers: { 'x-real-ip': req.socket.remoteAddress ?? 'local' },
    });
    handleVisitsRequest(request, env, true)
      .then(async (response) => {
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      })
      .catch(next);
  };
  return {
    name: 'portfolio-visits-api',
    configResolved(config) {
      env = loadEnv(config.mode, config.root, ['KV_', 'UPSTASH_']);
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

// O aero-ui-kit fica dentro da raiz do projeto e é consumido diretamente (fontes e
// imagens), sem cópias: o kit continua sendo a fonte única de verdade visual.
export default defineConfig({
  plugins: [react(), preloadFonts(), spotifyApi(), visitsApi()],
  // Caminhos relativos: o build funciona na raiz de um domínio ou em subpasta
  // (ex.: GitHub Pages) sem reconfiguração.
  base: './',
  build: {
    target: 'es2022',
  },
});
