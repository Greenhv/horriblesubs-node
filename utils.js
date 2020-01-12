const request = require('request-promise-native');
const parse = require('node-html-parser').parse;
const chalk = require('chalk');
const BASE_URL = process.env.HBS_BASE_URL || 'https://horriblesubs.info';
const emptyResponseMsg = 'Nothing was found';
const getSlug = url => url.match(/\/([^\/]+)\#/)[1];
const wait = interval =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, interval)
  );

/**
 * @typedef {Object} Show
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} Anime
 * @property {string} title
 * @property {string} releaseDate
 * @property {string} resolutions
 * @property {string} url
 * @property {string} slug
 */

/**
 * @typedef {Object} Resolution
 * @property {string} resolution
 * @property {Object} sources key: Name of the source, value: Link of the source
 */

/**
 * @typedef {Object} Episode
 * @property {Anime} chapter
 * @property {Resolution[]} resolutions
 */

/*
 * @function
 * @param {HTMLElement[]} rawResolution List of html objects that contains the resolution and the download links of an episode
 * @return {Resolution} The resolution and sources found
 *
 */
const parseResolution = rawResolution => {
  const resolution = rawResolution[0].text.trim().slice(0, -1);
  const sources = {};

  for (let i = 1; i < rawResolution.length; i++) {
    const rawLink = rawResolution[i];
    const rawNodes = rawLink.childNodes;
    const isHTMLNode = rawNodes.length > 0;

    if (isHTMLNode) {
      const rawTitle = rawNodes[0];
      const key = rawTitle.text;
      const link = rawTitle.attributes ? rawTitle.attributes.href : '';

      sources[key] = link;
    }
  }

  return {
    resolution,
    sources
  };
};

/*
 * @function
 * @param {HTMLElement[]} rawNodes List of html objects that contains the anime and resolutions information
 * @return {Episode}
 *
 */
const parseEpisode = rawNodes => {
  const rawInfo = rawNodes[0];
  const rawLinks = rawNodes[1];
  const { title, releaseDate } = parseAnimeInfo(rawInfo.childNodes);
  const episode = {
    chapter: { title, releaseDate },
    resolutions: Array.from(rawLinks.childNodes).map(rawResolution =>
      parseResolution(rawResolution.childNodes)
    )
  };

  return episode;
};

/*
 * @function
 * @param {HTMLElement[]} childList HTML elements with the anime information
 * @return {Anime} The animes parsed into an object
 *
 */
const parseAnimeInfo = childList => {
  const releaseDate = childList[0].text;
  const title = childList[1].text + childList[2].text;
  const resolutions = childList[3].childNodes
    .map(node => node.text)
    .join(' - ');

  return {
    title,
    releaseDate,
    resolutions
  };
};

/*
 * @async
 * @function
 * @param {string} searchedAnime The anime searched for
 * @param {number[]} pagesKeys The list of pages to be retrieved
 * @return {Promise<Anime[]>} A promise of all found entrys
 *
 */
const downloadSearchPages = async (searchedAnime, pagesKeys, interval) => {
  const searchURIs = pagesKeys.map(
    page =>
      `${BASE_URL}/api.php?method=search&value=${searchedAnime}${
        page >= 1 ? `&nextid=${page}` : ''
      }&_=1578432089933`
  );
  const foundEntries = await Promise.all(
    searchURIs.map(async (uri, index) => {
      try {
        await wait(index * interval);
        const resp = await request.get(uri);

        return resp;
      } catch (e) {
        console.log(chalk.red(`❌ Failed to request page ${index}`));
        console.log(e);

        return emptyResponseMsg;
      }
    })
  );
  const allEntries = foundEntries
    .map(entry => {
      const isResponseEmpty = emptyResponseMsg === entry;

      if (!isResponseEmpty) {
        const document = parse(entry);
        const rawChapters = document.querySelectorAll('a');
        const pageChapters = Array.from(rawChapters).map(elem => {
          const url = elem.attributes.href;
          const slug = getSlug(url);

          return {
            ...parseAnimeInfo(elem.childNodes),
            url: `${BASE_URL}${url}`,
            slug
          };
        });

        return pageChapters;
      }

      return [];
    })
    .reduce((acc, chapters) => [...acc, ...chapters], []);

  return allEntries;
};

/*
 * @async
 * @function
 * @param {string} animeID The anime searached for
 * @param {number[]} pagesKeys The list of pages to be retrieved
 * @return {Promise<Episode[]>} A promise of all found episodes
 *
 */
const downloadEpisodesPages = async (animeID, pagesKeys, interval) => {
  const episodesURIs = pagesKeys.map(
    page =>
      `https://horriblesubs.info/api.php?method=getshows&type=show&showid=${animeID}${
        page >= 1 ? `&nextid=${page}` : ''
      }&_=1578621190728`
  );
  const rawEpisodes = await Prommise.all(
    episodesURIs.map(async (uri, index) => {
      try {
        await wait(index * interval);
        const resp = await request.get(uri);

        return resp;
      } catch (e) {
        console.log(chalk.red(`Failed to request page ${index}`));
        console.log(e);

        return emptyResponseMsg;
      }
    })
  );
  const episodes = rawEpisodes
    .map(rawEpisode => {
      const isResponseEmpty = emptyResponseMsg === rawEpisode;

      if (!isResponseEmpty) {
        const document = parse(response);
        const episodes = Array.from(
          document.querySelectorAll('.rls-info-container')
        ).map(ep => parseEpisode(ep.childNodes));

        return episodes;
      }

      return [];
    })
    .reduce((acc, chapters) => [...acc, ...chapters], []);

  return episodes;
};

module.exports = {
  parseResolution,
  parseEpisode,
  downloadSearchPages,
  downloadEpisodesPages
};
