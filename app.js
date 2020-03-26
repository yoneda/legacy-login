const express = require("express");
const bodyParser = require("body-parser");
const asyncHandler = require("express-async-handler");
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
  }
});

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

const topView = `
<div>
  <h2>Bookmark</h2>
  <h3>user:</h3>
  <div><%= user.mail %></div>
</div>
`;
app.get("/", (req, res) => {
  const user = { mail: "test@gmail.com" };
  const html = ejs.render(topView, { user });
  res.send(html);
});

// REST API
app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await knex("users").where({ id });
    res.json(user);
  })
);

app.get(
  "/api/bookmarks",
  asyncHandler(async (req, res) => {
    const { user } = req.query;
    const bookmarks = await knex("bookmarks").where({ user });
    res.json(bookmarks);
  })
);

app.listen(3000);
