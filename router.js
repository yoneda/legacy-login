const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const {
  auth,
  home,
  signup,
  login,
  setting,
  new: newHandler,
} = require("./handlers");

router.get("/", asyncHandler(auth), asyncHandler(home.get));
router.get("/setting", asyncHandler(auth), asyncHandler(setting.get));
router.get("/signup", asyncHandler(signup.get));
router.post("/signup", asyncHandler(signup.post));
router.get("/login", asyncHandler(login.get));
router.post("/login", asyncHandler(login.post));
router.post("/logout", asyncHandler(setting.logout));
router.post("/update", asyncHandler(setting.updatePass));
router.get("/new", asyncHandler(auth), asyncHandler(newHandler.get));
router.post("/new", asyncHandler(newHandler.post));

const config = require("./knexfile");
const knex = require("knex")(config);

const request = require("superagent");
router.get(
  "/github",
  asyncHandler(async function (req, res, next) {
    const { code } = req.query;
    const url = "https://github.com/login/oauth/access_token";
    const option = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    };
    const { access_token } = await request
      .post(url)
      .send(option)
      .then((d) => d.body);
    console.log(access_token);

    const githubUrl = "https://api.github.com/user";
    const { login } = await request
      .get(githubUrl)
      .set("User-Agent", "")
      .set("Authorization", `token ${access_token}`)
      .then((d) => d.body);

    // 既に登録済みのユーザであったか
    const users = await knex("users").where({ github: login });
    if (users.length === 1) {
      // githubでログイン成功
      req.session.user = users[0];
      return res.redirect("/");
    }
    // githubでのログイン失敗
    // ユーザを新規登録
    await knex("users").insert({ mail: "", pass: "", github: login });
    req.session.user = users[0];
    return res.redirect("/");
  })
);

module.exports = router;
