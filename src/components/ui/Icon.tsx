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
  | 'servicos'
  | 'sites'
  | 'apps'
  | 'sistemas'
  | 'automacao'
  | 'design'
  | 'formatacao'
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
        <linearGradient id={`${id}red`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb3a1" />
          <stop offset="0.55" stopColor="#e2553a" />
          <stop offset="1" stopColor="#a8301c" />
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
  // Serviços: caixa de ferramentas (azul, alça de aço, fecho âmbar).
  servicos: (g) => (
    <>
      <path d="M8.5 7.5V5.2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v2.3" fill="none" stroke="#46627c" strokeWidth="1.5" />
      <rect x="2.5" y="7.5" width="19" height="12.5" rx="1.4" fill={g('blue')} stroke="#0b4a85" strokeWidth="0.8" />
      <path d="M2.5 12.2h19" stroke="#0b4a85" strokeWidth="0.8" />
      <rect x="10" y="10.8" width="4" height="3" rx="0.6" fill={g('amber')} stroke="#a0661a" strokeWidth="0.6" />
      <path d="M3.3 8.3h17.4v3.4H3.3Z" fill={g('gloss')} opacity="0.65" />
    </>
  ),
  // Site: janela de navegador com cabeçalho, bloco de destaque e botão.
  sites: (g) => (
    <>
      <rect x="2" y="3.5" width="20" height="17" rx="1.4" fill={g('paper')} stroke="#4f7393" strokeWidth="0.8" />
      <path
        d="M2 4.9a1.4 1.4 0 0 1 1.4-1.4h17.2A1.4 1.4 0 0 1 22 4.9V7.5H2Z"
        fill={g('steel')}
        stroke="#4f7393"
        strokeWidth="0.8"
      />
      <circle cx="4.6" cy="5.5" r="0.8" fill="#e2553a" />
      <circle cx="7" cy="5.5" r="0.8" fill="#f2bb4a" />
      <circle cx="9.4" cy="5.5" r="0.8" fill="#6cc32a" />
      <rect x="4" y="9.3" width="16" height="5.2" rx="0.6" fill={g('blue')} />
      <path d="M4 9.3h16v2.2H4Z" fill={g('gloss')} opacity="0.55" />
      <rect x="4" y="16.2" width="6" height="2.4" rx="1.2" fill={g('green')} stroke="#2f6e10" strokeWidth="0.5" />
      <path d="M12 16.8h8M12 18.4h5" stroke="#9fb7cc" strokeWidth="0.9" strokeLinecap="round" />
    </>
  ),
  // App: celular com a tela azul e ícones de app.
  apps: (g) => (
    <>
      <rect x="6" y="1.8" width="12" height="20.4" rx="2.2" fill={g('steel')} stroke="#34495e" strokeWidth="0.8" />
      <rect x="7.3" y="4.2" width="9.4" height="14.8" rx="0.6" fill={g('blue')} />
      <rect x="8.4" y="5.6" width="3" height="3" rx="0.8" fill={g('green')} />
      <rect x="12.6" y="5.6" width="3" height="3" rx="0.8" fill={g('amber')} />
      <rect x="8.4" y="9.8" width="3" height="3" rx="0.8" fill={g('red')} />
      <rect x="12.6" y="9.8" width="3" height="3" rx="0.8" fill={g('paper')} />
      <path d="M7.3 4.2h9.4v5.2c-3 .8-6.3.8-9.4 0Z" fill={g('gloss')} opacity="0.5" />
      <rect x="10.4" y="20" width="3.2" height="0.9" rx="0.45" fill="#34495e" />
    </>
  ),
  // Sistema: monitor com um painel de gráfico de barras.
  sistemas: (g) => (
    <>
      <rect x="2.5" y="3" width="19" height="13.5" rx="1.2" fill={g('steel')} stroke="#46627c" strokeWidth="0.8" />
      <rect x="4" y="4.5" width="16" height="10.5" rx="0.4" fill={g('paper')} />
      <rect x="6" y="10" width="2.4" height="4" fill={g('blue')} />
      <rect x="9.6" y="7.6" width="2.4" height="6.4" fill={g('green')} />
      <rect x="13.2" y="9" width="2.4" height="5" fill={g('amber')} />
      <rect x="16.8" y="6.4" width="2.4" height="7.6" fill={g('blue')} />
      <path d="M4 4.5h16v3H4Z" fill={g('gloss')} opacity="0.45" />
      <path d="M9 16.5h6l1 3.5H8Z" fill={g('steel')} stroke="#46627c" strokeWidth="0.7" strokeLinejoin="round" />
    </>
  ),
  // Automação: setas em ciclo (verde) em volta de um raio (âmbar).
  automacao: (g) => (
    <>
      <path d="M19.2 9.2A7.6 7.6 0 0 0 5.4 7.4" fill="none" stroke="#2f6e10" strokeWidth="3.6" strokeLinecap="round" />
      <path
        d="M19.2 9.2A7.6 7.6 0 0 0 5.4 7.4"
        fill="none"
        stroke={g('green')}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M4.8 14.8a7.6 7.6 0 0 0 13.8 1.8" fill="none" stroke="#2f6e10" strokeWidth="3.6" strokeLinecap="round" />
      <path
        d="M4.8 14.8a7.6 7.6 0 0 0 13.8 1.8"
        fill="none"
        stroke={g('green')}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="m2.6 4.4 1 5.6 5.4-1.8Z" fill={g('green')} stroke="#2f6e10" strokeWidth="0.7" strokeLinejoin="round" />
      <path d="m21.4 19.6-1-5.6-5.4 1.8Z" fill={g('green')} stroke="#2f6e10" strokeWidth="0.7" strokeLinejoin="round" />
      <path
        d="M13 5.8 8.6 12.6h3l-1 5.6 4.8-7.2h-3.1Z"
        fill={g('amber')}
        stroke="#a0661a"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </>
  ),
  // Design: paleta de pintor com tintas e um pincel.
  design: (g) => (
    <>
      <path
        d="M12 2.8C6.6 2.8 2.5 6.6 2.5 11.4c0 4.6 3.9 8.3 8.7 8.3 1.5 0 2.2-.8 2.2-1.8 0-1.4-1.3-1.7-1.3-2.9 0-1 .8-1.6 1.9-1.6h2.6c3 0 4.9-1.9 4.9-4.6 0-3.7-4.2-6-9.5-6Z"
        fill={g('paper')}
        stroke="#8a6a3a"
        strokeWidth="0.9"
      />
      <circle cx="7" cy="9.6" r="1.7" fill={g('red')} />
      <circle cx="10.6" cy="6.4" r="1.7" fill={g('amber')} />
      <circle cx="15.2" cy="6.6" r="1.7" fill={g('green')} />
      <circle cx="7.2" cy="14.4" r="1.7" fill={g('blue')} />
      <path d="m21.6 13.2-6.4 6.4" stroke="#8a5a17" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m15.8 19-1.9 2.2 2.8-.9" fill="#34495e" stroke="#34495e" strokeWidth="0.8" strokeLinejoin="round" />
    </>
  ),
  // Formatação: gabinete de PC (aço, luz verde) com uma chave inglesa.
  formatacao: (g) => (
    <>
      <rect x="4.5" y="2.5" width="10" height="19" rx="1.2" fill={g('steel')} stroke="#46627c" strokeWidth="0.8" />
      <path d="M6.5 5.5h6M6.5 7.5h6" stroke="#46627c" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="9.5" cy="16.5" r="1.3" fill={g('green')} stroke="#2f6e10" strokeWidth="0.5" />
      <path d="M5.3 3.3h8.4v3.4H5.3Z" fill={g('gloss')} opacity="0.6" />
      <path
        d="M20.6 8.4a3 3 0 0 1-4 3.4l-4.6 4.6a1.3 1.3 0 0 1-1.8-1.8l4.6-4.6a3 3 0 0 1 3.4-4l-1.8 1.8.4 1.6 1.6.4Z"
        fill={g('blue')}
        stroke="#0b4a85"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
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
