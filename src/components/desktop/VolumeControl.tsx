import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { AmbientSound } from '../../lib/ambient';

/**
 * Volume do som de fundo na bandeja, no estilo do painel de volume do Windows 7:
 * controle deslizante vertical + botão de silenciar. Painel não modal: fecha
 * com Esc, clique fora ou ao sair com Tab; devolve o foco ao botão.
 */
export function VolumeControl({ sound }: { readonly sound: AmbientSound }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const silent = sound.muted || sound.volume === 0;

  const label = silent ? t.soundOff : t.soundLevel(sound.volume);

  useEffect(() => {
    if (!open) return;
    sliderRef.current?.focus();
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
        <SpeakerIcon level={silent ? 0 : sound.volume} />
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
          <span className="volume__value" aria-hidden="true">
            {sound.muted ? '—' : sound.volume}
          </span>
          <input
            ref={sliderRef}
            className="volume__slider"
            type="range"
            min={0}
            max={100}
            step={5}
            value={sound.muted ? 0 : sound.volume}
            aria-label={t.volume}
            aria-valuetext={sound.muted ? t.muted : `${sound.volume}%`}
            onChange={(event) => sound.setVolume(Number(event.target.value))}
          />
          <button
            type="button"
            className="volume__mute"
            aria-pressed={sound.muted}
            title={sound.muted ? t.unmute : t.mute}
            onClick={sound.toggleMute}
          >
            <SpeakerIcon level={sound.muted ? 0 : sound.volume} />
            <span className="sr-only">{t.mute}</span>
          </button>
          {sound.status === 'waiting-interaction' ? <p className="volume__hint">{t.soundWaiting}</p> : null}
          {sound.status === 'error' ? <p className="volume__hint">{t.soundError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Alto-falante: ondas conforme o volume; com "x" vermelho quando silenciado. */
function SpeakerIcon({ level }: { readonly level: number }) {
  return (
    <svg className="volume__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 9h4l5-4.5v15l-5-4.5h-4Z" fill="#fff" stroke="#1b3c52" strokeWidth="0.8" strokeLinejoin="round" />
      {level === 0 ? (
        <path d="m15.5 9.5 5 5m0-5-5 5" stroke="#ff5a4a" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
          {level > 33 ? <path d="M17.8 7a7.2 7.2 0 0 1 0 10" /> : null}
          {level > 66 ? <path d="M20.2 4.8a10.4 10.4 0 0 1 0 14.4" /> : null}
        </g>
      )}
    </svg>
  );
}
