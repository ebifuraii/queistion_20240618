// エントリーポイント//

const PORT = process.env.PORT || 3000; // .env(環境変数の定義)は、dotenvというライブラリにより、process.envにバインドされるため、process.env.xxxx で環境変数を設定できる。
const path = require("path"); //coreモジュールのPathの取得
const logger = require("./lib/log/logger.js")
const accesslogger = require("./lib/log/accesslogger.js");
const applicationlogger = require("./lib/log/applicationlogger.js");
const express = require("express"); //requirreはCommonJSの仕様で、Nodejsの環境で動作してくれる書き方。（サーバサイド側）　importはブラウザ上で動かす
const favicon = require("serve-favicon");
const app  = express();

// app.get("/",(req, res)=> {
//   res.end("Hello world"); // Getメソッドに対応するハンドラを指定  app.get(path, callback [, callback...])
// })

// Express settings  expressでejsを使うことを宣言（追加） 
app.set("view engine" , "ejs");  //決まり文句のようなもの
app.disable("x-powewred-by"); // サーバ情報の隠蔽

// Static resource rooting : 静的コンテンツの配信
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
app.use("/public", express.static(path.join(__dirname, "/public")));

// Set acess log
app.use(accesslogger());

// Dynamic resource rooting : ルーティング
app.use("/" , require("./routes/index.js"));
app.use("/test",async (req,res,next) => {
  // ネストが深くならないため、非同期化するモジュール呼び出し。
  const {promisify} = require("util");
  const path = require("path");
  const { sql } = require("@garafu/mysql-fileloader")({ root: path.join(__dirname, "./lib/database/sql")});
  const config = require("./config/mysql.config.js");
  const mysql = require("mysql");

  // 接続設定
  const con = mysql.createConnection({
    host: config.HOST,
    port: config.PORT,
    user: config.USERNAME,
    password: config.PASSWORD,
    database: config.DATABASE
  });
  // 接続設定
  const client = {
    // 非同期化
    connect: promisify(con.connect).bind(con),
    query: promisify(con.query).bind(con),
    end: promisify(con.end).bind(con)
  };
  var data;
  
  try {
    await client.connect();
    data = await client.query(await sql("SELECT_SHOP_BASIC_BY_ID"));
    console.log(data);
  } catch (err) {
    next(err);
  } finally {
    await client.end();
  }

  res.end("OK");
})

// Set applicaiton log
app.use(applicationlogger());

// Execute web application
app.listen(PORT, () => {
  logger.application.info(`Application listening at ${PORT}`); // portで指定したポート番号で、リクエストを待つ。（サーバの立ち上げ）  app.listen([port[, host[, backlog]]][, callback])
});


// メモ //
/*
プロジェクトの骨組み

・フォルダ準備
・package.json作成　：npm init
・.gitignore作成
・環境変数ファイルの作成　：F5で作成。（Nodejsを選択。）
・デバッグ構成準備　：　.envファイルの"configurations"を設定。
　例："program": "${workspaceFolder}/app.js",
      "envFile": "${workspaceFolder}/.env"

*/