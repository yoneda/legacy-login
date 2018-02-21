var express = require('express');
var bodyParser = require("body-parser");
var request = require("request");
var app = express();

// 静的ファイル(image,css,javascript) をpublic フォルダに格納。
// test.pngにアクセスしたいときは、
// http://localhost:3000/test.png
app.use(express.static(__dirname+"/public"));

// bodyParser の初期化
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// ejs の初期化
app.set("views",__dirname + "/views");
app.set("view engine","ejs");

// トップ画面
app.get("/",function(req,res){
  request("https://scrapbox.io/api/pages/yoneda/?limit=3",function(error,response,body){
    var json = JSON.parse(body);
    var pages = json.pages;
    for(var key in pages){
      console.log(pages[key].title);
    }
  });
  res.render("index.ejs");
});

app.listen(3000);
