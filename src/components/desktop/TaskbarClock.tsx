import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../i18n/I18n';

/** Hora local do visitante, alinhada à virada de cada segundo. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let interval = 0;
    // Primeiro tique na próxima virada de segundo; depois, a cada 1 s.
    const timeout = window.setTimeout(
      () => {
        setNow(new Date());
        interval = window.setInterval(() => setNow(new Date()), 1000);
      },
      1000 - (Date.now() % 1000),
    );
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);
  return now;
}

/**
 * Relógio da bandeja (hh:mm:ss). Sem aria-live de propósito: anunciar a hora a
 * cada segundo atrapalharia leitores de tela. A data completa fica no title.
 */
export function TaskbarClock() {
  const now = useNow();
  const { intl } = useI18n();
  const { timeFormat, dateFormat } = useMemo(
    () => ({
      // 24 h nas duas línguas: o relógio tem largura fixa (hh:mm:ss).
      timeFormat: new Intl.DateTimeFormat(intl, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      dateFormat: new Intl.DateTimeFormat(intl, { dateStyle: 'full' }),
    }),
    [intl],
  );
  return (
    <time className="taskbar__clock" dateTime={now.toISOString()} title={dateFormat.format(now)}>
      {timeFormat.format(now)}
    </time>
  );
}
