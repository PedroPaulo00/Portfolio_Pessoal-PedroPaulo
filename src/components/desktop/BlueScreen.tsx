import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18n';
import { playSystemSound } from '../../lib/systemSounds';
import './bluescreen.css';

/** Código de erro técnico (igual nas duas línguas). i18n-exempt */
const STOP = '*** STOP: 0x0000007B (0xDEADBEEF, 0x00000007, 0x1337C0DE, 0x00000000)';

/**
 * Tela azul da morte de mentirinha (easter egg do relógio): imita a do Windows 7
 * e some com qualquer tecla ou toque. Cobre tudo, inclusive a barra de tarefas.
 */
export function BlueScreen({ onDone }: { readonly onDone: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  // Só uma vez, ao aparecer (o efeito abaixo pode repetir se onDone mudar).
  useEffect(() => playSystemSound('criticalStop'), []);

  useEffect(() => {
    ref.current?.focus();
    const close = () => onDone();
    // Um instante de "susto" antes de aceitar o fechar (evita fechar no mesmo clique).
    const arm = window.setTimeout(() => {
      window.addEventListener('keydown', close);
      window.addEventListener('pointerdown', close);
    }, 400);
    return () => {
      window.clearTimeout(arm);
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', close);
    };
  }, [onDone]);

  return createPortal(
    <div ref={ref} className="bsod" role="alertdialog" aria-label={t.bsod.code} tabIndex={-1}>
      <p>{t.bsod.headline}</p>
      <p>{t.bsod.code}</p>
      <p>{t.bsod.first}</p>
      <p>{t.bsod.steps}</p>
      <p>{t.bsod.tech}</p>
      <p>{STOP}</p>
      <p className="bsod__press">{t.bsod.press}</p>
    </div>,
    document.body,
  );
}
