const User = require('../models/user.schema')
const asyncHandler = require('../services/asyncHandler')
const CustomError = require('../utils/customError')
const mailHelper = require('../utils/mailHelper')
const crypto = require('crypto')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const cookieToken = require('../utils/cookieToken')


/************************************************************* 
* @SIGNUP
* @route http://localhost:5000/api/auth/signup
* @description User signUp controller for vcreating a new user
* @parameters name, email, password
* @return User Object
*************************************************************/

const signUp = asyncHandler(async (req, res) => {

    let result;

    if(req.files){
        let file = req.files.photo
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })
    }

    const {name, email, password} = req.body

    if(!name || !email || !password){
        throw new CustomError('Please fill all fields', 400)
    }
    //check if user exists
    const existingUser = await User.findOne({email})

    if(existingUser){
        throw new CustomError('User already exists', 400)
    }

    const user = await User.create({
        name,
        email,
        //we dont have to encrypt password here as we are doing that in out models
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }
    });

    cookieToken(user, res);
})

/************************************************************* 
* @LOGIN
* @route http://localhost:5000/api/auth/login
* @description User signIn controller for logging in a user
* @parameters email, password
* @return User Object
*************************************************************/

const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        throw new CustomError('Please fill all fields', 400)
    }

    //.select(+password) is to instruct the model to send password from
    // backend too as we have configured our model to not send password by default 
    const user = await User.findOne({email}).select("+password")
    
    if(!user){
        throw new CustomError('Invalid credentials', 400)
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(isPasswordMatched){
        cookieToken(user, res)
    }else{
        throw new CustomError('Invalid credentials', 400)
    }
})

/************************************************************* 
* @LOGOUT
* @route http://localhost:5000/api/auth/logout
* @description User logout by clearing user cookies
* @parameters 
* @return success message
*************************************************************/

const logout = asyncHandler(async (_req, res) => {
    //res.clearCookie()
    res.cookie("token", null, {
        expires:new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        // success(200).json({
            success: true,
            message: "Logged Out"
        // })
    })
})

/************************************************************* 
* @FORGOT_PASSWORD
* @route http://localhost:5000/api/auth/password/forgot
* @description User will submit email and we will generate a token
* @parameters email
* @return success message - email snet
*************************************************************/

const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    //if user not found in db
    if(!user) {
        throw new CustomError('Usder not found', 404)
    }

    // get token from user model method
    const resetToken = user.generateForgetPasswordToken()
    
    //saving resettoken data in user and in object in database using .save() meathod
    await user.save({validateBeforeSave: false}) 

    //creating a url - taking parameters from req object described in express documentation in detail
    const resetUrl =
    `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    
    const text =   ` Your password reset url is \n \n ${resetUrl} \n\n`

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email for website",
            text:text,
        })
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })
    } catch (error) {
        //roll back - clear field from database
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({validateBeforeSave: false})

        throw new CustomError(error.message || 'Email sent failure', 500)
    }
})

/************************************************************* 
* @RESET_PASSWORD
* @route http://localhost:5000/api/auth/password/reset/:resetToken
* @description User will be able to reset password based on url token
* @parameters token from url, password and confirmpass
* @return User object
*************************************************************/

const resetPassword = asyncHandler(async (req, res) => {
    try {
        const token = req.params.token
        const {password, confirmPassword} = req.body

        const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

        const user = await User.findOne({
            forgotPasswordToken: resetPasswordToken,
            forgotPasswordExpiry: {$gt: Date.now()}
        });

        if(!user){
            throw new CustomError('password token is invalid or expired', 400 )
        }

        if(password !== confirmPassword){
            throw new CustomError('password and confpassword dont match', 400 )
        }

        user.password = password
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save()

        //create token and send as response
        cookieToken(user, res)    
    } catch (error) {
        console.log(error)
    }
})

//TODO: create a controller for change password

/************************************************************* 
* @GET_PROFILE
* @REQUEST_TYPE GET
* @route http://localhost:5000/api/auth/profile
* @description Check for token and populate req.user
* @parameters * @return User object
*************************************************************/

const getProfile = asyncHandler(async (req, res) => {
    const {user} = req
    if(!user){
        throw new CustomError('User not found', 404)
    }
    res.status(200).json({
        success: true,
        user
    })
})

module.exports = {
    signUp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getProfile
}