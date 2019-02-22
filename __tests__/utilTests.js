const { readFile, writeFile } = require('fs').promises;
const utils = require('../src/utils');

jest.setTimeout(100000);

describe('Test Utils', () => {
  describe('getOpenGraphMetadata(url: String): LinkBoxMetadata', () => {
    it('should return LinkBox Metadata properly', async () => {
      const siteUrl =
        'https://www.theguardian.com/artanddesign/2019/feb/12/diane-arbus-in-the-beginning-review-a-genius-who-made-every-picture-a-story';
      const metadata = await utils.fetchOpenGraphMetadata(siteUrl);
      const { url, title, description, imageUrl } = metadata;
      expect(url).toEqual(siteUrl);
      expect(title).toEqual(
        'Diane Arbus: In the Beginning review – a genius who made every picture a story'
      );
      expect(description).toEqual(
        'Arbus’s early works show a fully-formed photographer – from squalor to showbiz, she makes everyone exceptional'
      );
      expect(imageUrl).toEqual(
        'https://i.guim.co.uk/img/media/a23cd8a02d3451cce81d457f31f9904a8c87bf7f/26_31_843_506/master/843.jpg?width=1200&height=630&quality=85&auto=format&fit=crop&overlay-align=bottom%2Cleft&overlay-width=100p&overlay-base64=L2ltZy9zdGF0aWMvb3ZlcmxheXMvdGctcmV2aWV3LTUucG5n&s=25c1b4ef333b65dac34f8a53bbefc114'
      );
    });

    it('should return LinkBox Metadata properly when link is broken', async () => {
      const siteUrl = 'https://www.instagram.com/p/BbRMximAEY0/';
      const metadata = await utils.fetchOpenGraphMetadata(siteUrl);
      expect(metadata).toHaveProperty('isBroken', true);
      expect(metadata).toHaveProperty('originalUrl', siteUrl);
    });
  });

  describe('getInstagramUrlsFromContent(content: String): Array', () => {
    it('should return Instagram URLs properly', async () => {
      const buffer1 = await readFile('./__tests__/assets/test_content_1.html');
      const buffer2 = await readFile('./__tests__/assets/test_content_2.html');
      const content1 = buffer1.toString();
      const content2 = buffer2.toString();
      const urls1 = utils.getInstagramUrlsFromContent(content1);
      const urls2 = utils.getInstagramUrlsFromContent(content2);

      expect(urls1).toHaveLength(4);
      expect(urls2).toHaveLength(2);

      expect(urls1).toEqual([
        'https://www.instagram.com/p/7KpNJluH7X/',
        'https://www.instagram.com/p/-QrZ66uH8Q/',
        'https://www.instagram.com/p/BEngMlouHwM/',
        'https://www.instagram.com/p/6pEhXUOH1u/',
      ]);
      expect(urls2).toEqual([
        'https://www.instagram.com/p/BTvw3KVgpA3/',
        'https://www.instagram.com/p/BVcAEMsg5fm/',
      ]);
    });
  });

  describe('replaceInstagramEmbeddedWithLinkBox(post: Post): Post', () => {
    it('should return updated content properly', async () => {
      const content = await readFile('./__tests__/assets/test_content.html');
      const urls = utils.getInstagramUrlsFromContent(content);
      const metadataList1 = await Promise.all(urls.map(url => utils.fetchOpenGraphMetadata(url)));
      const result1 = await utils.replaceInstagramEmbeddedWithLinkBox({
        id: 0,
        content,
        metadataList: metadataList1,
      });
      await writeFile('./__tests__/results/result.html', result1.content);
    });
  });
});
