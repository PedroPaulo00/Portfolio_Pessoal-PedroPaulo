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
 * Relógio da bandeja: hh:mm:ss e, abaixo, a data (só a hora em telas estreitas). Sem aria-live de propósito: anunciar a hora a
 * cada segundo atrapalharia leitores de tela. A data completa fica no title.
 */
export function TaskbarClock() {
  const now = useNow();
  const { intl } = useI18n();
  const { timeFormat, dateFormat, shortDateFormat } = useMemo(
    () => ({
      // 24 h nas duas línguas: o relógio tem largura fixa (hh:mm:ss).
      timeFormat: new Intl.DateTimeFormat(intl, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      dateFormat: new Intl.DateTimeFormat(intl, { dateStyle: 'full' }),
      // Segunda linha, como no Windows 7: 13/11/2026 (pt) · 11/13/2026 (en).
      shortDateFormat: new Intl.DateTimeFormat(intl, { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }),
    [intl],
  );
  return (
    <time className="taskbar__clock" dateTime={now.toISOString()} title={dateFormat.format(now)}>
      <span className="taskbar__clock-time">{timeFormat.format(now)}</span>
      <span className="taskbar__clock-date">{shortDateFormat.format(now)}</span>
    </time>
  );
}
