const bcrypt = require("bcrypt");
const validator = require("validator");
const config = require("../knexfile");
const knex = require("knex")(config);
const { setting } = require("../views");

let error = undefined;

module.exports = {
  get: async function (req, res) {
    const html = setting({ error });
    error = undefined;
    return res.send(html);
  },
  logout: async function (req, res) {
    req.session.destroy(() => {
      return res.redirect("/login");
    });
  },
  updatePass: async function (req, res) {
    const { current, fresh } = req.body;
    const user = req.session.user;
    const isMatch = await bcrypt.compare(current, user.pass);
    if (!isMatch) {
      error = "現在のパスワードが一致しません";
      return res.redirect("/setting");
    }
    if (!validator.isLength(fresh, { min: 4, max: 32 })) {
      error = "パスワードは4字以上32字以内で登録可能です";
      return res.redirect("/setting");
    }
    const pass = await bcrypt.hash(fresh, 12);
    const num = await knex("users")
      .update({ pass })
      .where({ id: user.id })
      .then((result) => result[0]);
    res.redirect("/");
  },
}
