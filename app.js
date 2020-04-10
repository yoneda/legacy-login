const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const validator = require("validator");
const ejs = require("ejs");
const redis = require("redis");
const session = require("express-session");
const bcrypt = require("bcrypt");
const request = require("superagent");
const app = express();

const { new: newPage, home, signup, login, setting } = require("./view");

// initilize knex
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3",
  },
  migrations: {
    directory: "migrations",
  },
  seeds: {
    directory: "seeds",
  },
  useNullAsDefault: true,
});

// セッション管理にはredisを使う
const RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient();

// initialize session
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "legacy",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1時間で消える
  })
);

// 静的ファイル(image,css,javascript) をpublic フォルダに格納。
// test.pngにアクセスしたいときは、
// http://localhost:3000/test.png
app.use(express.static(__dirname + "/public"));

// bodyParser の初期化
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ejs の初期化
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

let error = undefined;

// Pages

app.get(
  "/new",
  asyncHandler(async (req, res, next) => {
    const user = req.session.user;
    if (user === undefined) {
      return res.redirect("/login");
    }
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    res.send(newPage());
  })
);

app.post(
  "/new/done",
  asyncHandler(async (req, res, next) => {
    const { title, url } = req.body;
    const user = req.session.user;
    await knex("bookmarks")
      .insert({ title, url, user: user.id })
      .catch((err) => {
        return res.send("エラーが発生しました。");
      });
    return res.redirect("/");
  })
);

app.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const user = req.session.user;
    if (user === undefined) {
      return res.redirect("/login");
    }
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    const html = home({ user, bookmarks });
    res.send(html);
  })
);

app.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const { title, url } = req.body;
    const user = req.session.user;
    await knex("bookmarks")
      .insert({ title, url, user: user.id })
      .catch((err) => {
        return res.send("エラーが発生しました。");
      });
    return res.redirect("/");
  })
);

app.get(
  "/signup",
  asyncHandler(async (req, res) => {
    const html = signup({ error });
    error = undefined;
    return res.send(html);
  })
);

app.post(
  "/signup/callback",
  asyncHandler(async (req, res, next) => {
    const { mail } = req.body;
    if (validator.isEmail(mail)) {
      next();
    } else {
      error = "メールアドレスの形式で入力ください";
      res.redirect("/signup");
    }
  }),
  asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    if (validator.isLength(password, { min: 4, max: 32 })) {
      next();
    } else {
      error = "パスワードは4字以上32字以内で登録可能です";
      res.redirect("/signup");
    }
  }),
  asyncHandler(async (req, res) => {
    const { mail, password } = req.body;

    // パスワードハッシュ化
    const salt = await bcrypt.genSalt(12);
    const pass = await bcrypt.hash(password, salt);

    knex("users")
      .insert({ mail, pass })
      .catch((err) => {
        error = "エラーが発生しました。";
        res.redirect("/signup");
      });
    return res.redirect("/login");
  })
);

app.get(
  "/login",
  asyncHandler(async (req, res) => {
    const html = login({ error });
    error = undefined;
    res.send(html);
  })
);

app.post(
  "/login/callback",
  asyncHandler(async (req, res, next) => {
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
  })
);

app.post(
  "/logout",
  asyncHandler(async (req, res) => {
    req.session.destroy(() => {
      return res.redirect("/login");
    });
  })
);

app.get(
  "/setting",
  asyncHandler(async (req, res) => {
    const html = setting({error});
    error = undefined;
    return res.send(html);
  })
);

app.post(
  "/setting/changePassword",
  asyncHandler(async (req, res, next) => {
    const { current } = req.body;
    const user = req.session.user;
    console.log(current);
    console.log(user);
    if (current === user.pass) {
      next();
    } else {
      error = "現在のパスワードが一致しません";
      res.redirect("/setting");
    }
  }),
  asyncHandler(async (req, res, next) => {
    const { fresh } = req.body;
    if (validator.isLength(fresh, { min: 4, max: 32 })) {
      next();
    } else {
      error = "パスワードは4字以上32字以内で登録可能です";
      res.redirect("/setting");
    }
  }),
  asyncHandler(async (req, res, next) => {
    const { fresh } = req.body;
    const user = req.session.user;
    const num = await knex("users")
      .update({ pass: fresh })
      .where({ id: user.id })
      .then((result) => result[0]);
    console.log(num);
    res.redirect("/");
  })
);

app.get(
  "/github/callback",
  asyncHandler(async (req, res) => {
    const code = req.query.code;
    const options = {
      client_id: "c0a3887ca38ee7f8a7fc",
      client_secret: "fd9fabc31de160db383f26c0ea30d56ff148252a",
      code,
    };
    const url = "https://github.com/login/oauth/access_token";
    const { access_token } = await request
      .post(url)
      .send(options)
      .then((d) => d.body);
    const user = await request
      .get("https://api.github.com/user")
      .set({
        "Content-Type": "application/json",
        "User-Agent": "test2",
        Authorization: "Bearer " + access_token,
      })
      .then((d) => d.body);
    console.log(user);
    res.send(user);
  })
);

app.listen(3000);
