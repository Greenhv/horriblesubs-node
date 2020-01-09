const request = require('request-promise-native');
const parse = require('node-html-parser').parse;

const BASE_URI = 'https://horriblesubs.info';
const emptyResponseMsg = 'Nothing was found';

const parseURI = attributes => attributes.match(/\"([^"]+)\"/)[1];

const parseChapters = childList => {
  const releaseDate = childList[0].text;
  const anime = childList[1].text + childList[2].text;
  const resolutions = childList[3].childNodes
    .map(node => node.text)
    .join(' - ');

  return {
    anime,
    releaseDate,
    resolutions
  };
};

const downloadPages = async (searchedAnime, pagesKeys) => {
  const searchURIs = pagesKeys.map(
    page =>
      `${BASE_URI}/api.php?method=search&value=${searchedAnime}${
        page >= 1 ? `&nextid=${page}` : ''
      }&_=1578432089933`
  );
  const responses = await Promise.all(searchURIs.map(uri => request.get(uri)));
  const allChapters = responses
    .map(response => {
      const html = parse(response);
      const rawChapters = html.querySelectorAll('a');

      if (rawChapters) {
        const pageChapters = Array.from(rawChapters).map(elem => ({
          ...parseChapters(elem.childNodes),
          url: parseURI(elem.rawAttrs)
        }));

        return pageChapters;
      }

      return [];
    })
    .reduce((acc, chapters) => [...acc, ...chapters], []);

  console.log(allChapters);

  return allChapters;
};

const searchAnime = (
  searchedAnime,
  { page = 0, combinePages = false } = {}
) => {
  const pagesKeys = combinePages ? [...Array.keys(page + 1)] : [page];

  return downloadPages(searchedAnime, pagesKeys);
};

module.exports = {
  searchAnime
};
