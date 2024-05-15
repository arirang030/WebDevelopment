"use strict";

// 포트
const PORT = 3300;

const app = require("../app");

app.listen(PORT, () => {
  console.log('서버 가동');
})