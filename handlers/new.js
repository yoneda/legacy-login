const config = require("../knexfile");
const knex = require("knex")(config);
const { new: renderNew } = require("../views");

module.exports = {
  get: async function (req, res) {
    const html = renderNew();
    res.send(html);
  },
  post: async function (req, res) {
    const user = req.session.user;
    const { title, url } = req.body;
    await knex("bookmarks")
      .insert({ title, url, user: user.id })
      .catch((err) => {
        return res.send("エラーが発生しました。");
      });
    return res.redirect("/");
  },
};
