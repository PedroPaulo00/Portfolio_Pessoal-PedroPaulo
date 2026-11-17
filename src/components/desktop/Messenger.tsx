import { useEffect, useRef, type CSSProperties } from 'react';
import messengerImage from '../../assets/desktop/msn-conteudo.webp';
import knock from '../../assets/desktop/msn-toc.json';
import knockSheet from '../../assets/desktop/msn-toc.webp';
import { useI18n } from '../../i18n/I18n';
import './messenger.css';

/**
 * Janela do MSN (ícone da área de trabalho): a imagem do Windows Live Messenger
 * com a mão por cima. Clicar na mão (ou no botão "Send a nudge" da imagem) faz o
 * "chamar a atenção" do MSN antigo: a mão bate três vezes na tela, a janela
 * treme e soa um "toc toc" no vidro.
 *
 * Os quadros da mão (sem fundo) e a posição dela vêm de `npm run images`
 * (msn-toc.webp e msn-toc.json, a partir de toc_toc.gif e msn_conteudo.png).
 */
export function Messenger() {
  const { t } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const nudge = () => {
    const hand = handRef.current;
    if (!hand) return;
    playKnocks(knock.impacts);

    // Quadros da batida, no tempo de cada um (do GIF); no fim, a mão parada.
    cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    const step = (now: number) => {
      let elapsed = now - start;
      let index = 0;
      while (index < knock.durations.length && elapsed >= knock.durations[index]!) {
        elapsed -= knock.durations[index]!;
        index++;
      }
      if (index >= knock.durations.length) {
        showFrame(hand, knock.sequence[0]!);
        return;
      }
      showFrame(hand, knock.sequence[index]!);
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);

    // A janela treme a partir da primeira batida (sem "reduzir movimento").
    const dialog = stageRef.current?.closest('dialog');
    if (dialog && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.getAnimations().forEach((animation) => animation.id === 'nudge' && animation.cancel());
      const shake = dialog.animate(SHAKE, { duration: 620, delay: knock.impacts[0] ?? 0, easing: 'linear' });
      shake.id = 'nudge';
    }
  };

  const box = (area: { left: number; top: number; width: number; height: number }): CSSProperties => ({
    left: `${area.left}%`,
    top: `${area.top}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
  });

  return (
    <div className="msn">
      <div ref={stageRef} className="msn__stage">
        <img className="msn__image" src={messengerImage} alt={t.msn.alt} draggable={false} />
        <button
          type="button"
          className="msn__hotspot"
          style={box(knock.nudgeButton)}
          aria-label={t.msn.nudgeButton}
          title={t.msn.nudgeButton}
          onClick={nudge}
        />
        <button
          ref={handRef}
          type="button"
          className="msn__hand"
          style={{
            ...box(knock.hand),
            backgroundImage: `url(${knockSheet})`,
            backgroundSize: `${knock.columns * 100}% ${knock.rows * 100}%`,
            ...framePosition(knock.sequence[0]!),
          }}
          aria-label={t.msn.knock}
          title={t.msn.knock}
          onClick={nudge}
        />
      </div>
      <p className="msn__hint">{t.msn.hint}</p>
    </div>
  );
}

/** Posição de um quadro na folha (grade de `columns` × `rows`). */
function framePosition(index: number): CSSProperties {
  const column = index % knock.columns;
  const row = Math.floor(index / knock.columns);
  return {
    backgroundPositionX: `${knock.columns > 1 ? (column / (knock.columns - 1)) * 100 : 0}%`,
    backgroundPositionY: `${knock.rows > 1 ? (row / (knock.rows - 1)) * 100 : 0}%`,
  };
}

function showFrame(element: HTMLElement, index: number) {
  const position = framePosition(index);
  element.style.backgroundPositionX = String(position.backgroundPositionX);
  element.style.backgroundPositionY = String(position.backgroundPositionY);
}

/** Tremor do "chamar a atenção": a janela sacode e volta ao lugar. */
const SHAKE: Keyframe[] = [
  { translate: '0 0' },
  { translate: '-9px 3px' },
  { translate: '8px -4px' },
  { translate: '-7px -3px' },
  { translate: '9px 4px' },
  { translate: '-6px 5px' },
  { translate: '6px -5px' },
  { translate: '-4px 2px' },
  { translate: '3px -2px' },
  { translate: '0 0' },
];

/* ---------------------------------------------------------------------------
   Som: "toc" no vidro, sintetizado (sem arquivo). Cada batida tem o baque do
   nó dos dedos (ruído curto e um grave rápido) e o tilintar do vidro (senos
   agudos que somem logo).
   --------------------------------------------------------------------------- */

let audio: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function playKnocks(impacts: readonly number[]) {
  try {
    audio ??= new AudioContext();
    void audio.resume().catch(() => undefined);
    const start = audio.currentTime + 0.02;
    impacts.forEach((ms, i) => tok(audio!, start + ms / 1000, i === impacts.length - 1 ? 1 : 0.85));
  } catch {
    /* sem Web Audio: só a animação */
  }
}

function tok(ctx: AudioContext, at: number, strength: number) {
  const out = ctx.createGain();
  out.gain.value = 0.5 * strength;
  out.connect(ctx.destination);

  // Baque: ruído de 30 ms passando por um filtro de banda.
  if (!noise) {
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
  }
  const hit = ctx.createBufferSource();
  hit.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 1900;
  band.Q.value = 0.9;
  const hitGain = ctx.createGain();
  hitGain.gain.value = 0.9;
  hit.connect(band).connect(hitGain).connect(out);
  hit.start(at);

  // Corpo: um grave curto que cai de tom (o nó do dedo no vidro).
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(210, at);
  body.frequency.exponentialRampToValueAtTime(95, at + 0.07);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.7, at);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
  body.connect(bodyGain).connect(out);
  body.start(at);
  body.stop(at + 0.1);

  // Vidro: parciais agudas e inarmônicas que somem rápido.
  for (const [frequency, level, decay] of [
    [1320, 0.32, 0.16],
    [2870, 0.16, 0.1],
    [4630, 0.08, 0.06],
  ] as const) {
    const ring = ctx.createOscillator();
    ring.type = 'sine';
    ring.frequency.value = frequency;
    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(level, at);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    ring.connect(ringGain).connect(out);
    ring.start(at);
    ring.stop(at + decay + 0.02);
  }
}
