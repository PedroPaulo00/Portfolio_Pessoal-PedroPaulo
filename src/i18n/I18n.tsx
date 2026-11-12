/**
 * Idioma atual para toda a interface: textos (`t`), formatação (`intl`) e troca
 * (`setLocale`, que salva a escolha). O conteúdo do portfólio já chega traduzido
 * pelo App (src/i18n/content.ts).
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../types/portfolio';
import { applyLocale, getLocale, intlLocale } from './locale';
import { ui, type UiStrings } from './ui';

interface I18nValue {
  readonly locale: Locale;
  readonly t: UiStrings;
  /** Código para Intl (datas, números, tempo relativo). */
  readonly intl: string;
  readonly setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue>({
  locale: 'pt',
  t: ui.pt,
  intl: intlLocale.pt,
  setLocale: () => undefined,
});

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale);

  const setLocale = useCallback((next: Locale) => {
    applyLocale(next, true);
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, t: ui[locale], intl: intlLocale[locale], setLocale }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
