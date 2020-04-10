const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const validator = require("validator");
const redis = require("redis");
const session = require("express-session");
const request = require("superagent");
const app = express();

const { new: newPage, home, signup, login, setting } = require("./views");
const {
  auth,
  newHandler,
  homeHandler,
  signupHandler,
  loginHandler,
} = require("./handlers");

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

app.get("/new", asyncHandler(auth), asyncHandler(newHandler.get));
app.post("/new", asyncHandler(newHandler.post));
app.get("/", asyncHandler(auth), asyncHandler(homeHandler.get));
app.get("/signup", asyncHandler(signupHandler.get));
app.post("/signup", asyncHandler(signupHandler.post));
app.get("/login", asyncHandler(loginHandler.get));

app.post("/login", asyncHandler(loginHandler.post));

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
    const html = setting({ error });
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
