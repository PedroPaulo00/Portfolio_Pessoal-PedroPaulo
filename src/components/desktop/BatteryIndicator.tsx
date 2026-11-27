import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18n';
import { playSystemSound } from '../../lib/systemSounds';

/** Parte da Battery Status API usada aqui (fora dos tipos padrão do TypeScript). */
interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly level: number;
}
type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryManager> };

interface BatteryState {
  readonly level: number;
  readonly charging: boolean;
}

/**
 * Bateria real do aparelho do visitante na bandeja, no estilo do Windows 7.
 * A Battery Status API só existe em navegadores Chromium (Chrome, Edge, Opera,
 * Samsung Internet, no celular e no notebook); no Safari e no Firefox ela não
 * existe e o ícone simplesmente não aparece. Abaixo de 10% sem carregar, toca
 * o aviso de "bateria fraca" do Windows (uma vez).
 */
export function BatteryIndicator() {
  const { t } = useI18n();
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    const getBattery = (navigator as NavigatorWithBattery).getBattery;
    if (typeof getBattery !== 'function') return;
    let manager: BatteryManager | null = null;
    let alive = true;
    const update = () => {
      if (!manager || !alive) return;
      const next = { level: Math.round(manager.level * 100), charging: manager.charging };
      if (!next.charging && next.level <= 10 && !warned.current) {
        warned.current = true;
        playSystemSound('batteryLow');
      }
      if (next.charging) warned.current = false;
      setBattery(next);
    };
    getBattery
      .call(navigator)
      .then((result) => {
        manager = result;
        manager.addEventListener('levelchange', update);
        manager.addEventListener('chargingchange', update);
        update();
      })
      .catch(() => {});
    return () => {
      alive = false;
      manager?.removeEventListener('levelchange', update);
      manager?.removeEventListener('chargingchange', update);
    };
  }, []);

  if (!battery) return null;
  const label = t.battery(battery.level, battery.charging);
  return (
    <span className="battery" role="img" aria-label={label} title={label}>
      <BatteryIcon level={battery.level} charging={battery.charging} />
    </span>
  );
}

/** Pilha vertical prateada, fundo verde-escuro e carga verde-clara de baixo para cima. */
function BatteryIcon({ level, charging }: BatteryState) {
  const id = useId();
  const inner = { x: 5.6, y: 4.6, w: 6.8, h: 12.2 };
  const fillH = Math.max(level > 0 ? 1.2 : 0, (inner.h * level) / 100);
  const fill = level <= 10 ? '#ff5b4d' : level <= 25 ? '#ffd257' : '#b5ffc7';
  return (
    <svg className="battery__icon" viewBox="0 0 18 20" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}frame`} x1="0" x2="1">
          <stop offset="0" stopColor="#7f8a8a" />
          <stop offset="0.35" stopColor="#f2f5f5" />
          <stop offset="1" stopColor="#9aa5a5" />
        </linearGradient>
      </defs>
      <rect x="7" y="1" width="4" height="2.2" rx="0.6" fill="#fff" stroke="#123c38" strokeWidth="0.8" />
      <rect
        x="3.6"
        y="2.6"
        width="10.8"
        height="16.2"
        rx="1.8"
        fill={`url(#${id}frame)`}
        stroke="#123c38"
        strokeWidth="1"
      />
      <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill="#2f5233" />
      <rect x={inner.x} y={inner.y + inner.h - fillH} width={inner.w} height={fillH} fill={fill} />
      {charging ? (
        <path
          d="M9.9 6 6.9 11h2.2l-1 4.4 3.2-5.4H9.1Z"
          fill="#fff6a8"
          stroke="#123c38"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}
