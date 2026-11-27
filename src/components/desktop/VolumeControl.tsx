import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { AmbientSound } from '../../lib/ambient';
import { setEffectsVolume, toggleEffectsMute, useEffectsPrefs } from '../../lib/effectsVolume';
import { playSystemSound } from '../../lib/systemSounds';

/**
 * Volume na bandeja, no estilo do Mixer de Volume do Windows 7: duas colunas,
 * uma para a música de fundo e outra para os efeitos sonoros (sons do Windows,
 * conquistas, easter eggs), cada uma com controle vertical e botão de silenciar.
 * Painel não modal: fecha com Esc, clique fora ou ao sair com Tab; devolve o
 * foco ao botão.
 */
export function VolumeControl({ sound }: { readonly sound: AmbientSound }) {
  const { t } = useI18n();
  const effects = useEffectsPrefs();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const musicLevel = sound.muted ? 0 : sound.volume;
  const effectsLevel = effects.muted ? 0 : effects.volume;

  const label = t.soundMixerLabel(musicLevel, effectsLevel);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    const close = (event: Event) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('focusin', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('focusin', close);
    };
  }, [open]);

  return (
    <div className="volume">
      <button
        ref={buttonRef}
        type="button"
        className="volume__button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {/* O ícone mostra o canal mais alto; mudo só quando os dois estão calados. */}
        <SpeakerIcon level={Math.max(musicLevel, effectsLevel)} />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="volume__panel"
          role="dialog"
          aria-label={t.soundPanel}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
        >
          <div className="volume__channels">
            <VolumeChannel
              name={t.soundMusic}
              volume={sound.volume}
              muted={sound.muted}
              onVolume={sound.setVolume}
              onToggleMute={sound.toggleMute}
            />
            <VolumeChannel
              name={t.soundEffects}
              volume={effects.volume}
              muted={effects.muted}
              onVolume={setEffectsVolume}
              onToggleMute={toggleEffectsMute}
              // Como no Windows 7: ao soltar o controle, o bipe "Padrão" no volume novo.
              onSettle={() => playSystemSound('volume')}
            />
          </div>
          {sound.status === 'waiting-interaction' ? <p className="volume__hint">{t.soundWaiting}</p> : null}
          {sound.status === 'error' ? <p className="volume__hint">{t.soundError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Uma coluna do mixer: nome, valor, controle vertical e botão de silenciar. */
function VolumeChannel({
  name,
  volume,
  muted,
  onVolume,
  onToggleMute,
  onSettle,
}: {
  readonly name: string;
  readonly volume: number;
  readonly muted: boolean;
  readonly onVolume: (volume: number) => void;
  readonly onToggleMute: () => void;
  /** Soltou o controle (ou mudou pelo teclado) / tirou do mudo. */
  readonly onSettle?: () => void;
}) {
  const { t } = useI18n();
  const level = muted ? 0 : volume;
  return (
    <div className="volume__channel">
      <span className="volume__name" aria-hidden="true">
        {name}
      </span>
      <span className="volume__value" aria-hidden="true">
        {muted ? '—' : volume}
      </span>
      <input
        className="volume__slider"
        type="range"
        min={0}
        max={100}
        step={5}
        value={level}
        aria-label={t.volumeOf(name)}
        aria-valuetext={muted ? t.muted : `${volume}%`}
        onChange={(event) => onVolume(Number(event.target.value))}
        onPointerUp={onSettle}
        onKeyUp={(event) => {
          if (event.key.startsWith('Arrow') || ['Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
            onSettle?.();
          }
        }}
      />
      <button
        type="button"
        className="volume__mute"
        aria-pressed={muted}
        title={`${muted ? t.unmute : t.mute}: ${name}`}
        onClick={() => {
          onToggleMute();
          onSettle?.();
        }}
      >
        <SpeakerIcon level={level} />
        <span className="sr-only">{t.muteOf(name)}</span>
      </button>
    </div>
  );
}

/**
 * Alto-falante da bandeja no estilo do Windows Vista/7: caixa lilás, cone branco
 * e ondas verdes conforme o volume; silenciado, o sinal vermelho de "proibido".
 */
function SpeakerIcon({ level }: { readonly level: number }) {
  const id = useId();
  const outline = '#123c38';
  return (
    <svg className="volume__icon" viewBox="0 0 20 20" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}box`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d8ee0" />
          <stop offset="1" stopColor="#d6d6fb" />
        </linearGradient>
        <linearGradient id={`${id}cone`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9dee2" />
        </linearGradient>
      </defs>
      <path d="M1.5 7h3.5v6H1.5Z" fill={`url(#${id}box)`} stroke={outline} strokeWidth="1" strokeLinejoin="round" />
      <path
        d="M5 7 10.5 2.5v15L5 13Z"
        fill={`url(#${id}cone)`}
        stroke={outline}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {level === 0 ? (
        <g>
          <circle cx="14.2" cy="13.2" r="4.6" fill="#e3121b" stroke="#7a0008" strokeWidth="0.9" />
          <circle cx="14.2" cy="13.2" r="2.9" fill="none" stroke="#fff" strokeWidth="1.3" />
          <path d="m12.2 11.2 4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ) : (
        <g fill="none" strokeLinecap="round">
          {[
            { d: 'M12.6 8.2a2.6 2.6 0 0 1 0 3.6', show: true },
            { d: 'M14.6 6.4a5.2 5.2 0 0 1 0 7.2', show: level > 33 },
            { d: 'M16.7 4.6a7.8 7.8 0 0 1 0 10.8', show: level > 66 },
          ]
            .filter((wave) => wave.show)
            .map((wave) => (
              <g key={wave.d}>
                <path d={wave.d} stroke={outline} strokeWidth="3" />
                <path d={wave.d} stroke="#a6f0bd" strokeWidth="1.6" />
              </g>
            ))}
        </g>
      )}
    </svg>
  );
}
