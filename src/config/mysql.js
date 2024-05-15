const mysql = require('mysql');

const db = mysql.createConnection ({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'users_info'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패: ' + err.stack);
    return;
  }

  console.log('MySQL 연결 성공');
});

module.exports = db;