import type { ReactNode } from 'react';
import { RouteLink } from '../../lib/navigation';
import type { Route } from '../../lib/router';
import { Orb, type OrbVariant } from './Orb';

interface OrbActionProps {
  readonly variant: OrbVariant;
  readonly label: string;
  readonly glyph: ReactNode;
  readonly size?: number;
}

/** Orbe + rótulo visível ao lado. Ação de navegação: renderiza um link real. */
export function OrbLink({ variant, label, glyph, size = 44, to }: OrbActionProps & { readonly to: Route }) {
  return (
    <RouteLink to={to} className="orb-action orb-host">
      <Orb variant={variant} size={size}>
        {glyph}
      </Orb>
      <span className="orb-action__label">{label}</span>
    </RouteLink>
  );
}

/** Glifos brancos na grade de 72 do orbe (≈ 45% do diâmetro). */
export const glyphs = {
  folder: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7.5h6.5l2 2H21V19H3Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};
