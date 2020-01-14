import { get } from 'request-promise-native';
import { parse, HTMLElement } from 'node-html-parser';
import { red } from 'chalk';
import { downloadSearchPages, downloadEpisodesPages } from './utils';
import { Show, Options } from './types';

const defaultInterval = parseInt(process.env.HBS_INTERVAL || '500', 10);
const BASE_URL = process.env.HBS_BASE_URL || 'https://horriblesubs.info';

/*
 * @function
 * @param {string} searchedAnime The anime searched for, the string should have the format 'The+Name+episode'
 * @param {Object} options
 * @param {number} options.page The search results are paginated, with this you can select which page you need, starts at 0
 * @param {boolean} options.combinePages When true it will download and combine the pages starting from 0 to the page value
 * @param {number} options.interval The time between each request to horrible subs
 * @return {Promise<Anime[]>} A promise of all found episodes
 *
 */
export const searchAnime = (
  searchedAnime: string,
  { page = 0, combinePages = false, interval = defaultInterval }: Options = {}
) => {
  if (searchedAnime) {
    const pagesKeys = combinePages ? [...Array(page + 1).keys()] : [page];

    return downloadSearchPages(searchedAnime, pagesKeys, interval);
  } else {
    const message =
      'You need to send and anime title to get the search results';

    console.log(red(message));
    throw Error(message);
  }
};

/*
 * @async
 * @function
 * @param {string} animeSlug The anime searched for, the string should have the format 'The-Anime-With-Swrods'
 * @return {Promise<string>} A promise of the anime id
 *
 */
export const getAnimeID = async (animeSlug: string): Promise<number> => {
  if (animeSlug) {
    try {
      const htmlPage = await get(`${BASE_URL}/${animeSlug.toLowerCase()}`);
      const document = parse(htmlPage, { script: true }) as HTMLElement;
      const animeID = document
        .querySelector('.entry-content')
        .querySelector('script')
        .text.match(/[\d]{1,}/g);

      return animeID ? parseInt(animeID[0], 10) : 0;
    } catch (e) {
      const message = 'Failed to retrieved the anime id';

      console.log(red(message));

      if (process.env.HBS_DEBUG) {
        console.log(e);
      }

      throw Error(message);
    }
  } else {
    const message = 'You should send an anime slug to retrieved the anime id';

    console.log(red(message));
    throw Error(message);
  }
};

/*
 * @async
 * @function
 * @param {Object} animeSearched
 * @param {string} animeSearched.slug The slug of the anime searched for, the string should have the format 'The-Anime-With-Swrods'
 * @param {number} animeID.id The id of anime searched for
 * @param {Object} options
 * @param {number} options.page The search results are paginated, with this you can select which page you need, starts at 0
 * @param {boolean} options.combinePages When true it will download and combine the pages starting from 0 to the page value
 * @param {number} options.interval The time between each request to horrible subs
 * @return {Promise<Episode[]>}
 *
 */
export const getEpisodes = async (
  { slug, id }: { slug?: string; id?: string | number },
  { page = 0, combinePages = false, interval = defaultInterval } = {}
) => {
  try {
    if (slug || id) {
      const animeID =
        parseInt(String(id), 10) || (slug ? await getAnimeID(slug) : 0);
      const pagesKeys = combinePages ? [...Array(page + 1).keys()] : [page];

      if (!animeID) {
        const message = 'An animeID cannot be found';

        console.log(red(message));
        throw Error(message);
      }

      return downloadEpisodesPages(animeID, pagesKeys, interval);
    } else {
      const message =
        'You should send an anime slug or an anime id to retrieve the episodes';

      console.log(red(message));
      throw Error(message);
    }
  } catch (e) {
    const message = `Failed to retrieved the episodes of ${slug ||
      'no slug'} or ${id || 'no id'}`;

    console.log(red(message));

    if (process.env.HBS_DEBUG) {
      console.log(e);
    }

    throw Error(message);
  }
};

/*
 * @async
 * @function
 * @param {Object} options
 * @param {boolean} options.currentSeason If true then it will bring only the shows of the current season
 * @return {Promise<Show[]>}
 *
 * */
export const getShows = async ({
  currentSeason = false
}: { currentSeason?: boolean } = {}): Promise<Show[]> => {
  try {
    const rawHtml = await get(
      `https://horriblesubs.info/${currentSeason ? 'current-season' : 'shows'}/`
    );
    const document = parse(rawHtml) as HTMLElement;
    const rawShows = document.querySelectorAll('.ind-show a');
    const shows = Array.from(rawShows).map(
      ({ attributes: { href, title } }) => ({
        title,
        url: `${BASE_URL}${href}`
      })
    );

    return shows;
  } catch (e) {
    console.log(
      red(`Failed to get ${currentSeason ? 'current season' : 'all the'} shows`)
    );
    if (process.env.HBS_DEBUG) {
      console.log(e);
    }

    return [];
  }
};
