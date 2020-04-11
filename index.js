const express = require("express");
const redis = require("redis");
const session = require("express-session");
const request = require("superagent");
const app = express();
const router = require("./router");
const asyncHandler = require("express-async-handler");
const env = require("dotenv");

env.config();

const isDev = process.env.NODE_ENV;
if (isDev) {
  // インメモリでセッション管理
  app.use(
    session({
      secret: process.env.SECRET || "legacy",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1時間で消える
    })
  );
} else {
  // redis でセッション管理
  const RedisStore = require("connect-redis")(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET || "legacy",
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1時間で消える
    })
  );
}

// use body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// apply all router
app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`app started! listening on ${port}`);
});
