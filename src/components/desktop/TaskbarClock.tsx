import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { DateTimeFlyout } from './DateTimeFlyout';

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

interface TaskbarClockProps {
  /** Link "Alterar configurações de data e hora..." do painel. */
  readonly onOpenSettings: (opener: HTMLElement | null) => void;
}

/**
 * Relógio da bandeja: hh:mm:ss e, abaixo, a data (só a hora em telas estreitas).
 * É um botão: abre o painel de data e hora (calendário + relógio analógico), que
 * fecha com Esc, clique fora ou ao sair com Tab. Sem aria-live de propósito:
 * anunciar a hora a cada segundo atrapalharia leitores de tela.
 */
export function TaskbarClock({ onOpenSettings }: TaskbarClockProps) {
  const now = useNow();
  const { t, intl } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

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

  useEffect(() => {
    if (!open) return;
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
    <div className="datetime">
      <button
        ref={buttonRef}
        type="button"
        className="taskbar__clock"
        title={dateFormat.format(now)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="taskbar__clock-time">{timeFormat.format(now)}</span>
        <span className="taskbar__clock-date">{shortDateFormat.format(now)}</span>
        <span className="sr-only">{t.openDateAndTime}</span>
      </button>
      {open ? (
        <DateTimeFlyout
          id={panelId}
          panelRef={panelRef}
          now={now}
          onClose={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
          onOpenSettings={() => {
            setOpen(false);
            onOpenSettings(buttonRef.current);
          }}
        />
      ) : null}
    </div>
  );
}
