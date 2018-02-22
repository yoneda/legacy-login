var express = require('express');
var bodyParser = require("body-parser");
var request = require("request");
var moment = require("moment");
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
  var qiitaOptions = {
    url:"https://qiita.com/api/v2/authenticated_user/items?page=1&per_page=3",
    headers:{
      "Authorization":"Bearer 5eeb08d5be63b3f42ba5d43b4ee359c3a5132f6a",
      "Content-Type":"application/json"
    }
  };
  request(qiitaOptions,function(error,response,body){
    var json = JSON.parse(body);
    var pages = json;
    var qiita = [];
    for(var page of pages){
      var title = page.title;
      var url = page.url;
      var created_at = page.created_at;
      var date = moment.utc(created_at);
      var dateFormat = date.format("YYYY/MM/DD");
      console.log(dateFormat);
    }
  })
  // Scrapbox の API にアクセス
  /*
  request("https://scrapbox.io/api/pages/yoneda/?limit=3",function(error,response,body){
    var json = JSON.parse(body);
    var pages = json.pages;
    var scrapbox = [];
    for(var key in pages){
      var title = pages[key].title;
      var url = "https://scrapbox.io/yoneda/" + title;
      var timestamp = pages[key].updated;
      var date = moment.unix(timestamp);
      var dateFormat = date.format("YYYY/MM/DD");
      scrapbox.push([title,dateFormat,url]);
    }
    res.render("index.ejs",{scrapbox:scrapbox});
  });*/
});

app.listen(3000);
