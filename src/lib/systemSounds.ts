/**
 * Sons do sistema do Windows 7 (esquema padrão, o mesmo do Vista): o clique de
 * navegação, minimizar/restaurar, o balão das janelas, o "ding" do volume etc.
 * Ficam em src/assets/audio/sistema (MP3 curtos, ~130 KB ao todo), são baixados
 * no primeiro toque/tecla do visitante e seguem o volume de "Efeitos" da bandeja.
 */
import { effectsGain } from './effectsVolume';
import balao from '../assets/audio/sistema/balao.mp3';
import bateriaFraca from '../assets/audio/sistema/bateria-fraca.mp3';
import desligar from '../assets/audio/sistema/desligar.mp3';
import ding from '../assets/audio/sistema/ding.mp3';
import erroCritico from '../assets/audio/sistema/erro-critico.mp3';
import informacao from '../assets/audio/sistema/informacao.mp3';
import lixeira from '../assets/audio/sistema/lixeira.mp3';
import menu from '../assets/audio/sistema/menu.mp3';
import minimizar from '../assets/audio/sistema/minimizar.mp3';
import navegar from '../assets/audio/sistema/navegar.mp3';
import notificar from '../assets/audio/sistema/notificar.mp3';
import padrao from '../assets/audio/sistema/padrao.mp3';
import restaurar from '../assets/audio/sistema/restaurar.mp3';

const FILES = {
  /** "Iniciar navegação": troca de página/seção e links. */
  navigate: navegar,
  minimize: minimizar,
  restore: restaurar,
  /** "Comando de menu": abrir o menu Iniciar. */
  menu,
  /** "Balão de notificação": janelas pop-up. */
  popup: balao,
  ding,
  /** "Padrão": o bipe de quando se ajusta o volume na bandeja. */
  volume: padrao,
  criticalStop: erroCritico,
  recycle: lixeira,
  shutdown: desligar,
  /** "Barra de informações": confirmações discretas (e-mail copiado). */
  info: informacao,
  batteryLow: bateriaFraca,
  notify: notificar,
} as const;

export type SystemSound = keyof typeof FILES;

let audio: AudioContext | null = null;
const buffers = new Map<SystemSound, Promise<AudioBuffer | null>>();

function context(): AudioContext | null {
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

function load(name: SystemSound): Promise<AudioBuffer | null> {
  let pending = buffers.get(name);
  if (!pending) {
    const ctx = context();
    pending = ctx
      ? fetch(FILES[name])
          .then((response) => response.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .catch(() => null)
      : Promise.resolve(null);
    buffers.set(name, pending);
  }
  return pending;
}

/** Baixa e decodifica todos (chamado no primeiro gesto, para o clique sair na hora). */
export function preloadSystemSounds(): void {
  for (const name of Object.keys(FILES) as SystemSound[]) void load(name);
}

/** Toca um som do sistema no volume da bandeja (nada se estiver mudo). */
export function playSystemSound(name: SystemSound): void {
  const level = effectsGain();
  if (level <= 0) return;
  const ctx = context();
  if (!ctx) return;
  void load(name).then((buffer) => {
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = level;
    source.connect(gain).connect(ctx.destination);
    source.start();
  });
}

let installed = false;

/**
 * Liga os sons globais: baixa tudo no primeiro gesto e toca o clique de
 * navegação nos links que abrem fora do portfólio (os de seção já tocam ao
 * trocar de rota, no App).
 */
export function installSystemSounds(): () => void {
  if (installed) return () => {};
  installed = true;
  const warm = () => {
    preloadSystemSounds();
    window.removeEventListener('pointerdown', warm, true);
    window.removeEventListener('keydown', warm, true);
  };
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    const href = link?.getAttribute('href') ?? '';
    if (link && !href.startsWith('#')) playSystemSound('navigate');
  };
  window.addEventListener('pointerdown', warm, true);
  window.addEventListener('keydown', warm, true);
  document.addEventListener('click', onClick, true);
  return () => {
    installed = false;
    warm();
    document.removeEventListener('click', onClick, true);
  };
}
