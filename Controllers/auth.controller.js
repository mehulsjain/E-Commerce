import User from '../models/user.schema'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'
import mailHelper from '../utils/mailHelper'
import crypto from'crypto'

export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // could be a seperate file in utils
}

/************************************************************* 
* @SIGNUP
* @route http://localhost:5000/api/auth/signup
* @description User signUp controller for vcreating a new user
* @parameters name, email, password
* @return User Object
*************************************************************/

export const signUp = asyncHandler(async (req, res) => {
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
        password
    });
    const token = user.getJwtToken()
    console.log(user);
    user.password = undefined

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        success: true,
        token.
        user
    })
})

/************************************************************* 
* @LOGIN
* @route http://localhost:5000/api/auth/login
* @description User signIn controller for logging in a user
* @parameters email, password
* @return User Object
*************************************************************/

export const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        throw new CustomError('Please fill all fields', 400)
    }
    const user = await User.findOne({email}).select("+password")
    
    if(!user){
        throw new CustomError('Invalid credentials', 400)
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(isPasswordMatched){
        const token = user.getJwtToken()
        user.password = undefined
        res.cookie("token", token, cookieOptions)
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }
})

/************************************************************* 
* @LOGIN
* @route http://localhost:5000/api/auth/logout
* @description User logout by clearing user cookies
* @parameters 
* @return success message
*************************************************************/

export const logout = asyncHandler(async (_req, res) => {
    //res.clearCookie()
    res.cookie("token", null, {
        expires:new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success(200).json({
            success: true,
            message: "Logged Out"
        })
    })
})

/************************************************************* 
* @FORGOT_PASSWORD
* @route http://localhost:5000/api/auth/password/forgot
* @description User will submit email and we will generate a token
* @parameters email
* @return success message - email snet
*************************************************************/

export const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})
    if(!user) {
        throw new CustomError('Usder not found' 404)
    }
    const resetToken = user.generateForgetPasswordToken()
    
    //saving resettoken data in user and in object in database using .save() meathod
    await user.save({validateBeforeSave: false}) 

    // taking parameters from req object described in express documentation in detail
    const resetUrl =
    `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`
    
    const text =    Your password reset url is \n \n ${resetUrl} \n\n

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

export const resetPassword = asyncHandler(async (req, res) => {
    const {token:resetToken} = req.params
    const {password, confirmPassword} = req.body

    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest(hex)

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
    const token = user.getJwtToken()
    user.password = undefined
    res.cookie('token', token, cookieOptions)
    res.status(200).json({
        success: true,
        user
    })

})

//TODO: create a controller for change password

/************************************************************* 
* @GET_PROFILE
* @REQUEST_TYPE GET
* @route http://localhost:5000/api/auth/profile
* @description Check for token and populate req.user
* @parameters * @return User object
*************************************************************/

export const getProfile = asyncHandler(async (req, res) => {
    const {user} = req
    if(!user){
        throw new CustomError('User not found', 404)
    }
    res.status(200).json({
        success: true,
        user
    })
})