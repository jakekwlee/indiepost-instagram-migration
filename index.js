const service = require('./src/service');

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await service.migrate();
  callback();
};
