import type { ReactNode } from 'react';
import locationIcon from '../../assets/ui/location-icon.png';
import { useI18n } from '../../i18n/I18n';
import { Orb } from '../ui/Orb';

export interface Crumb {
  readonly label: string;
  /** Sem ação, o item é o destino atual (não clicável). */
  readonly onSelect?: () => void;
}

interface LocationBarProps {
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  readonly onBack: () => void;
  readonly onForward: () => void;
  readonly crumbs: readonly Crumb[];
  /** Campo de pesquisa, à direita (Grupo 3). */
  readonly search?: ReactNode;
}

/** Voltar/avançar em material 09 (≈ 29 px), caminho com IMAGEM1 e pesquisa à direita. */
export function LocationBar({ canGoBack, canGoForward, onBack, onForward, crumbs, search }: LocationBarProps) {
  const { t } = useI18n();
  return (
    <div className="location-bar">
      <div className="history-controls" role="group" aria-label={t.navigationHistory}>
        <button
          type="button"
          className="history-button orb-host"
          aria-label={t.goBack}
          title={t.goBack}
          disabled={!canGoBack}
          onClick={onBack}
        >
          <Orb variant={9} size={29}>
            <Arrow direction="left" />
          </Orb>
        </button>
        <button
          type="button"
          className="history-button orb-host"
          aria-label={t.goForward}
          title={t.goForward}
          disabled={!canGoForward}
          onClick={onForward}
        >
          <Orb variant={9} size={29}>
            <Arrow direction="right" />
          </Orb>
        </button>
      </div>

      <nav className="location-path" aria-label={t.location}>
        <img className="location-path__icon" src={locationIcon} alt="" width={22} height={22} />
        <ol className="location-path__list">
          {crumbs.map((crumb, index) => {
            const current = index === crumbs.length - 1;
            return (
              <li className="location-path__item" key={`${crumb.label}-${index}`}>
                {crumb.onSelect && !current ? (
                  <button type="button" className="location-path__crumb" title={crumb.label} onClick={crumb.onSelect}>
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className="location-path__current"
                    title={crumb.label}
                    aria-current={current ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {search}
    </div>
  );
}

/** Seta branca desenhada na grade de 72 do orbe. */
function Arrow({ direction }: { readonly direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M19 12H6m5-6-6 6 6 6' : 'M5 12h13m-5-6 6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
