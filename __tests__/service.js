const service = require('../src/service');

jest.setTimeout(100000);

describe('Service Tests', () => {
  describe('migrate()', () => {
    it('should work properly', async () => {
      await service.migrate();
    });
  });
});
