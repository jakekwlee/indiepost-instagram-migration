const cheerio = require('cheerio');
const fetch = require('node-fetch');

const fetchOpenGraphMetadata = async siteUrl => {
  const response = await fetch(siteUrl);
  if (response.status === 404) {
    return {
      originalUrl: siteUrl,
      isBroken: true,
    };
  }
  const html = await response.text();
  const $ = cheerio.load(html);
  const metaOgTitle = $("meta[property='og:title']").first();
  const canonicalUrl = $("link[rel='canonical']");
  const metaOgImage = $("meta[property='og:image']");
  const metaOgDescription = $("meta[property='og:description']");
  const title = metaOgTitle ? metaOgTitle.attr('content') : $('title').text();
  const url = canonicalUrl ? canonicalUrl.attr('href') : siteUrl;
  const imageUrl = metaOgImage ? metaOgImage.attr('content') : null;
  const description = metaOgDescription ? metaOgDescription.attr('content') : null;
  return {
    title,
    description,
    imageUrl,
    url,
    originalUrl: siteUrl,
    isBroken: false,
    source: 'www.instagram.com',
  };
};

const makeLinkBox = (linkMetadata, withWrapper = false) => {
  const { title, url, imageUrl, source, isBroken, originalUrl } = linkMetadata;
  const thumbnail = isBroken
    ? ''
    : `<div class="thumbnail">
            <img src="${imageUrl}"/>
        </div>`;
  const box = `
    <a class="link-box" href="${url || originalUrl}"
       target="_blank" rel="noopener">
        ${thumbnail}
        <div class="description">
            <div class="link-title">${title || originalUrl}</div>
            <div class="link-source">${source || '404 Not Found'}</div>
        </div>
    </a>`;
  return withWrapper
    ? `<figure class="link-box-wrapper image link-box-url type-fullwidth">${box}\n</figure>`
    : box;
};

const getInstagramUrlsFromContent = content => {
  const $ = cheerio.load(content);
  const result = [];
  $("blockquote[class^='instagram-media']  a").each((index, elm) => {
    const $elm = $(elm);
    const url = $elm.attr('href');
    if (!url) return;
    result.push(url);
  });
  return result;
};

const replaceInstagramEmbeddedWithLinkBox = async post => {
  const { id, content, metadataList } = post;
  const $ = cheerio.load(content, {
    normalizeWhitespace: true,
  });
  $("blockquote[class^='instagram-media']  a").each((i, elm) => {
    const $anchor = $(elm);
    const url = $anchor.attr('href');
    if (!url) return;

    const metadata = metadataList[i];
    if (!metadata) {
      console.log(`Error: No metadata: post [${id}], index: ${i}, url: [${url}] `);
      return;
    }
    const $figure = $anchor.parents('figure.image');
    let withWrapper = false;
    let $blockquote = null;
    if ($figure.length === 1) {
      $figure.addClass('link-box-wrapper link-box-url type-fullwidth');
      $blockquote = $figure.find('blockquote');
    } else {
      withWrapper = true;
      $blockquote = $anchor.parents('blockquote');
    }
    if (!$blockquote) {
      console.log('Error: No blockquote element');
      return;
    }
    const linkBoxHtml = makeLinkBox(metadata, withWrapper);
    $blockquote.replaceWith(linkBoxHtml);
    $figure.find('iframe').remove();
  });
  $('script').remove();
  return {
    id,
    content: $('body').html(),
  };
};

module.exports = {
  getInstagramUrlsFromContent,
  fetchOpenGraphMetadata,
  replaceInstagramEmbeddedWithLinkBox,
};
