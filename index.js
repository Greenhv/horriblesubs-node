const request = require('request-promise-native');
const parse = require('node-html-parser').parse;
const chalk = require('chalk');
const { downloadSearchPages, downloadEpisodesPages } = require('./utils');

const defaultInterval = parseInt(process.env.HBS_INTERVAL || 500, 10);
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
const searchAnime = (
  searchedAnime,
  { page = 0, combinePages = false, interval = defaultInterval } = {}
) => {
  const pagesKeys = combinePages ? [...Array(page + 1).keys()] : [page];

  return downloadSearchPages(searchedAnime, pagesKeys, interval);
};

/*
 * @async
 * @function
 * @param {string} animeSlug The anime searched for, the string should have the format 'The-Anime-With-Swrods'
 * @return {Promise<string>} A promise of the anime id
 *
 */
const getAnimeID = async animeSlug => {
  try {
    const htmlPage = await request.get(`${BASE_URL}/${animeSlug}`);
    const document = parse(htmlPage, { script: true });
    const animeID = document
      .querySelector('.entry-content')
      .querySelector('script')
      .text.match(/[\d]{1,}/g)[0];

    return animeID;
  } catch (e) {
    console.log(chalk.red('Failed to retrieved the anime id'));
    console.log(e);
  }
};

/*
 * @async
 * @function
 * @param {string} animeSlug The anime searched for, the string should have the format 'The-Anime-With-Swrods'
 * @param {Object} options
 * @param {number} options.page The search results are paginated, with this you can select which page you need, starts at 0
 * @param {boolean} options.combinePages When true it will download and combine the pages starting from 0 to the page value
 * @param {number} options.interval The time between each request to horrible subs
 * @return {Promise<Episode[]>}
 *
 */
const getEpisodes = async (
  animeSlug,
  { page = 0, combinePages = false, interval = defaultInterval } = {}
) => {
  const animeID = await getAnimeID(animeSlug);
  const pagesKeys = combinePages ? [...Array(page + 1).keys()] : [page];

  return downloadEpisodesPages(animeID, pagesKeys, interval);
};

/*
 * @async
 * @function
 * @param {Object} options
 * @param {boolean} options.currentSeason If true then it will bring only the shows of the current season
 * @return {Promise<Show[]>}
 *
 * */
const getShows = async ({ currentSeason = false } = {}) => {
  try {
    const rawHtml = await request.get(
      `https://horriblesubs.info/${currentSeason ? 'current-season' : 'shows'}/`
    );
    const document = parse(rawHtml);
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
      chalk.red(
        `Failed to get ${currentSeason ? 'current season' : 'all the'} shows`
      )
    );
    console.log(e);
  }
};

module.exports = {
  searchAnime,
  getAnimeID,
  getEpisodes,
  getShows
};
