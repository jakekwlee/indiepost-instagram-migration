const mysql = require('mysql2/promise');
const config = require('./config');
const { SELECT_INSTAGRAM_INSERTED, UPDATE_POST } = require('./namedQueries');

module.exports = {
  connect: () => null,
  destroy: () => null,
};

module.exports = (() => {
  let connection = null;

  const connect = () => {
    if (!connection) {
      connection = mysql.createPool(config.mysqlConfig);
    }
  };

  const destroy = () => {
    if (connection && connection.destroy) {
      connection.destroy();
    }
  };

  const executeQuery = (sqlQuery, args = null) => {
    return new Promise((resolve, reject) => {
      connection.query(sqlQuery, args, (error, results) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      });
    });
  };

  const getPostList = async () => executeQuery(SELECT_INSTAGRAM_INSERTED);

  const updatePost = async (id, content) => executeQuery(UPDATE_POST, { id, content });

  return {
    connect,
    destroy,
    getPostList,
    updatePost,
  };
})();
