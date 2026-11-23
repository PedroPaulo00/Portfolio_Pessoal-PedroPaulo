import { useEffect } from 'react';
import { useI18n } from '../../i18n/I18n';
import { dismissAchievement, useAchievementQueue } from '../../lib/achievements';
import './achievements.css';

/** Quanto a notificação fica na tela (as animações de entrada e saída estão no CSS). */
const SHOW_MS = 5200;

/** Pontuação, como no Xbox 360 (igual nas duas línguas). i18n-exempt */
const SCORE = '10G';

/**
 * Notificação de conquista no estilo do Xbox 360 (pílula escura com o selo verde
 * à esquerda e "10G" à direita). Mostra uma de cada vez, na ordem em que os
 * segredos foram achados. Decorativa para o mouse, mas anunciada aos leitores de tela.
 */
export function AchievementToast() {
  const { t } = useI18n();
  const queue = useAchievementQueue();
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(dismissAchievement, SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  return (
    <div className="achievement-region" role="status" aria-live="polite">
      {current ? (
        <div className="achievement-toast" key={current}>
          <span className="achievement-toast__badge" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <path
                d="M8 7h16v4.5c0 4.2-3 7.5-8 8-5-.5-8-3.8-8-8Zm0 2.2H5.2c0 3.3 1.3 5.4 3.4 6M24 9.2h2.8c0 3.3-1.3 5.4-3.4 6M16 19.5V24m-4.5 0h9"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="achievement-toast__text">
            <span className="achievement-toast__kicker">{t.achievementUnlocked}</span>
            <span className="achievement-toast__title">{t.achievements[current].title}</span>
            <span className="achievement-toast__desc">{t.achievements[current].desc}</span>
          </span>
          <span className="achievement-toast__score" aria-hidden="true">
            {SCORE}
          </span>
        </div>
      ) : null}
    </div>
  );
}
