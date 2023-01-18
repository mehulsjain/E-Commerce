import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcrytpjs"
import JWT from "jsonwebtoken"
import crypto from "node:crypto"
import config from "../config/index";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: [ture, "Name is required"],
            maxLength: [30, "Name must be less than 30"]
        },
        email: {
            type: String,
            require: [ture, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            require: [ture, "Password is required"],
            maxLength: [8, "Password must be more than 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles)
            default: AuthRoles.USER
        }
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true
    }
);

//challenge 1 - encrpyt password - hooks
userSchema.pre("save", async function(next){
    //this.modified will check if the password field is modifying rn or not
    if(!this.modified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//add more features/meathods to your schema

userSchema.meathod = {
    //compare password
    comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password)
    }

    //generate jwt token
    getJwtToken: function(){
        retunr JWT.sign(
            {
                _id: this._id
                role: this.role
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRY
            }
        )
    }
}

export default mongoose.model("User",userSchema)