const mongoose = require("mongoose");
const validator = require("validator");
const AuthRoles = require("../utils/authRoles");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("node:crypto");
const config = require("../config/index");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "Name is required"],
            maxLength: [30, "Name must be less than 30"]
        },
        email: {
            type: String,
            require: [true, "Email is required"],
            validate: [validator.isEmail, 'Please enter email in correct format'],
            unique: true
        },
        password: {
            type: String,
            require: [true, "Password is required"],
            minLength: [8, "Password must be more than 8 characters"],
            select: false
        },
        role: {
            type: String,
            enum: Object.values(AuthRoles),
            default: AuthRoles.USER
        },
        photo: {
            id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            }
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true
    }
);

//encrpyt password before save - pre hook
userSchema.pre('save', async function(next){
    //this.modified will check if the password field is modifying rn or not
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
});

//add more features/methods to your schema

//compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
},

//generate jwt token
userSchema.methods.getJwtToken = function(){
    return JWT.sign(
        {
            id: this._id,
            role: this.role
        },
        config.JWT_SECRET,
        {
            expiresIn: config.JWT_EXPIRY
        }
    )
},

//generate forgot password token
userSchema.methods.generateForgetPasswordToken = function () {
    const forgotToken = crypto.randomBytes(20).toString('hex')

    //step1 - saveto DB
    this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex")

    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
    
    //step2 - return value to user
    return forgotToken
},

//change password
//1. take password from user
//2. if user is logged in use auth token and take new password

module.exports = mongoose.model("User",userSchema)