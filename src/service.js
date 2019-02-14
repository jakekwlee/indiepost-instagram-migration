const keyBy = require('lodash.keyby');
const flatten = require('lodash.flatten');
const repository = require('./repository');
const utils = require('./utils');
const config = require('./config');

const migrate = async () => {
  repository.connect();
  let posts = await repository.getPostList();
  console.log(`Migrating ${posts.length} posts...`);

  posts = posts.map(post => {
    const urls = utils.getInstagramUrlsFromContent(post.content);
    return {
      ...post,
      urls,
    };
  });

  const instagramUrls = flatten(posts.map(post => post.urls));
  const instagramMetadataList = await Promise.all(
    instagramUrls.map(url => utils.fetchOpenGraphMetadata(url))
  );
  const instagramMetadata = keyBy(instagramMetadataList, 'originalUrl');

  posts = posts.map(post => {
    const metadataList = post.urls.map(url => instagramMetadata[url]);
    return {
      ...post,
      metadataList,
    };
  });

  const postIdsIncludingBrokenLinks = posts
    .filter(post => {
      const { metadataList } = post;
      const brokenLinks = metadataList.filter(metadata => metadata.isBroken);
      return brokenLinks.length > 0;
    })
    .map(post => post.id);

  const instagramCount = instagramMetadataList.filter(metadata => !metadata.isBroken).length;
  const brokenInstagramCount = instagramMetadataList.length - instagramCount;

  posts = await Promise.all(posts.map(post => utils.replaceInstagramEmbeddedWithLinkBox(post)));

  await repository.startTransaction();

  const results = await Promise.all(
    posts.map(post => {
      const { id, content } = post;
      return repository.updatePost(id, content);
    })
  );
  const fixedPostIds = results.map(result => result.id);

  const fixedPostURLs = fixedPostIds
    .map(id => config.baseURL + id)
    .reduce((prev, url) => `${prev}\n${url}`);
  const brokenPostURLs = postIdsIncludingBrokenLinks
    .map(id => config.baseURL + id)
    .reduce((prev, url) => `${prev}\n${url}`);

  console.log(`${fixedPostIds.length} posts are fixed`);
  console.log(`${instagramCount} instagram link boxes are attached`);
  console.log(fixedPostURLs);
  console.log('------------------------------------------');
  console.log(`${postIdsIncludingBrokenLinks.length} posts include broken links`);
  console.log(`${brokenInstagramCount} instagram links are broken (404 not found)`);
  console.log(brokenPostURLs);

  if (process.env.NODE_ENV === 'production') {
    await repository.commit();
  } else {
    await repository.rollback();
    // await repository.commit();
  }
  repository.destroy();
};

module.exports = {
  migrate,
};
