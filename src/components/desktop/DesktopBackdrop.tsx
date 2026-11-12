import wallpaper1280 from '../../assets/wallpaper/wallpaper-1280.webp';
import wallpaper1920 from '../../assets/wallpaper/wallpaper-1920.webp';
import './desktop.css';

/**
 * Papel de parede da área de trabalho: src/assets/originais/Wallpaper_fundo.png,
 * convertido em WebP por `npm run images`.
 * Camada fixa atrás da janela, decorativa: sem eventos, foco nem leitura.
 * Para trocar: substitua o original e rode `npm run images` (veja docs/GUIA.md).
 */
export function DesktopBackdrop() {
  return (
    <div className="desktop-backdrop" aria-hidden="true">
      <img
        className="desktop-backdrop__image"
        src={wallpaper1920}
        srcSet={`${wallpaper1280} 1280w, ${wallpaper1920} 1920w`}
        sizes="100vw"
        alt=""
        decoding="async"
        fetchPriority="high"
      />
      <div className="desktop-backdrop__vignette" />
    </div>
  );
}
