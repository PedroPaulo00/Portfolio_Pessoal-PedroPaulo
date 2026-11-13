import { useId, type JSX } from 'react';
import spotifyIcon from '../../assets/brands/spotify-icon.png';

/**
 * Família de ícones do projeto (seção 7D): originais, grade 24×24, luz de cima,
 * volume suave e brilho contido. Sempre decorativos; o nome acessível fica no controle.
 */
export type IconName =
  | 'inicio'
  | 'projetos'
  | 'sobre'
  | 'tecnologias'
  | 'contato'
  | 'privacidade'
  | 'configuracoes'
  | 'profissional'
  | 'academico'
  | 'pessoal'
  | 'link'
  | 'documento'
  | 'atualizar'
  | 'spotify';

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
}

export function Icon({ name, size = 24 }: IconProps) {
  const id = useId().replace(/:/g, '');

  // Marca de terceiros: usa o ícone oficial fornecido, sem redesenhar.
  if (name === 'spotify') {
    return <img className="aero-icon" src={spotifyIcon} alt="" width={size} height={size} />;
  }
  const g = (suffix: string) => `url(#${id}${suffix})`;

  return (
    <svg className="aero-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}blue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fe2ff" />
          <stop offset="0.5" stopColor="#2b93dc" />
          <stop offset="1" stopColor="#0d5aa6" />
        </linearGradient>
        <linearGradient id={`${id}amber`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.55" stopColor="#f2bb4a" />
          <stop offset="1" stopColor="#d48a1c" />
        </linearGradient>
        <linearGradient id={`${id}green`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6ff9c" />
          <stop offset="0.55" stopColor="#6cc32a" />
          <stop offset="1" stopColor="#3a8c14" />
        </linearGradient>
        <linearGradient id={`${id}paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e8f5" />
        </linearGradient>
        <linearGradient id={`${id}steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9f3fb" />
          <stop offset="0.5" stopColor="#9fb7cc" />
          <stop offset="1" stopColor="#5f7d98" />
        </linearGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {SHAPES[name](g)}
    </svg>
  );
}

type Paint = (suffix: string) => string;

const SHAPES: Record<Exclude<IconName, 'spotify'>, (g: Paint) => JSX.Element> = {
  inicio: (g) => (
    <>
      <path d="M5 11.5V20h14v-8.5" fill={g('paper')} stroke="#5a7d9c" strokeWidth="1" />
      <rect x="10" y="14" width="4" height="6" fill={g('amber')} stroke="#a0661a" strokeWidth="0.8" />
      <path
        d="M2.5 12 12 3.5l9.5 8.5-1.6 1.6L12 6.6l-7.9 7Z"
        fill={g('blue')}
        stroke="#0b4a85"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M5 11.2 12 5l7 6.2" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.7" />
    </>
  ),
  projetos: (g) => (
    <>
      <path
        d="M2.5 6.5a1 1 0 0 1 1-1h5.2l1.8 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1Z"
        fill={g('amber')}
        stroke="#a8701d"
        strokeWidth="0.8"
      />
      <rect x="5" y="8.5" width="14" height="7" rx="0.5" fill={g('paper')} stroke="#b8c8d6" strokeWidth="0.6" />
      <path d="M2.5 11h19v7.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1Z" fill={g('amber')} stroke="#a8701d" strokeWidth="0.8" />
      <path d="M3.5 11.6h17v2.4h-17Z" fill={g('gloss')} opacity="0.7" />
    </>
  ),
  sobre: (g) => (
    <>
      <circle cx="12" cy="8" r="4.2" fill={g('blue')} stroke="#0b4a85" strokeWidth="0.8" />
      <path
        d="M3.8 20.5c.6-4.6 3.9-7 8.2-7s7.6 2.4 8.2 7Z"
        fill={g('blue')}
        stroke="#0b4a85"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <ellipse cx="11" cy="6.4" rx="2.6" ry="1.5" fill={g('gloss')} />
      <path d="M6.5 18.2c1-2 3-3 5.5-3" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
    </>
  ),
  tecnologias: (g) => (
    <>
      <rect x="2.5" y="3.5" width="19" height="13.5" rx="1.2" fill={g('steel')} stroke="#46627c" strokeWidth="0.8" />
      <rect x="4" y="5" width="16" height="10.5" rx="0.4" fill={g('blue')} />
      <path
        d="m9.2 7.6-2.6 2.6 2.6 2.6m5.6-5.2 2.6 2.6-2.6 2.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 5h16v3.4H4Z" fill={g('gloss')} opacity="0.55" />
      <path d="M9 17h6l1 3H8Z" fill={g('steel')} stroke="#46627c" strokeWidth="0.7" strokeLinejoin="round" />
    </>
  ),
  privacidade: (g) => (
    <>
      <path
        d="M12 2.6 4.5 5.4v5.8c0 4.7 3.2 8.6 7.5 10.2 4.3-1.6 7.5-5.5 7.5-10.2V5.4Z"
        fill={g('blue')}
        stroke="#0b4a85"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="m8.4 12.1 2.6 2.6 4.8-5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 3.6 5.5 6v3.4c2-1.4 4.2-2.1 6.5-2.1s4.5.7 6.5 2.1V6Z" fill={g('gloss')} opacity="0.7" />
    </>
  ),
  contato: (g) => (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="1.2" fill={g('paper')} stroke="#4f7393" strokeWidth="0.9" />
      <path d="m3 6.2 9 6.8 9-6.8" fill="none" stroke={g('blue')} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m3 6.2 9 6.8 9-6.8" fill="none" stroke="#0d5aa6" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M3.5 6.3h17v3h-17Z" fill={g('gloss')} opacity="0.5" />
    </>
  ),
  profissional: (g) => (
    <>
      <path d="M9 6.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5" fill="none" stroke="#5a4020" strokeWidth="1.3" />
      <rect x="2.5" y="6.5" width="19" height="13" rx="1.5" fill={g('amber')} stroke="#8a5a17" strokeWidth="0.8" />
      <path d="M2.5 11.5h19" stroke="#8a5a17" strokeWidth="0.8" />
      <rect x="10.5" y="10.3" width="3" height="2.6" rx="0.5" fill={g('steel')} stroke="#5a4020" strokeWidth="0.6" />
      <path d="M3.3 7.3h17.4v3.4H3.3Z" fill={g('gloss')} opacity="0.6" />
    </>
  ),
  academico: (g) => (
    <>
      <path d="M6 11.5v4.2c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.2" fill={g('blue')} stroke="#0b4a85" strokeWidth="0.8" />
      <path
        d="M1.8 9 12 4.5 22.2 9 12 13.5Z"
        fill={g('blue')}
        stroke="#0b4a85"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M4.5 9 12 5.8 19.5 9" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" />
      <path d="M20 10v5.5" stroke="#d48a1c" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="16.3" r="1.2" fill={g('amber')} />
    </>
  ),
  pessoal: (g) => (
    <>
      <path
        d="M12 2.8a6.4 6.4 0 0 0-3.6 11.7c.6.5 1 1.2 1 2V17h5.2v-.5c0-.8.4-1.5 1-2A6.4 6.4 0 0 0 12 2.8Z"
        fill={g('amber')}
        stroke="#a0661a"
        strokeWidth="0.8"
      />
      <ellipse cx="10.4" cy="6.6" rx="2.4" ry="1.6" fill={g('gloss')} />
      <rect x="9.2" y="17.4" width="5.6" height="3.4" rx="0.8" fill={g('steel')} stroke="#46627c" strokeWidth="0.7" />
      <path d="M9.4 19h5.2" stroke="#46627c" strokeWidth="0.6" />
    </>
  ),
  atualizar: (g) => (
    <>
      <path
        d="M18.6 13.2A6.8 6.8 0 1 1 16.4 6.9"
        fill="none"
        stroke="#2f6e10"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M18.6 13.2A6.8 6.8 0 1 1 16.4 6.9"
        fill="none"
        stroke={g('green')}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M20.6 3.4v6.9h-6.9z" fill={g('green')} stroke="#2f6e10" strokeWidth="0.9" strokeLinejoin="round" />
    </>
  ),
  link: (g) => (
    <>
      <circle cx="12" cy="12" r="9.5" fill={g('blue')} stroke="#0b4a85" strokeWidth="0.8" />
      <path
        d="M2.8 12h18.4M12 2.5c2.6 2.6 3.8 5.8 3.8 9.5S14.6 18.9 12 21.5M12 2.5C9.4 5.1 8.2 8.3 8.2 12s1.2 6.9 3.8 9.5"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.75"
        strokeWidth="0.8"
      />
      <ellipse cx="10" cy="7" rx="5" ry="2.8" fill={g('gloss')} opacity="0.8" />
    </>
  ),
  documento: (g) => (
    <>
      <path
        d="M5 2.5h9.5l4.5 4.5v14.5H5Z"
        fill={g('paper')}
        stroke="#5a7d9c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M14.5 2.5V7H19" fill="#d6e6f4" stroke="#5a7d9c" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M8 10.5h8M8 13.5h8M8 16.5h5" stroke="#2b93dc" strokeWidth="1.1" strokeLinecap="round" />
    </>
  ),
  configuracoes: (g) => (
    <>
      <path
        d="M10.4 2.5h3.2l.5 2.4 1.6.7 2-1.4 2.3 2.3-1.4 2 .7 1.6 2.4.5v3.2l-2.4.5-.7 1.6 1.4 2-2.3 2.3-2-1.4-1.6.7-.5 2.4h-3.2l-.5-2.4-1.6-.7-2 1.4-2.3-2.3 1.4-2-.7-1.6-2.4-.5v-3.2l2.4-.5.7-1.6-1.4-2 2.3-2.3 2 1.4 1.6-.7Z"
        fill={g('steel')}
        stroke="#46627c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.4" fill={g('green')} stroke="#2f6e10" strokeWidth="0.8" />
      <ellipse cx="11.4" cy="10.9" rx="1.8" ry="1" fill={g('gloss')} />
    </>
  ),
};
