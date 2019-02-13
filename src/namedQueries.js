module.exports = {
  SELECT_INSTAGRAM_INSERTED:
    "select id, title, content from indiepost.Posts where content like '%blockquote%' and content like '%instagram-media%' and status = 'publish' order by id",
  UPDATE_POST: 'update Posts set content = ? where id = ?',
};
