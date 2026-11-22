/**
 * Formato enxuto entregue por /api/spotify. É o único contrato entre o servidor
 * (server/spotify.ts) e o site: nenhum token ou dado privado chega ao navegador.
 */

export interface SpotifyLink {
  readonly name: string;
  readonly url: string;
}

export interface SpotifyProfile {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly image: string | null;
  readonly followers: number | null;
}

export interface SpotifyTrack {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly artists: readonly SpotifyLink[];
  readonly album: string;
  readonly image: string | null;
  readonly durationMs: number;
}

export interface SpotifyNowPlaying {
  readonly track: SpotifyTrack;
  readonly isPlaying: boolean;
  readonly progressMs: number;
}

export interface SpotifyRecent {
  readonly track: SpotifyTrack;
  readonly playedAt: string;
}

export interface SpotifyArtist {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly image: string | null;
  readonly genres: readonly string[];
}

export interface SpotifyPlaylist {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly image: string | null;
  readonly tracks: number | null;
}

export interface SpotifySnapshot {
  readonly profile: SpotifyProfile;
  readonly nowPlaying: SpotifyNowPlaying | null;
  readonly recent: readonly SpotifyRecent[];
  readonly playlists: readonly SpotifyPlaylist[];
  /** ISO 8601: momento em que o servidor montou a resposta. */
  readonly generatedAt: string;
}

/**
 * Top 10 escolhido pelo dono (músicas e artistas), entregue por
 * /api/spotify-favorites na ordem pedida. Itens que o Spotify não encontrar somem.
 */
export interface SpotifyFavorites {
  readonly tracks: readonly SpotifyTrack[];
  readonly artists: readonly SpotifyArtist[];
  /** Capas dos álbuns escolhidos como fundo dos artistas (pelo ID do álbum). */
  readonly albums?: readonly SpotifyAlbumArt[];
}

export interface SpotifyAlbumArt {
  readonly id: string;
  readonly name: string;
  readonly image: string | null;
}
