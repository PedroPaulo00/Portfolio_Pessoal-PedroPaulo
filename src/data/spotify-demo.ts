/**
 * DADOS DE EXEMPLO do Spotify — usados SOMENTE em `npm run dev` enquanto
 * /api/spotify não está configurado, para visualizar o layout. Nunca aparecem
 * no site publicado. Nenhum destes nomes é real.
 */
import type { SpotifySnapshot, SpotifyTrack } from '../types/spotify';

const demoTrack = (n: number, artist: string, minutes = 3): SpotifyTrack => ({
  id: `demo-track-${n}`,
  name: `Faixa de exemplo ${n}`,
  url: 'https://open.spotify.com/',
  artists: [{ name: artist, url: 'https://open.spotify.com/' }],
  album: `Álbum de exemplo ${n}`,
  image: null,
  durationMs: minutes * 60_000 + n * 7_000,
});

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const spotifyDemo: SpotifySnapshot = {
  profile: {
    id: 'demo',
    name: 'Perfil de exemplo',
    url: 'https://open.spotify.com/',
    image: null,
    followers: 42,
  },
  nowPlaying: { track: demoTrack(1, 'Artista de exemplo A', 4), isPlaying: true, progressMs: 83_000 },
  recent: [
    { track: demoTrack(2, 'Artista de exemplo B'), playedAt: minutesAgo(6) },
    { track: demoTrack(3, 'Artista de exemplo C'), playedAt: minutesAgo(11) },
    { track: demoTrack(4, 'Artista de exemplo A'), playedAt: minutesAgo(48) },
    { track: demoTrack(5, 'Artista de exemplo D'), playedAt: minutesAgo(180) },
    { track: demoTrack(6, 'Artista de exemplo E'), playedAt: minutesAgo(60 * 26) },
  ],
  topArtists: ['A', 'B', 'C', 'D', 'E', 'F'].map((letter, i) => ({
    id: `demo-artist-${letter}`,
    name: `Artista de exemplo ${letter}`,
    url: 'https://open.spotify.com/',
    image: null,
    genres: i % 2 ? ['gênero de exemplo'] : ['outro gênero'],
  })),
  topTracks: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => demoTrack(n + 10, `Artista de exemplo ${'ABCDEFGH'[n - 1]}`)),
  playlists: [1, 2, 3, 4].map((n) => ({
    id: `demo-playlist-${n}`,
    name: `Playlist de exemplo ${n}`,
    url: 'https://open.spotify.com/',
    image: null,
    tracks: 12 * n,
  })),
  generatedAt: new Date().toISOString(),
};
