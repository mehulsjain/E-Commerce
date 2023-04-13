const mongoose = require("mongoose");
const app = require("../app.js")
//(async () => {})() ==== iife

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL,
            {useNewUrlParser: true,
            useUnifiedTopology: true})
            .then(console.log("DB Got Connected"))
            .catch(error => {
                console.log("DB Connection issues")
                console.log(error)
                process.exit(1)
            })

    } catch (err) {
        console.log("Error", err);
        throw err
    }
}

module.exports = connectToDB;