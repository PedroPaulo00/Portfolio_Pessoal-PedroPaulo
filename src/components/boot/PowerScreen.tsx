import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { PowerAction } from '../launcher/StartMenu';
import './power.css';

interface PowerScreenProps {
  readonly action: PowerAction;
  /** Fim da tela (já escureceu): o App mostra o botão de ligar ou reinicia. */
  readonly onDone: () => void;
}

/** Duração total, incluindo o escurecimento final (power.css usa os mesmos tempos). */
const SHOW_MS = 2600;
const SHOW_REDUCED_MS = 1000;

/**
 * "Desligando..." / "Reiniciando...": a tela azul de logon do Windows 7, com o
 * círculo de espera girando. No fim escurece até o preto, de onde volta o botão
 * de ligar (desligar) ou entra o vídeo de inicialização (reiniciar).
 */
export function PowerScreen({ action, onDone }: PowerScreenProps) {
  const { t } = useI18n();
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => done.current(), reduced ? SHOW_REDUCED_MS : SHOW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="power-screen" role="status" aria-live="assertive">
      <div className="power-screen__content">
        <span className="power-screen__spinner" aria-hidden="true" />
        <p className="power-screen__text">{action === 'restart' ? t.restarting : t.shuttingDown}</p>
      </div>
    </div>
  );
}
