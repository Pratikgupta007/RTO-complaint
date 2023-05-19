const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const imgur = require('imgur-uploader');
const fileupload = require("express-fileupload");
const session = require('express-session');
const pg = require('pg');

const app = express();


const client = new pg.Client("postgres://gkjaxfnx:oMVhwKQJll7h6RqIMGn00nKl4dqvn17v@babar.db.elephantsql.com/gkjaxfnx")

client.connect();

// Log a message to the console when the connection is established
console.log("Connected to the database");

app.set('view engine', 'ejs'); // Set the view engine to be EJS

app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser to parse form data
var urlencodedparser = bodyParser.urlencoded({ extended: false }) // Create a urlencoded parser
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(fileupload()); // Use the fileupload middleware to handle file uploads


// Use the express-session middleware to manage user sessions
app.use(session({
    secret: "my-secret-key", // Use a secret key to encrypt the session data
    resave: false, // Don't resave the session if it hasn't changed
    saveUninitialized: true, // Save a new, uninitialized session
    expires: new Date(Date.now() + (60 * 60 * 1000)) // Set the session to expire after 1 hour
}));

// ---------------------------------------------------------------
//                      POST Routes
// ---------------------------------------------------------------
app.get("/", function (req, res) {
    client.query("Select user_complaint_description from UserComplaints order by complaint_id desc limit 3", function (err, queryResult) {
        if (err) console.log("Database error: " + err);
        else {
            let complaintResult = (queryResult.rows);
            res.render('index', { complaintResult })
        }
    })
})


// Render Register Complaint
app.route("/registerComplaint")
    .get(function (req, res) {
        res.render('registerComplaint')
    })
    .post(urlencodedparser, function (req, res) {

        // Read the post title and plant information from the request body
        let firstName = req.body.firstName.trim();
        let lastName = req.body.lastName.trim();
        let aadharNumber = req.body.aadharNumber.trim();
        let phoneNumber = req.body.phoneNumber.trim();
        let userEmail = req.body.userEmail.trim();
        let userState = req.body.userState.trim();
        let userCity = req.body.userCity.trim();
        let pincode = req.body.pincode.trim();
        let description = req.body.description.trim();
        let scammerPhone = req.body.scammerPhone.trim();


        if (aadharNumber.length != 12 || phoneNumber.length != 10 || pincode.length != 6 || description.length < 50 || userCity.length > 20 || userState.length > 20) {
            res.send("Enter valid inputs!")
        } else {

            const insertQuery = "Insert into UserComplaints(user_first_name, user_last_name, user_aadhar_number, user_phone_number, user_email, user_state, user_city, user_pincode, user_complaint_description, scammer_phone) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";

            // Use the client to execute the query with the provided parameters
            client.query(insertQuery, [firstName, lastName, aadharNumber, phoneNumber, userEmail, userState, userCity, pincode, description, scammerPhone], function (err, queryResult) {
                if (err) {
                    console.log("Error" + err);
                    res.send("something went wrong!")
                }
                else {
                    console.log("Data insertion successfull!");
                    // res.send("success")
                    res.render('thankyou')
                }
            })
        }
        // console.log("i got the data");
    })

// Render Thank you page
app.get("/thankyou", function (req, res) {
    res.render("thankyou")
})


app.get("/admin", function (req, res) {
    if (req.session.authenticated) {
        res.redirect('/adminView')
    } else res.render("admin")
})


app.post("/admin", function (req, res) {
    let adminUserName = req.body.adminUserName;
    let adminPassword = req.body.adminPassword;
    client.query("Select * from AdminInfo where admin_user_name = $1 and admin_password = $2", [adminUserName, adminPassword], function (err, queryResult) {
        if (err) {
            console.log("Error in database: " + err);
        } else {
            if (queryResult.rows.length != 0) {
                req.session.authenticated = true;
                req.session.adminName = queryResult.rows[0].admin_name;
                let adminName = queryResult.rows[0].admin_name
                res.redirect("/adminView")
            } else {
                res.redirect('/admin')
            }
        }
    })
})

app.get("/adminView", function (req, res) {
    if (!req.session.authenticated) {
        res.redirect("/admin")
    } else {
        client.query("Select * from UserComplaints", function (err, queryResult) {
            if (err) {
                console.log("Database Error: " + err);
            } else {
                // if (queryResult.rows.length == 0) {
                //     res.send("No records found")
                // } else {
                let complaintResult = queryResult.rows;
                res.render("adminView", { complaintResult: complaintResult })
                // }
            }
        })
    }
})


app.get("/complaints/:postId", function (req, res) {
    if (!req.session.authenticated) {
        res.redirect("/admin")
    } else {
        // Get the post ID from the route parameters
        let postId = req.params.postId;

        // Query the database to get the details of the post with the specified ID
        client.query(
            "Select * from UserComplaints where complaint_id = $1",
            [postId],
            function (err, result) {
                // Check for errors
                if (err) {
                    // If there was an error, send a server error response
                    res.status(404).render('error');
                } else {
                    // Otherwise, render the posts page with the data received from the database
                    if (result.rows.length != 0) {
                        let complaintResult = result.rows[0];
                        // console.log(result);
                        res.render("posts", { complaintResult });
                    } else {
                        res.status(404).render('error');
                    }
                }
            }
        );
    }
});

app.get("/logoutAdmin", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            // If there was an error, send a server error response
            res.status(500).send({ success: false, error: err });
        } else {
            // Otherwise, send a success response
            res.status(400).redirect('/admin')
        }
    });
});


app.listen(3000, function () {
    console.log("Server is running on port 3000!");
});