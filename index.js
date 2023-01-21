import mongoose from "mongoose";
import app from './app'
import config from "./config/index"

//(async () => {})() ==== iife
(async () => {
    try {
        await mongoose.connect(config.MONGODB_URL)
        console.log("DB Connected");

        app.on('error', (err) => {
            console.log("ERROR: ", err);
        })

        onListening = () => {
            console.log(`Listening on ${config.PORT}`);
        }

        app.listen(config.PORT, onListening)

    } catch (err) {
        console.log("Error", err);
        throw err
    }
})()
