export interface Anime {
  title: string;
  episode: number;
  releaseDate: string;
  resolutions: string;
  url?: string;
  slug?: string;
}

export interface Sources {
  [key: string]: string;
}

export interface Resolution {
  resolution: string;
  sources: Sources;
}

export interface Episode {
  chapter: Anime;
  resolutions: Resolution[];
}

export interface Options {
  page?: number;
  combinePages?: boolean;
  interval?: number | string;
}

export interface Show {
  title: string;
  url: string;
}
