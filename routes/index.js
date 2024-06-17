const router = require("express").Router();

// ejsテンプレートエンジンで生成したHTMLを返却 : renderを作成する。
router.get("/",(req , res) => {
  res.render("./index.ejs"); // viewsのejsを使用する。　この時は、viewsからの相対パスを指定する。(routes index.jsからではない)
});

module.exports = router;