import { useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { AeroDialog } from '../ui/AeroDialog';

/**
 * Botão de um link externo (o artigo do TCC) que pede confirmação antes de
 * sair do portfólio: uma janela explica para onde o visitante vai e só abre o
 * link (em nova aba) se ele escolher "Continuar".
 */
export function ArticleLink({
  url,
  className = 'aero-button',
  projectName,
}: {
  readonly url: string;
  readonly className?: string;
  readonly projectName?: string;
}) {
  const { t } = useI18n();
  const [asking, setAsking] = useState(false);

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => setAsking(true)}>
        {t.tccArticle}
        {projectName ? <span className="sr-only">{t.ofProject(projectName)}</span> : null}
      </button>
      <AeroDialog
        open={asking}
        title={t.redirectTitle}
        onClose={() => setAsking(false)}
        actions={
          <a
            className="aero-button aero-button--primary"
            href={url}
            target="_blank"
            rel="noreferrer"
            autoFocus
            onClick={() => setAsking(false)}
          >
            {t.redirectContinue}
            <span className="sr-only">{t.opensNewTab}</span>
          </a>
        }
      >
        <p className="article-confirm">{t.redirectText()}</p>
      </AeroDialog>
    </>
  );
}
