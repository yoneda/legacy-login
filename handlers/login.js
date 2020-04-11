const bcrypt = require("bcrypt");
const config = require("../knexfile");
const knex = require("knex")(config);
const { login } = require("../views");

let error = undefined;

module.exports = {
  get: async function (req, res) {
    const html = login({ error });
    error = undefined;
    return res.send(html);
  },
  post: async function (req, res) {
    const { mail, password } = req.body;
    const users = await knex("users").where({ mail });
    if (users.length === 0) {
      error = "メールアドレスが見つかりません。";
      return res.redirect("/login");
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.pass);
    if (isMatch) {
      // パスワード合致
      req.session.user = user;
      return res.redirect("/");
    }
    error = "パスワードが一致しません。";
    return res.redirect("/login");
  },
}