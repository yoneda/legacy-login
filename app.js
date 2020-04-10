const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const redis = require("redis");
const session = require("express-session");
const request = require("superagent");
const app = express();
const {
  auth,
  newHandler,
  homeHandler,
  signupHandler,
  loginHandler,
  settingHandler,
} = require("./handlers");

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

// Pages
app.get("/new", asyncHandler(auth), asyncHandler(newHandler.get));
app.post("/new", asyncHandler(newHandler.post));
app.get("/", asyncHandler(auth), asyncHandler(homeHandler.get));
app.get("/signup", asyncHandler(signupHandler.get));
app.post("/signup", asyncHandler(signupHandler.post));
app.get("/login", asyncHandler(loginHandler.get));
app.post("/login", asyncHandler(loginHandler.post));
app.post("/logout", asyncHandler(settingHandler.logout));
app.get("/setting", asyncHandler(settingHandler.get));
app.post("/update", asyncHandler(settingHandler.updatePass));

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
