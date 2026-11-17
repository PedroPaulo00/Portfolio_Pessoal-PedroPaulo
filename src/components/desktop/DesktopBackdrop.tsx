import { useState } from 'react';
import wallpaperDark1280 from '../../assets/wallpaper/wallpaper-dark-1280.webp';
import wallpaperDark1920 from '../../assets/wallpaper/wallpaper-dark-1920.webp';
import wallpaper1280 from '../../assets/wallpaper/wallpaper-1280.webp';
import wallpaper1920 from '../../assets/wallpaper/wallpaper-1920.webp';
import './desktop.css';

const WALLPAPERS = {
  light: { small: wallpaper1280, large: wallpaper1920 },
  dark: { small: wallpaperDark1280, large: wallpaperDark1920 },
} as const;
type Variant = keyof typeof WALLPAPERS;

/**
 * Papel de parede da área de trabalho: o de dia no tema claro e o noturno no
 * tema escuro (originais em src/assets/originais/wallpaper/, convertidos em WebP
 * por `npm run images`). Ao trocar de tema, um se dissolve no outro.
 * Cada um só é baixado quando o tema dele é usado pela primeira vez.
 * Camada fixa atrás da janela, decorativa: sem eventos, foco nem leitura.
 */
export function DesktopBackdrop({ dark }: { readonly dark: boolean }) {
  const current: Variant = dark ? 'dark' : 'light';
  const [used, setUsed] = useState<readonly Variant[]>([current]);
  if (!used.includes(current)) setUsed([...used, current]);

  return (
    <div className={`desktop-backdrop desktop-backdrop--${current}`} aria-hidden="true">
      {used.map((variant) => (
        <img
          key={variant}
          className={`desktop-backdrop__image${variant === current ? '' : ' is-hidden'}`}
          src={WALLPAPERS[variant].large}
          srcSet={`${WALLPAPERS[variant].small} 1280w, ${WALLPAPERS[variant].large} 1920w`}
          sizes="100vw"
          alt=""
          decoding="async"
          fetchPriority={variant === current ? 'high' : 'low'}
        />
      ))}
      <div className="desktop-backdrop__vignette" />
    </div>
  );
}
