const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const session = require("express-session");
const lodash = require("lodash");
const ejs = require("ejs");
const app = express();

// initilize knex
const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./dev.sqlite3"
  },
  migrations: {
    directory: "migrations"
  },
  seeds: {
    directory: "seeds"
  },
  useNullAsDefault: true
});

// initialize session
app.use(
  session({
    secret: "legacy",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // 60秒で消える
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

// REST API
app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await knex("users").where({ id });
    return res.json(user);
  })
);

app.get(
  "/api/bookmarks",
  asyncHandler(async (req, res) => {
    const { user } = req.query;
    const bookmarks = await knex("bookmarks").where({ user });
    return res.json(bookmarks);
  })
);

app.post(
  "/api/bookmarks",
  asyncHandler(async (req, res) => {
    const { title, url } = req.body;
    const success = await knex("bookmarks").insert({ title, url, user: 1 });
    return res.json(success);
  })
);

// Pages

const nav = `
<div>
  <span><a href="/">home</a></span>
  <span> |</span>
  <span><a href="/signup">signup</a></span>
  <span> |</span>
  <span><a href="/login">login</a></span>
  <span> |</span>
</div>
`;

const LoginedNav = `
<div>
  <span><a href="/">home</a></span>
  <span> |</span>
  <span><a href="/logout">logout</a></span>
</div>
`;

app.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const user = req.session.user;
    if (user === undefined) {
      return res.redirect("/login");
    }
    const view = `
    <div>
      <h2>Bookmark</h2>
      <%- nav %>
      <h3>User:</h3>
      <%= user.mail %>
      <h3>Contents:</h3>
      <% bookmarks.forEach(item=>{ %>
        <div>title: <%= item.title %></div>
        <div>url: <%= item.url %></div>
      <% }); %>
      <h3>Add:</h3>
      <form action="/" method="post" autocomplete="off">
        <input type="text" name="title" placeholder="title" /><br />
        <input type="text" name="url" placeholder="url" /><br />
        <input type="submit" value="submit" /><br />
      </form>
    </div>
    `;
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    const html = ejs.render(view, { user, bookmarks, nav:LoginedNav });
    return res.send(html);
  })
);

app.post(
  "/",
  asyncHandler(async (req, res, next) => {
    const { title, url, mail, password: pass } = req.body;
    const user = req.session.user;

    // ログイン画面から飛んできた場合
    if (lodash.isEmpty(user)) {
      const users = await knex("users").where({ mail, pass });
      if (users.length === 1) {
        // 認証成功
        req.session.user = users[0];
        return res.redirect("/");
      }
      // 認証失敗
      return res.redirect("/login");
    }

    // ブックマーク追加のアクションが呼び出され自身から飛んできた場合
    await knex("bookmarks")
      .insert({ title, url, user: user.id })
      .catch(err => {
        return res.send("エラーが発生しました。");
      });
    return res.redirect("/");
  })
);

app.get(
  "/signup",
  asyncHandler(async (req, res) => {
    const view = `
    <div>
      <h2>Bookmark</h2>
      <%- nav %>
      <h3>Sighup:</h3>
      <button>github</button><br />
      <button>twitter</button><br /><br />
      <form action="/" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="create" /><br />
      </form>
    </div>
    `;
    const html = ejs.render(view, { nav });
    return res.send(html);
  })
);

app.get(
  "/login",
  asyncHandler(async (req, res) => {
    const view = `
    <div>
      <h2>Bookmark</h2>
      <%- nav %>
      <h3>Login:</h3>
      <button>github</button><br />
      <button>twitter</button><br /><br />
      <form action="/" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="login" /><br />
      </form>
    </div>
    `;
    const html = ejs.render(view, { nav });
    return res.send(html);
  })
);

app.get(
  "/logout",
  asyncHandler(async (req, res) => {
    req.session.destroy(() => {
      return res.redirect("/login");
    });
  })
);

app.get(
  "/session-test",
  asyncHandler(async (req, res) => {
    const view = `
    <div>
      <span>count is… <%= count %></span>
      <span>expires in… <%= limit %></span>
    </div>
    `;
    if (req.session.count) {
      req.session.count++;
    } else {
      req.session.count = 1;
    }
    const html = ejs.render(view, {
      count: req.session.count,
      limit: req.session.cookie.maxAge / 1000
    });
    return res.send(html);
  })
);

app.listen(3000);
