import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { useI18n } from '../../i18n/I18n';
import './datetime.css';

type View = 'days' | 'months' | 'years';

interface Cursor {
  readonly year: number;
  readonly month: number;
}

/** Limites do calendário (como o do Windows, que também não vai ao infinito). */
const MIN_YEAR = 1900;
const MAX_YEAR = 2099;

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const clampYear = (year: number) => Math.min(MAX_YEAR, Math.max(MIN_YEAR, year));

/**
 * As 42 casas do mês (6 semanas, de domingo a sábado). Como no Windows 7, se o
 * mês começa num domingo a primeira linha é a última semana do mês anterior.
 */
function monthCells({ year, month }: Cursor): Date[] {
  const first = new Date(year, month, 1);
  const start = addDays(first, -(first.getDay() || 7));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

interface DateTimeFlyoutProps {
  readonly id: string;
  readonly panelRef: Ref<HTMLDivElement>;
  /** Hora atual (atualizada a cada segundo pelo relógio da bandeja). */
  readonly now: Date;
  readonly onClose: () => void;
  /** Link do rodapé: abre as configurações de aparência/idioma do site. */
  readonly onOpenSettings: () => void;
}

/**
 * Painel de data e hora do Windows 7: data por extenso, calendário navegável
 * (mês → ano → década, como no original), relógio analógico e hora digital.
 *
 * Calendário: setas trocam mês/ano/década; o título sobe um nível; clicar num
 * dia o seleciona; a data do topo volta para hoje. Teclado na grade de dias:
 * setas, Home/End (semana) e PageUp/PageDown (mês).
 */
export function DateTimeFlyout({ id, panelRef, now, onClose, onOpenSettings }: DateTimeFlyoutProps) {
  const { t, intl } = useI18n();
  const titleId = useId();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [view, setView] = useState<View>('days');
  const [cursor, setCursor] = useState<Cursor>(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [selected, setSelected] = useState(today);
  // Dia que recebe o foco do teclado (um só item da grade fica no Tab).
  const [focusDate, setFocusDate] = useState(today);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(true); // ao abrir: foco no dia de hoje

  const format = useMemo(
    () => ({
      full: new Intl.DateTimeFormat(intl, { dateStyle: 'full' }),
      monthYear: new Intl.DateTimeFormat(intl, { month: 'long', year: 'numeric' }),
      month: new Intl.DateTimeFormat(intl, { month: 'short' }),
      weekdayNarrow: new Intl.DateTimeFormat(intl, { weekday: 'narrow' }),
      weekdayLong: new Intl.DateTimeFormat(intl, { weekday: 'long' }),
      time: new Intl.DateTimeFormat(intl, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    }),
    [intl],
  );

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });
  }, [focusDate, view]);

  const cells = useMemo(() => monthCells(cursor), [cursor]);
  // 2 de janeiro de 2000 foi um domingo: base para os nomes dos dias da semana.
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(2000, 0, 2 + index)), []);
  const decade = Math.floor(cursor.year / 10) * 10;

  /** Mostra outro mês; o dia em foco acompanha (mesmo dia, ajustado ao tamanho do mês). */
  const showMonth = (year: number, month: number) => {
    const target = new Date(clampYear(year), month, 1);
    const next = { year: clampYear(target.getFullYear()), month: target.getMonth() };
    setCursor(next);
    setFocusDate(new Date(next.year, next.month, Math.min(focusDate.getDate(), daysIn(next.year, next.month))));
  };

  const step = (direction: -1 | 1) => {
    if (view === 'days') showMonth(cursor.year, cursor.month + direction);
    else showMonth(cursor.year + direction * (view === 'months' ? 1 : 10), cursor.month);
  };

  const pickDay = (date: Date) => {
    setSelected(date);
    setFocusDate(date);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  const goToToday = () => {
    setView('days');
    pickDay(today);
    moveFocus.current = true;
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (view !== 'days') return;
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -focusDate.getDay(),
      End: 6 - focusDate.getDay(),
    };
    let next: Date | null = null;
    if (event.key in offsets) next = addDays(focusDate, offsets[event.key] ?? 0);
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      const month = focusDate.getMonth() + (event.key === 'PageUp' ? -1 : 1);
      const first = new Date(focusDate.getFullYear(), month, 1);
      next = new Date(
        first.getFullYear(),
        first.getMonth(),
        Math.min(focusDate.getDate(), daysIn(first.getFullYear(), first.getMonth())),
      );
    }
    if (!next || next.getFullYear() < MIN_YEAR || next.getFullYear() > MAX_YEAR) return;
    event.preventDefault();
    moveFocus.current = true;
    setFocusDate(next);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const title =
    view === 'days'
      ? format.monthYear.format(new Date(cursor.year, cursor.month, 1))
      : view === 'months'
        ? String(cursor.year)
        : `${decade}-${decade + 9}`;
  const stepLabel = {
    days: [t.previousMonth, t.nextMonth],
    months: [t.previousYear, t.nextYear],
    years: [t.previousDecade, t.nextDecade],
  }[view];

  return (
    <div
      ref={panelRef}
      id={id}
      className="datetime-flyout"
      role="dialog"
      aria-label={t.dateAndTime}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="datetime-flyout__sheet">
        <button type="button" className="datetime-flyout__today" title={t.goToToday} onClick={goToToday}>
          {format.full.format(now)}
        </button>

        <div className="datetime-flyout__body">
          <div className="cal">
            <div className="cal__head">
              <button
                type="button"
                className="cal__arrow cal__arrow--previous"
                aria-label={stepLabel[0]}
                title={stepLabel[0]}
                onClick={() => step(-1)}
              />
              {view === 'years' ? (
                <span id={titleId} className="cal__title" aria-live="polite">
                  {title}
                </span>
              ) : (
                <button
                  type="button"
                  id={titleId}
                  className="cal__title"
                  aria-live="polite"
                  title={view === 'days' ? t.chooseMonth : t.chooseYear}
                  onClick={() => {
                    setView(view === 'days' ? 'months' : 'years');
                    moveFocus.current = true;
                  }}
                >
                  {title}
                </button>
              )}
              <button
                type="button"
                className="cal__arrow cal__arrow--next"
                aria-label={stepLabel[1]}
                title={stepLabel[1]}
                onClick={() => step(1)}
              />
            </div>

            {view === 'days' ? (
              <div
                ref={gridRef}
                key="days"
                className="cal__view"
                role="grid"
                aria-labelledby={titleId}
                onKeyDown={onGridKeyDown}
              >
                <div className="cal__row" role="row">
                  {weekdays.map((weekday) => (
                    <span
                      key={weekday.getDay()}
                      className="cal__weekday"
                      role="columnheader"
                      aria-label={format.weekdayLong.format(weekday)}
                    >
                      {format.weekdayNarrow.format(weekday)}
                    </span>
                  ))}
                </div>
                {Array.from({ length: 6 }, (_, row) => (
                  <div className="cal__row" role="row" key={row}>
                    {cells.slice(row * 7, row * 7 + 7).map((date) => {
                      const isToday = sameDay(date, today);
                      const isSelected = sameDay(date, selected);
                      const classes = [
                        'cal__day',
                        date.getMonth() === cursor.month ? '' : 'is-outside',
                        isToday ? 'is-today' : '',
                        isSelected ? 'is-selected' : '',
                      ];
                      return (
                        <div key={dayKey(date)} role="gridcell" aria-selected={isSelected}>
                          <button
                            type="button"
                            className={classes.filter(Boolean).join(' ')}
                            tabIndex={sameDay(date, focusDate) ? 0 : -1}
                            aria-label={format.full.format(date)}
                            aria-current={isToday ? 'date' : undefined}
                            onClick={() => pickDay(date)}
                          >
                            {date.getDate()}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}

            {view === 'months' ? (
              <div ref={gridRef} key="months" className="cal__view cal__tiles" role="group" aria-labelledby={titleId}>
                {Array.from({ length: 12 }, (_, month) => {
                  const date = new Date(cursor.year, month, 1);
                  const current = cursor.year === today.getFullYear() && month === today.getMonth();
                  return (
                    <button
                      key={month}
                      type="button"
                      className={`cal__tile${current ? ' is-today' : ''}${month === cursor.month ? ' is-selected' : ''}`}
                      tabIndex={month === cursor.month ? 0 : undefined}
                      aria-label={format.monthYear.format(date)}
                      aria-current={current ? 'date' : undefined}
                      onClick={() => {
                        showMonth(cursor.year, month);
                        setView('days');
                        moveFocus.current = true;
                      }}
                    >
                      {format.month.format(date).replace('.', '')}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {view === 'years' ? (
              <div ref={gridRef} key="years" className="cal__view cal__tiles" role="group" aria-labelledby={titleId}>
                {Array.from({ length: 12 }, (_, index) => {
                  const year = decade - 1 + index;
                  const outside = index === 0 || index === 11;
                  const available = year >= MIN_YEAR && year <= MAX_YEAR;
                  return (
                    <button
                      key={year}
                      type="button"
                      className={`cal__tile${outside ? ' is-outside' : ''}${year === today.getFullYear() ? ' is-today' : ''}${year === cursor.year ? ' is-selected' : ''}`}
                      tabIndex={year === cursor.year ? 0 : undefined}
                      disabled={!available}
                      aria-current={year === today.getFullYear() ? 'date' : undefined}
                      onClick={() => {
                        showMonth(year, cursor.month);
                        setView('months');
                        moveFocus.current = true;
                      }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="datetime-flyout__clock">
            <AnalogClock now={now} label={t.clockShows(format.time.format(now))} />
            <time className="datetime-flyout__time" dateTime={now.toISOString()}>
              {format.time.format(now)}
            </time>
          </div>
        </div>

        <div className="datetime-flyout__footer">
          <button type="button" className="datetime-flyout__link" onClick={onOpenSettings}>
            {t.dateTimeSettings}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Relógio analógico de vidro do Windows 7: aro metálico, 12 marcas e três ponteiros. */
function AnalogClock({ now, label }: { readonly now: Date; readonly label: string }) {
  const uid = useId().replace(/:/g, '');
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  return (
    <svg className="analog-clock" viewBox="0 0 160 160" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`${uid}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f7f9" />
          <stop offset="0.45" stopColor="#aab7c1" />
          <stop offset="1" stopColor="#6f808c" />
        </linearGradient>
        <linearGradient id={`${uid}rimInner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7f909c" />
          <stop offset="1" stopColor="#e9eef2" />
        </linearGradient>
        <radialGradient id={`${uid}face`} cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f1f4f6" />
          <stop offset="1" stopColor="#cfd8de" />
        </radialGradient>
        <linearGradient id={`${uid}gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="80" cy="82" r="76" fill="#000" opacity="0.12" />
      <circle cx="80" cy="80" r="77" fill={`url(#${uid}rim)`} stroke="#5c6c78" strokeWidth="1" />
      <circle cx="80" cy="80" r="71" fill={`url(#${uid}rimInner)`} />
      <circle cx="80" cy="80" r="68.5" fill={`url(#${uid}face)`} stroke="#8d9ba6" strokeWidth="0.8" />
      {/* Sombra interna do vidro (canto inferior direito) e reflexo (superior esquerdo). */}
      <path d="M128 31a68.5 68.5 0 0 1-97 97 78 78 0 0 0 97-97Z" fill="#7c8b96" opacity="0.2" />
      <path d="M21 92A62 62 0 0 1 120 28 92 92 0 0 0 21 92Z" fill={`url(#${uid}gloss)`} opacity="0.7" />

      {Array.from({ length: 12 }, (_, index) => {
        const major = index % 3 === 0;
        return (
          <line
            key={index}
            x1="80"
            y1={major ? 17 : 18}
            x2="80"
            y2={major ? 29 : 25}
            stroke={major ? '#4f6170' : '#8493a0'}
            strokeWidth={major ? 3 : 1.6}
            transform={`rotate(${index * 30} 80 80)`}
          />
        );
      })}

      <g stroke="#2c4558" strokeLinecap="round">
        <line x1="80" y1="90" x2="80" y2="42" strokeWidth="5" transform={`rotate(${hours * 30} 80 80)`} />
        <line x1="80" y1="93" x2="80" y2="24" strokeWidth="3.2" transform={`rotate(${minutes * 6} 80 80)`} />
      </g>
      <line
        x1="80"
        y1="98"
        x2="80"
        y2="20"
        stroke="#8795a1"
        strokeWidth="1.1"
        strokeLinecap="round"
        transform={`rotate(${seconds * 6} 80 80)`}
      />
      <circle cx="80" cy="80" r="5.2" fill="#22394b" stroke="#132736" strokeWidth="0.8" />
      <circle cx="78.6" cy="78.6" r="1.6" fill="#8fa6b6" />
    </svg>
  );
}
