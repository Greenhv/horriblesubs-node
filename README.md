# HorribleSubs Node
Non official Horriblesubs Node package

# Why ?

I want to build an app that could download automatically the current shows of the season when they're updated. Sadly the main site where the links of HBS are hosted doesn't have a good searcher and it has a lot of entries of the same anime which makes things harder to find. For that reason, I decided to scrap the HBS page because most of their responses are structured in some way, it has a lot less entries and they're my main source of anime for the season lol.

# Consideration

Some strings needs an specific format to make work correctly some functions, those will be pointing out bellow with the `**` tag, I think it should be easy for you to format them before using the functions :).

# Usage

### searchAnime(searchedAnime: string**, { page, combinePages, interval }) => Anime[]
* The `searchedAnime` string should be formatted with `+` between each words, like `Sword+art+online`.
* Example. The order of the items are in descending order from most recenlty to oldest.
```javascript
  searchedAnime('Sword+art+online', { pages: 2, combinePages: true })
  
  Result:
  [
    {
      title: 'Sword Art Online - Alicization - War of Underworld - 12',
      releaseDate: '12/28/19',
      resolutions: 'SD - 720p - 1080p',
      url:
       'https://horriblesubs.info/shows/sword-art-online-alicization-war-of-underworld#12',
      slug: 'sword-art-online-alicization-war-of-underworld'
    },
    ...
  ]
```

### getAnimeID(animeSlug: string**) => string
* The animeSlug, as the name suggest, accepts an string formatted with `-` between each words, like `ero-manga-sensei`.
* Example
```javascript
  getAnimeID('boku-no-hero-academia')
  
  Result:
  659
```
### getEpisodes(animeSlug: string **, animeID: string | number, { page, combinePages, interval }) => Episode[]
* You can send an animeSlug or an animeID, and, if you send an ID then the request to HBS to get it will be skipped, keep that in mind.
* The animeSlug, as the name suggest, accepts an string formatted with `-` between each words, like `black-clover`.
* Example
```javascript
  getEpisode({ slug: 'black-clover' }, { page: 1 })
  
  Result:
  [
    {
      chapter: { title: ' Black Clover 104', releaseDate: '10/08/19' },
      resolutions: [
        { 
          resolution: '480p',
          sources: {
            Magnet: 'magnet?',
            Torrent: '',
            XDCC: '',
            'Uploaded.net': '',
            DropAPK: '',
            Rockfile: ''
          }
        },
        { 
          resolution: '720p',
          sources: {
            Magnet: 'magnet?',
            Torrent: '',
            XDCC: '',
            'Uploaded.net': '',
            DropAPK: '',
            Rockfile: ''
          }
        },
        { 
          resolution: '1080p',
          sources: {
            Magnet: 'magnet?',
            Torrent: '',
            XDCC: '',
            'Uploaded.net': '',
            DropAPK: '',
            Rockfile: ''
          }
        }
      ]
    },
    ...
  ]
```

### getShows({ currentSeason: boolean = false }) => Show[]
* If currentSeason is false, then the list of all available shows in HBS will be retrieved.
* If currentSeason is true, then only the show curretly airing will be retrieved.
* Example
```javascript
  getShows({ currentSeason: true });

  Result:
  [ 
    {
      title: 'Ace of Diamond Act II',
      url: 'https://horriblesubs.info/shows/ace-of-diamond-act-ii' },
    },
    ...
  ]
```

# Options

This only applys to the `searchAnime` and `getEpisodes` functions. That is because those functions need a way to give control to the user over the pagination implemented in the HBS request.

### { page: number, combinePages: boolean, interval: number }

* `page` If declared alone, this option lets you request any page from the given show. The default value is 0.
* `combinePages` When it's declared as `true`, it will let you request the pages from `[0 to page]` and it will return all of them combined into a single array. By default is false.
* `interval` It let you modified the interval between each request made to HBS, this options takes precenden over the environment variable.

# Environment Variables

You can modify some of the values declared in the package by declaring the following environment variables

### HBS_INTERVAL
Interval between each request to HBS, this will override the default value of 500ms

### HBS_BASE_URL
The base url of HBS, this will override the default value of `https://horriblesubs.info`

### HBS_DEBUG
This will activate the debug mode and it will print the whole error message the could happen in any of the function of the package.

