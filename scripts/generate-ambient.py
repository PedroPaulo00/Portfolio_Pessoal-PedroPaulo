"""
Gera o som ambiente TEMPLATE do portfólio (ondas suaves + pad), original e sem
direitos de terceiros.

  python -I scripts/generate-ambient.py <saida.wav>

O sinal é periódico com período exato de 20 s (todas as frequências são
múltiplas de 0,05 Hz e o ruído é filtrado de forma circular). O arquivo tem 24 s:
2 s de margem + 20 s + 2 s. O player faz loop entre 2 s e 22 s, então o loop é
contínuo mesmo com o atraso/preenchimento que o codificador MP3 adiciona.
Substitua o arquivo final por qualquer outro som; veja docs/GUIA.md.
"""

import sys
import wave

import numpy as np

RATE = 44100
PERIOD = 20.0
TOTAL = 24.0
rng = np.random.default_rng(7)

n_period = int(RATE * PERIOD)
t_period = np.arange(n_period) / RATE


def periodic_noise(cutoff_low: float, cutoff_high: float) -> np.ndarray:
    """Ruído filtrado no domínio da frequência (circular → periódico)."""
    spectrum = np.fft.rfft(rng.standard_normal(n_period))
    freqs = np.fft.rfftfreq(n_period, 1 / RATE)
    shape = np.where((freqs >= cutoff_low) & (freqs <= cutoff_high), 1.0, 0.0)
    # Inclinação suave (mais grave = mais forte), como mar distante.
    shape *= 1.0 / np.maximum(freqs, 40.0) ** 0.6
    out = np.fft.irfft(spectrum * shape, n_period)
    return out / np.max(np.abs(out))


def swell(phase: float) -> np.ndarray:
    """Ondas: subida lenta e quebra mais rápida, períodos de 10 s e 20 s."""
    a = 0.5 - 0.5 * np.cos(2 * np.pi * (t_period / 10.0 + phase))
    b = 0.5 - 0.5 * np.cos(2 * np.pi * (t_period / 20.0 + phase / 2))
    return 0.25 + 0.75 * (a**2.2) * (0.6 + 0.4 * b)


left = periodic_noise(60, 900) * swell(0.0)
right = periodic_noise(60, 900) * swell(0.12)

# Pad: Dó maior com sétima, levemente desafinado; tremolo de 20/10/5 s.
pad = np.zeros(n_period)
for i, (freq, gain) in enumerate([(130.80, 0.5), (196.00, 0.35), (246.95, 0.28), (329.65, 0.2), (392.05, 0.12)]):
    tremolo = 0.6 + 0.4 * np.sin(2 * np.pi * t_period / (20.0 / (1 + i % 3)) + i)
    pad += gain * tremolo * (np.sin(2 * np.pi * freq * t_period) + 0.5 * np.sin(2 * np.pi * (freq + 0.15) * t_period))
pad /= np.max(np.abs(pad))

stereo_period = np.stack([0.55 * left + 0.32 * pad, 0.55 * right + 0.32 * pad], axis=1)
stereo_period *= 0.5 / np.max(np.abs(stereo_period))

# 24 s = 2 s (fim do período) + 20 s + 2 s (início do período): continuidade exata.
pad_samples = int(RATE * (TOTAL - PERIOD) / 2)
signal = np.concatenate([stereo_period[-pad_samples:], stereo_period, stereo_period[:pad_samples]])

pcm = (np.clip(signal, -1, 1) * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as out:
    out.setnchannels(2)
    out.setsampwidth(2)
    out.setframerate(RATE)
    out.writeframes(pcm.tobytes())
print(f"{sys.argv[1]}: {len(signal) / RATE:.1f} s")
