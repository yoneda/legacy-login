const { new: newPage, home, signup, login, setting } = require("./views");
const validator = require("validator");
const bcrypt = require("bcrypt");

// initilize knex
const config = require("./knexfile");
const knex = require("knex")(config);

exports.auth = async function (req, res, next) {
  const user = req.session.user;
  if (user === undefined) {
    return res.redirect("/login");
  }
  next();
};

exports.newHandler = {
  get: async function (req, res) {
    const html = newPage();
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

exports.homeHandler = {
  get: async function (req, res) {
    const user = req.session.user;
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    const html = home({ user, bookmarks });
    res.send(html);
  },
};

let error = undefined;

exports.signupHandler = {
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
    knex("users")
      .insert({ mail, pass })
      .catch((err) => {
        error = "エラーが発生しました。";
        res.redirect("/signup");
      });
    return res.redirect("/login");
  },
};

exports.loginHandler = {
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
};

exports.settingHandler = {
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
};