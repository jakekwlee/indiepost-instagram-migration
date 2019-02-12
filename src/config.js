const { DB_HOST, DB_USER, DB_PASSWORD, DB_SCHEMA } = process.env;

module.exports = {
  mysqlConfig: {
    host: DB_HOST || 'localhost',
    user: DB_USER || 'indiepost',
    password: DB_PASSWORD || 'indiepost',
    database: DB_SCHEMA || 'indiepost',
  },
};