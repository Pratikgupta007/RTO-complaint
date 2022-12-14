const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const imgur = require('imgur-uploader');
const app = express();
const session = require('express-session');
const pg = require('pg');

// const client = new pg.Client({
//     host: process.env.ADMIN_HOST,
//     user: process.env.ADMIN_USER,
//     port: process.env.ADMIN_PORT,
//     password: process.env.ADMIN_PASSWORD,
//     database: process.env.ADMIN_DATABASE,
//     idleTimeoutMillis: 0,
//     connectionTimeoutMillis: 0
// });

// // Connect to the database
// client.connect();

// Log a message to the console when the connection is established
console.log("Connected to the database");

app.set('view engine', 'ejs'); // Set the view engine to be EJS

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser to parse form data
var urlencodedparser = bodyParser.urlencoded({ extended: false }) // Create a urlencoded parser
app.use(express.static("public")); // Serve static files from the "public" directory

app.get("/", function (req, res) {
    res.render('index')
})



app.get("/registerComplaint", function (req, res) {
    res.render('registerComplaint')
})

app.get("/thankyou", function (req, res) {
    res.render("thankyou.ejs")
})

app.listen(3000, function () {
    console.log("Server is running on port 3000!");
});

