import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import type { ProjectImage } from '../../types/portfolio';

interface PhotoCarouselProps {
  /** Fotos, na ordem. Vazia: mostra `slots` vagas "foto em breve". */
  readonly photos: readonly ProjectImage[];
  readonly slots: number;
}

/**
 * Carrossel de fotos: desliza com o dedo (ou a roda/trackpad), com botões de
 * anterior/próxima e pontos que mostram (e escolhem) a foto atual. Cada foto
 * "encaixa" ao parar de deslizar. Sem fotos ainda, mostra vagas provisórias.
 */
export function PhotoCarousel({ photos, slots }: PhotoCarouselProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const items: readonly (ProjectImage | null)[] =
    photos.length > 0 ? photos : Array.from({ length: slots }, () => null);
  const total = items.length;

  // Foto atual = a que está mais perto do começo da faixa visível.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slides = [...track.children] as HTMLElement[];
        let best = 0;
        let distance = Infinity;
        slides.forEach((slide, i) => {
          const d = Math.abs(slide.offsetLeft - track.scrollLeft);
          if (d < distance) {
            distance = d;
            best = i;
          }
        });
        // No fim da faixa, a última foto conta como atual.
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = slides.length - 1;
        setIndex(best);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (target: number) => {
    const track = trackRef.current;
    const slide = track?.children[(target + total) % total] as HTMLElement | undefined;
    if (!track || !slide) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: slide.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <div className="carousel" aria-roledescription={t.carousel} aria-label={t.photos}>
      <ul
        ref={trackRef}
        className="carousel__track"
        tabIndex={0}
        aria-label={t.photos}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(index + 1);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(index - 1);
          }
        }}
      >
        {items.map((photo, i) => (
          <li
            key={photo?.src ?? `vaga-${i}`}
            className="carousel__slide"
            aria-roledescription={t.slide}
            aria-label={t.photoNumber(i + 1, total)}
          >
            {photo ? (
              <img className="carousel__image" src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            ) : (
              <div className={`carousel__placeholder carousel__placeholder--${i % 4}`}>
                <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">
                  <rect x="5" y="13" width="38" height="27" rx="5" fill="rgba(255,255,255,0.85)" />
                  <path d="M17 13l3-5h8l3 5" fill="rgba(255,255,255,0.85)" />
                  <circle cx="24" cy="26" r="8" fill="none" stroke="#2b78b8" strokeWidth="3" />
                  <circle cx="24" cy="26" r="3" fill="#2b78b8" />
                  <circle cx="37" cy="18" r="1.8" fill="#2b78b8" />
                </svg>
                <span>{t.photoSoon}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="carousel__controls">
        <button type="button" className="carousel__arrow" aria-label={t.previousPhoto} onClick={() => go(index - 1)}>
          <span aria-hidden="true" className="carousel__arrow-glyph carousel__arrow-glyph--left" />
        </button>
        <div className="carousel__dots">
          {items.map((photo, i) => (
            <button
              key={photo?.src ?? `ponto-${i}`}
              type="button"
              className="carousel__dot"
              aria-label={t.photoNumber(i + 1, total)}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="carousel__arrow" aria-label={t.nextPhoto} onClick={() => go(index + 1)}>
          <span aria-hidden="true" className="carousel__arrow-glyph" />
        </button>
      </div>
    </div>
  );
}
