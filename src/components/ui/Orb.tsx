import type { CSSProperties, ReactNode } from 'react';
import '../../styles/orbs.css';

/**
 * Materiais aprovados. Orientação (não obrigatória) do kit:
 * 1 Safira Seven = ação principal/navegação · 3 Lima Vista = confirmação ·
 * 7 Âmbar solar = destaque · 9 Obsidiana cromada = utilidades/secundárias.
 */
export type OrbVariant = 1 | 3 | 7 | 9;

interface OrbProps {
  readonly variant: OrbVariant;
  /** Diâmetro visual em px. O material é escalado como um conjunto completo. */
  readonly size?: number;
  /** Símbolo opcional, desenhado na grade de 72 (≈ 40–50% do diâmetro). */
  readonly children?: ReactNode;
}

/** Disco decorativo. O nome acessível pertence ao botão que o contém (.orb-host). */
export function Orb({ variant, size = 72, children }: OrbProps) {
  const style = { width: size, height: size, '--orb-scale': size / 72 } as CSSProperties;
  return (
    <span className="orb-fit" style={style} aria-hidden="true">
      <span className={`variant-orb v${variant}`}>
        {children ? <span className="orb-glyph">{children}</span> : null}
      </span>
    </span>
  );
}
