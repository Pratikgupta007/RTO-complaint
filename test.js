const pg = require('pg')

const client = new pg.Client("postgres://gkjaxfnx:oMVhwKQJll7h6RqIMGn00nKl4dqvn17v@babar.db.elephantsql.com/gkjaxfnx")

client.connect();
console.log("Connected to the database!");

let firstName = "test"
let lastName = "test"
let aadharNumber = "test"
let phoneNumber = "test"
let userEmail = "test"
let userState = "test"
let userCity = "test"
let pincode = "test"
let description = "test"
let uploadImage = "test"

client.query("delete from UserComplaints",function(err,result){
    console.log("done");
})

