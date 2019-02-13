const repository = require('../src/repository');

jest.setTimeout(100000);

describe('Repository Tests', () => {
  beforeAll(repository.connect);
  afterAll(repository.destroy);

  describe('connect()', () => {
    it('should establish DB connection properly', () => {
      expect(repository.isConnected()).toBeTruthy();
    });
  });

  describe('getPostList(): Array', () => {
    it('should return post list properly', async () => {
      const posts = await repository.getPostList();
      expect(posts.length).toBeGreaterThanOrEqual(1);
      const post = posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('content');
    });
  });

  describe('updatePost(id: Number, content: String)', () => {
    it('should execute with no errors', async () => {
      await repository.startTransaction();
      await repository.updatePost(500, 'TEST');
      await repository.rollback();
    });
  });
});
