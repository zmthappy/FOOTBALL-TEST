const mysql = require('mysql');

const dbPool = mysql.createPool({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "123456",
    database: "nodefootballsprider",
    connectionLimit: 10,
    multipleStatements: true,
});

module.exports = dbPool
