const config = require("../knexfile");
const knex = require("knex")(config);

const { home } = require("../views");

module.exports = {
  get: async function (req, res) {
    const user = req.session.user;
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    const html = home({ user, bookmarks });
    res.send(html);
  },
};
