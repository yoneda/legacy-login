const request = require("superagent");
const config = require("../knexfile");
const knex = require("knex")(config);

module.exports = async function (req, res) {
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

  const githubUrl = "https://api.github.com/user";
  const { login } = await request
    .get(githubUrl)
    .set("User-Agent", "")
    .set("Authorization", `token ${access_token}`)
    .then((d) => d.body);

  const users = await knex("users").where({ github: login });
  if (users.length === 1) {
    // 過去に登録していた
    req.session.user = users[0];
    return res.redirect("/");
  }
  // 新規で登録
  await knex("users").insert({ mail: "", pass: "", github: login });
  req.session.user = users[0];
  return res.redirect("/");
};
