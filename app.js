const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

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

app.listen(3000);
