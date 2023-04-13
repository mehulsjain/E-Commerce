const app = require("./app.js")
const PORT = process.env.PORT || 4000
require("dotenv").config()
const cloudinary = require('cloudinary')
const connectToDB = require("./config/db")

connectToDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.listen(PORT, () => {
    console.log(`App is running at http://localhost:${PORT}`)
})
