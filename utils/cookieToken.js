const User = require('../models/user.schema')


const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    // could be a seperate file in utils
}

const cookieToken = (user, res) => {
    const token = user.getJwtToken()
    user.password = undefined
    console.log(user);

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        success: true,
        token,
        user
    })
}

module.exports = cookieToken;