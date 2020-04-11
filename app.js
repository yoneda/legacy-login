const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");
const session = require("express-session");
const request = require("superagent");
const app = express();
const router = require("./router");
const asyncHandler = require("express-async-handler");

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

app.use(router);

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
