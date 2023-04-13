const express = require("express");
const app = express()
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
const cors = require('cors');
const morgan = require("morgan");

//import all routes
const home = require('./routes/home')
const user = require('./routes/user')

app.set("view engine", "ejs");

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

//morgan logger - search on why using tiny
app.use(morgan('tiny'))

//router middleware
app.use("/api/v1", home)
app.use("/api/v1", user)

app.get('/signuptest', (req, res) => {
    res.render('signUpTest')
})

module.exports = app;