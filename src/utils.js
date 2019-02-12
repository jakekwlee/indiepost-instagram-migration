const cheerio = require('cheerio');
const fetch = require('node-fetch');

const getOpenGraphMetadata = async siteUrl => {
  const response = await fetch(siteUrl);
  const $ = cheerio.load(response.text());
  const metaOgTitle = $("meta[property='og:title']");
  const metaOgUrl = $("meta[property='og:url']");
  const metaOgImage = $("meta[property='og:image']");
  const metaOgDescription = $("meta[property='og:description']");
  const title = metaOgTitle ? metaOgTitle.attr('content') : $('title').text();
  const url = metaOgUrl ? metaOgUrl.attr('content') : siteUrl;
  const imageUrl = metaOgImage ? metaOgImage.attr('content') : null;
  const description = metaOgDescription ? metaOgDescription.attr('content') : null;
  return {
    title,
    description,
    imageUrl,
    url,
    source: 'www.instagram.com',
  };
};

const makeLinkBox = (linkMetadata, withWrapper = false) => {
  const { title, url, imageUrl, source } = linkMetadata;
  const box = `<a class="link-box" href="${url}"
       target="_blank" rel="noopener">
        <div class="thumbnail">
            <img src="${imageUrl}"/>
        </div>
        <div class="description">
            <div class="link-title">${title}</div>
            <div class="link-source">${source}</div>
        </div>
    </a>`;
  return withWrapper
    ? `<figure class="link-box-wrapper image link-box-url type-fullwidth">${box}</figure>`
    : box;
};

const getinstagramUrlsFromContent = content => {
  const $ = cheerio.load(content);
  const result = [];
  $('blockquote.instagram-media  a').forEach(elm => {
    const $elm = $(elm);
    const url = $elm.attr('href');
    if (!url) return;
    result.push(url);
  });
  return result;
};

const replaceInstagramEmbededWithLinkBox = async (content, metadataList) => {
  const $ = cheerio.load(content);
  $('blockquote.instagram-media  a').each(elm => {
    const $anchor = $(elm);
    const url = $anchor.attr('href');
    if (!url) return;

    const filteredList = metadataList.filter(metadata => metadata.url === url);
    if (filteredList.length !== 1) {
      console.log(`Error: URL does not match: ${filteredList}`);
      return;
    }
    const metadata = filteredList[0];
    const $figure = $anchor.parent('figure.image');
    let withWrapper = false;
    let $blockquote = null;
    if ($figure.length === 1) {
      $figure.addClass('link-box-wrapper link-box-url type-fullwidth');
      $blockquote = $figure.find('blockquote.instagram-media').first();
    } else {
      withWrapper = true;
      $blockquote = $anchor.parent('blockquote.instagram-media').first();
    }
    if (!$blockquote) {
      console.log('Error: No blockquote element');
      return;
    }
    const linkBoxHtml = makeLinkBox(metadata, withWrapper);
    $blockquote.replaceWith(linkBoxHtml);
  });
  $('script').remove();
  return $.html();
};

module.exports = {
  insertUrlLinkBox: makeLinkBox,
};
