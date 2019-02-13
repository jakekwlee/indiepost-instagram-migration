const mysql = require('mysql');
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
      connection = mysql.createConnection(config.mysqlConfig);
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

  const startTransaction = async () => {
    await executeQuery('SET AUTOCOMMIT = TRUE');
    await executeQuery('START TRANSACTION');
  };

  const commit = async () => {
    await executeQuery('COMMIT');
    await executeQuery('SET AUTOCOMMIT = FALSE');
  };

  const rollback = async () => {
    await executeQuery('ROLLBACK');
    await executeQuery('SET AUTOCOMMIT = FALSE');
  };

  const isConnected = () => !!connection;

  const destroy = () => {
    if (connection && connection.destroy) {
      connection.destroy();
    }
  };

  const getPostList = () => {
    return executeQuery(SELECT_INSTAGRAM_INSERTED);
  };

  const updatePost = (id, content) => {
    return executeQuery(UPDATE_POST, [content, id]).then(res => {
      return { ...res, id };
    });
  };

  return {
    connect,
    startTransaction,
    commit,
    rollback,
    isConnected,
    destroy,
    getPostList,
    updatePost,
  };
})();
