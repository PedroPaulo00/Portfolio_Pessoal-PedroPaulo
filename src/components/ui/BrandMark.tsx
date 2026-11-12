import { useId } from 'react';
import type { UiStrings } from '../../i18n/ui';
import type { Profile } from '../../types/portfolio';

interface BrandMarkProps {
  readonly profile: Profile;
  readonly size: number;
}

/** Iniciais do primeiro e do último nome ("Seu Nome" → "SN"). */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return (first + last).toLocaleUpperCase('pt-BR') || '?';
}

/**
 * Nome acessível dos botões que abrem o menu. Com a marca provisória, as iniciais
 * ficam visíveis no botão; elas iniciam o nome para quem usa comando de voz
 * (WCAG 2.5.3, rótulo no nome). Com logo em imagem, não há texto visível.
 */
export function menuButtonLabel(profile: Profile, t: UiStrings): string {
  return profile.logo ? t.openMenu(profile.name) : t.openMenuInitials(initialsOf(profile.name), profile.name);
}

/**
 * Logo do portfólio. Usa `profile.logo` quando configurado; senão desenha uma
 * MARCA PROVISÓRIA (iniciais em um disco de vidro), a ser substituída pelo logo real.
 * Sempre decorativa: quem a contém fornece o nome acessível.
 */
export function BrandMark({ profile, size }: BrandMarkProps) {
  const uid = useId().replace(/:/g, '');

  if (profile.logo) {
    return (
      <img
        className="brand-mark"
        src={profile.logo.src}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  const initials = initialsOf(profile.name);
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}ring`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9ff9a" />
          <stop offset="0.5" stopColor="#6cc32a" />
          <stop offset="1" stopColor="#2f7d12" />
        </linearGradient>
        <linearGradient id={`${uid}disc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fdcff" />
          <stop offset="0.48" stopColor="#1d86d6" />
          <stop offset="0.52" stopColor="#0a4f96" />
          <stop offset="1" stopColor="#1aa3d8" />
        </linearGradient>
        <radialGradient id={`${uid}glow`} cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#8ff6ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#8ff6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${uid}ring)`} stroke="#1f5a0c" strokeOpacity="0.6" />
      <circle cx="32" cy="32" r="25" fill={`url(#${uid}disc)`} stroke="#c9f1ff" strokeOpacity="0.9" />
      <circle cx="32" cy="32" r="25" fill={`url(#${uid}glow)`} />
      <text
        x="32"
        y="40.5"
        textAnchor="middle"
        fontFamily="Frutiger, 'Segoe UI', Arial, sans-serif"
        fontWeight="700"
        fontSize={initials.length > 1 ? 22 : 26}
        fill="#fff"
        stroke="#063a6b"
        strokeOpacity="0.55"
        strokeWidth="1"
        paintOrder="stroke"
      >
        {initials}
      </text>
      <path d="M12 26c2-10 10-16 20-16s18 6 20 16c-6-3-13-4.5-20-4.5S18 23 12 26Z" fill={`url(#${uid}gloss)`} />
    </svg>
  );
}
