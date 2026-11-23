/**
 * Paleta de uma capa de álbum: as 3 cores mais marcantes (frequentes e vivas),
 * para tingir o Windows Media Player com as cores da música. As capas do Spotify
 * permitem leitura (CORS); se a leitura falhar, a paleta fica null (cores padrão).
 */
import { useEffect, useState } from 'react';

export type Rgb = readonly [number, number, number];
export interface Palette {
  /** Cor principal (a mais presente entre as vivas). */
  readonly primary: Rgb;
  readonly secondary: Rgb;
  readonly accent: Rgb;
}

const cache = new Map<string, Palette | null>();

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const h = max === rn ? (gn - bn) / d + (gn < bn ? 6 : 0) : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function extract(image: HTMLImageElement): Palette | null {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  // Agrupa em "baldes" de cor (4 bits por canal) e pontua: frequência × vivacidade.
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }
  const colors = [...buckets.values()]
    .map((bucket) => {
      const rgb: Rgb = [bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count];
      const [h, s, l] = rgbToHsl(rgb);
      const vivid = s * (1 - Math.abs(l - 0.5) * 1.6);
      return { rgb, h, score: bucket.count * (0.15 + Math.max(0, vivid)) };
    })
    .sort((a, b) => b.score - a.score);
  // As três primeiras com tons bem diferentes entre si.
  const picked: { rgb: Rgb; h: number }[] = [];
  for (const color of colors) {
    if (picked.every((p) => Math.min(Math.abs(p.h - color.h), 360 - Math.abs(p.h - color.h)) > 28)) picked.push(color);
    if (picked.length === 3) break;
  }
  if (picked.length === 0) return null;
  const at = (index: number) => picked[Math.min(index, picked.length - 1)]!.rgb;
  return { primary: at(0), secondary: at(1), accent: at(2) };
}

/** Paleta da capa em `src` (null enquanto carrega, sem capa ou se a leitura falhar). */
export function useCoverPalette(src: string | null | undefined): Palette | null {
  // Só serve para redesenhar quando a capa termina de carregar (o valor fica no cache).
  const [, setLoaded] = useState(0);
  useEffect(() => {
    if (!src || cache.has(src)) return;
    let alive = true;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const finish = (value: Palette | null) => {
      cache.set(src, value);
      if (alive) setLoaded((n) => n + 1);
    };
    image.onload = () => {
      try {
        finish(extract(image));
      } catch {
        finish(null); // imagem sem permissão de leitura: cores padrão
      }
    };
    image.onerror = () => finish(null);
    image.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return src ? (cache.get(src) ?? null) : null;
}

/** Clareia (amount > 0) ou escurece (amount < 0) uma cor, em 0–1. */
export function shade([r, g, b]: Rgb, amount: number): string {
  const mix = (c: number) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function hueOf(rgb: Rgb): number {
  return rgbToHsl(rgb)[0];
}
