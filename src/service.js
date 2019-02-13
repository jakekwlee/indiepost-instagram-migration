const keyBy = require('lodash.keyby');
const repository = require('./repository');
const utils = require('./utils');

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

  const instagramUrls = posts.flatMap(post => post.urls);
  const instagramMetadataList = await Promise.all(
    instagramUrls.map(url => utils.fetchOpenGraphMetadata(url))
  );
  const instagramMetadata = keyBy(instagramMetadataList, 'originalUrl');
  const brokenPosts = [];

  posts = posts.map(post => {
    const metadataList = post.urls.map(url => instagramMetadata[url]);
    const brokenLink = metadataList.filter(metadata => metadata.isBroken);
    if (brokenLink.length > 0) brokenPosts.push(post.id);
    return {
      ...post,
      metadataList,
    };
  });

  let instagramCount = 0;

  posts = await Promise.all(
    posts.map(post => {
      instagramCount += post.metadataList.length;
      return utils.replaceInstagramEmbeddedWithLinkBox(post);
    })
  );

  await repository.startTransaction();

  const results = await Promise.all(
    posts.map(post => {
      const { id, content } = post;
      return repository.updatePost(id, content);
    })
  );
  const fixedPostIds = results.map(result => result.id);

  console.log(fixedPostIds);
  console.log(`${fixedPostIds.length} posts are fixed`);
  console.log(`${instagramCount} instagram link boxes are inserted`);
  console.log(`${brokenPosts.length} posts include broken links`);
  console.log(brokenPosts);

  if (process.env.NODE_ENV === 'test') {
    await repository.rollback();
  } else {
    await repository.commit();
  }
  repository.destroy();
};

module.exports = {
  migrate,
};
