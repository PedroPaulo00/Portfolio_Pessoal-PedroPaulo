import { lazy, Suspense, useEffect } from 'react';
import { playEffect, useEffects } from '../../lib/eggBus';

// Os efeitos (animações em canvas e CSS) só são baixados quando algum roda.
const EffectsHost = lazy(() => import('./EffectsHost'));

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
/** Parado por tanto tempo: aparece o protetor de tela do DVD. */
const IDLE_MS = 30_000;
/** Parado por tanto tempo (antes do protetor): o Aquanauta lembra de beber água. */
const REMINDER_MS = 20_000;
const SWIPE_MIN = 40;

/**
 * Camada dos easter eggs de tela: escuta os gatilhos globais (Código Konami no
 * teclado, ou no celular deslizar a mesma sequência e tocar duas vezes; ficar
 * parado por 30 segundos; o aniversário do dono) e mostra os efeitos pedidos.
 */
export function EggLayer({ active }: { readonly active: boolean }) {
  const effects = useEffects();

  // Código Konami (↑ ↑ ↓ ↓ ← → ← → B A) e a versão para toque.
  useEffect(() => {
    if (!active) return;
    let step = 0;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const sequence = [...KONAMI, 'b', 'a'];
      step = key === sequence[step] ? step + 1 : key === sequence[0] ? 1 : 0;
      if (step === sequence.length) {
        step = 0;
        playEffect('konami');
      }
    };
    // Toque: 8 deslizes na ordem das setas e 2 toques (B A).
    let swipes = 0;
    let taps = 0;
    let down: { x: number; y: number } | null = null;
    // (touchstart/touchend, e não pointer events: ao deslizar, o navegador cancela os pointer events para rolar a página.)
    const onDown = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) down = { x: touch.clientX, y: touch.clientY };
    };
    const onUp = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!down || !touch) return;
      const dx = touch.clientX - down.x;
      const dy = touch.clientY - down.y;
      down = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) {
        if (swipes === KONAMI.length) {
          taps += 1;
          if (taps === 2) {
            swipes = 0;
            taps = 0;
            playEffect('konami');
          }
        }
        return;
      }
      const dir =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : dy > 0 ? 'ArrowDown' : 'ArrowUp';
      taps = 0;
      swipes = dir === KONAMI[swipes] ? swipes + 1 : dir === KONAMI[0] ? 1 : 0;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchend', onUp, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchend', onUp);
    };
  }, [active]);

  // Protetor de tela: 30 segundos sem mexer o mouse, clicar, tocar ou teclar.
  // Não aparece com um vídeo ou uma música com som tocando (como no Windows).
  useEffect(() => {
    if (!active) return;
    let timer = 0;
    let reminder = 0;
    const arm = () => {
      window.clearTimeout(timer);
      window.clearTimeout(reminder);
      timer = window.setTimeout(function show() {
        const watching = [...document.querySelectorAll<HTMLMediaElement>('video, audio')].some(
          (media) => !media.paused && !media.muted && !media.ended,
        );
        if (watching) timer = window.setTimeout(show, IDLE_MS);
        else playEffect('screensaver');
      }, IDLE_MS);
      // 20 segundos parado: o Aquanauta lembra de beber água (uma vez por visita).
      reminder = window.setTimeout(() => {
        try {
          if (sessionStorage.getItem('portfolio-aero:aquanauta') === '1') return;
          sessionStorage.setItem('portfolio-aero:aquanauta', '1');
        } catch {
          /* sem armazenamento: pode repetir */
        }
        playEffect('aquanauta');
      }, REMINDER_MS);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    events.forEach((name) => window.addEventListener(name, arm, { passive: true, capture: true }));
    arm();
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(reminder);
      events.forEach((name) => window.removeEventListener(name, arm, { capture: true }));
    };
  }, [active]);

  // Aniversário (20 de julho): balões, uma vez por visita.
  useEffect(() => {
    if (!active) return;
    const today = new Date();
    if (today.getMonth() !== 6 || today.getDate() !== 20) return;
    try {
      if (sessionStorage.getItem('portfolio-aero:birthday') === '1') return;
      sessionStorage.setItem('portfolio-aero:birthday', '1');
    } catch {
      /* sem armazenamento: toca de novo, sem problema */
    }
    const timer = window.setTimeout(() => playEffect('balloons'), 1800);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <>
      {effects.length > 0 ? (
        <Suspense fallback={null}>
          <EffectsHost effects={effects} />
        </Suspense>
      ) : null}
    </>
  );
}
