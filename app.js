const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
const session = require("express-session");
const lodash = require("lodash");
const validator = require("validator");
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

// utils
const validateMail = text => true; // TODO: メールアドレスのバリデーションを実装
const validatePassword = text => true; // TODO: パスワードのバリデーションを実装

let error = undefined;

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

const loginedNav = `
<div>
  <span><a href="/">home</a></span>
  <span> |</span>
  <span><a href="/setting">setting</a></span>
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
        <input type="sub mit" value="submit" /><br />
      </form>
    </div>
    `;
    const bookmarks = await knex("bookmarks").where({ user: user.id });
    const html = ejs.render(view, { user, bookmarks, nav: loginedNav });
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
      <% if(error) { %>
        <div style="color: red;"><%= error %></div><br />
      <% } %>
      <form action="/signup/callback" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="create" /><br />
      </form>
    </div>
    `;
    const html = ejs.render(view, { nav, error });
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
    const { password: pass } = req.body;
    if (validator.isLength(pass, { min: 4, max: 32 })) {
      next();
    } else {
      error = "パスワードは4字以上32字以内で登録可能です";
      res.redirect("/signup");
    }
  }),
  asyncHandler(async (req, res) => {
    const { mail, password: pass } = req.body;
    knex("users")
      .insert({ mail, pass })
      .catch(err => {
        error = "エラーが発生しました。";
        res.redirect("/signup");
      });
    return res.redirect("/login");
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
      <% if(error) { %>
        <div style="color: red;"><%= error %></div><br />
      <% } %>
      <form action="/login/callback" method="post" autocomplete="off">
        <input type="text" name="mail" placeholder="mail" /><br />
        <input type="text" name="password" placeholder="password" /><br />
        <input type="submit" value="login" /><br />
      </form>
    </div>
    `;
    const html = ejs.render(view, { nav, error });
    error = undefined;
    res.send(html);
  })
);

app.post(
  "/login/callback",
  asyncHandler(async (req, res, next) => {
    const { mail, password: pass } = req.body;

    const users = await knex("users").where({ mail, pass });
    if (users.length === 1) {
      // 認証成功
      req.session.user = users[0];
      return res.redirect("/");
    }
    // 認証失敗
    error = "正しいメールアドレスかパスワードを入力してください";
    return res.redirect("/login");
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
  "/setting",
  asyncHandler(async (req, res) => {
    const view = `
    <div>
      <h2>Bookmark</h2>
      <%- loginedNav %>
      <h3>Change:</h3>
      <% if(error) { %>
        <div style="color: red;"><%= error %></div><br />
      <% } %>
      <form action="/setting/changePassword" method="post" autocomplete="off">
        <input type="text" name="current" placeholder="current" /><br />
        <input type="text" name="fresh" placeholder="fresh" /><br />
        <input type="submit" value="update" /><br />
      </form>
    </div>
    `;
    const html = ejs.render(view, { loginedNav, error });
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
      .then(result => result[0]);
    console.log(num);
    res.redirect("/");
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

app.get(
  "/onion/:id",
  (req, res, next) => {
    res.send("aa");
    res.send("aa");
    console.log("middleware A");
    next();
    console.log("middleware F");
  },
  (req, res, next) => {
    console.log("middleware B");
    next();
    console.log("middleware E");
  },
  (req, res, next) => {
    console.log("middleware C");
    if (req.params.id === "1") {
      res.send("hello");
    }
    res.send("no");

    console.log("middleware D");
  }
);

app.listen(3000);
