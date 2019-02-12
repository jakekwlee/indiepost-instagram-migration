module.exports = {
  SELECT_INSTAGRAM_INSERTED:
    "select id, title, content from indiepost.Posts where content like '%blockquote%' and content like '%instagram-media%' and status = 'publish'",
  UPDATE_POST: 'update Posts set content = :content where id = :id',
};
