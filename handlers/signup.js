const validator = require("validator");
const bcrypt = require("bcrypt");
const config = require("../knexfile");
const knex = require("knex")(config);
const { signup } = require("../views");

let error = undefined;

module.exports = {
  get: async function (req, res) {
    const html = signup({ error });
    error = undefined;
    return res.send(html);
  },
  post: async function (req, res) {
    const { mail, password } = req.body;
    if (!validator.isEmail(mail)) {
      error = "メールアドレスの形式で入力ください";
      return res.redirect("/signup");
    }
    if (!validator.isLength(password, { min: 4, max: 32 })) {
      error = "パスワードは4字以上32字以内で登録可能です";
      return res.redirect("/signup");
    }
    // パスワードハッシュ化
    const pass = await bcrypt.hash(password, 12);
    await knex("users")
      .insert({ mail, pass, github: "" })
      .catch((err) => {
        error = "エラーが発生しました。";
        res.redirect("/signup");
      });
    return res.redirect("/login");
  },
};
