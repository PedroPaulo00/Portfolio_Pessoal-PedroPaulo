import { useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { playEffect } from '../../lib/eggBus';
import { playSadTrombone } from '../../lib/eggs';
import { playSystemSound } from '../../lib/systemSounds';
import type { DesktopIconContent } from '../../types/portfolio';
import { Icon } from '../ui/Icon';

/**
 * Conteúdo da Lixeira: o escudo do Corinthians. Easter egg (dono palmeirense):
 * clicar no escudo o faz cair na pasta "Nanicos 🤏", com trombone triste,
 * "Item movido para a pasta Times Minúsculos" e confete verde e branco com "Avanti, Palestra!".
 */
export function RecycleBin({ content }: { readonly content: DesktopIconContent }) {
  const { t } = useI18n();
  const [moved, setMoved] = useState(false);

  return (
    <div className="desktop-window recycle-bin">
      <button
        type="button"
        className={`recycle-bin__crest${moved ? ' is-dropped' : ''}`}
        tabIndex={-1}
        onClick={() => {
          if (moved) return;
          setMoved(true);
          playSystemSound('recycle');
          playSadTrombone();
          playEffect('palestra');
        }}
      >
        <img className="desktop-window__image" src={content.image} alt={content.alt} decoding="async" />
      </button>
      {moved ? (
        <div className="recycle-bin__folder" role="status">
          <Icon name="projetos" size={72} />
          <strong>{t.eggs.serieB}</strong>
          <span>{t.eggs.movedToSerieB}</span>
        </div>
      ) : null}
    </div>
  );
}
