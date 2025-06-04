const mysql = require("mysql2");

const connection = mysql.createPool({
    host: "book-management-khushitekwani.j.aivencloud.com",
    user: "avnadmin",
    port: 27566,
    password: process.env.DB_PASSWORD,
    database: "defaultdb",
      ssl: {
        rejectUnauthorized: false
    },
})

connection.getConnection((err, con) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`Connected to Database `)
    }
})


module.exports = connection.promise();