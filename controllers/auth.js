const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')

// @des         Register user
// @route       POST api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body

    const user = await User.create({
        name,
        email,
        password
    })

    sendTokenResponse(user, 200, res)
})

// @des         Login user
// @route       POST api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`, 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorResponse('Invalid credentials USER', 401))
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials MATCH', 401))
    }

    sendTokenResponse(user, 200, res)
})

// @des         Logout
// @route       GET api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000)
    }).status(200).json()
})

// @des         Get current logged in user
// @route       GET api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        data: user
    })
})

// @des         Forgot password
// @route       POST api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(new ErrorResponse(`This is no user with that email`, 404))

    // Get reset token
    const resetToken = user.getResetPasswordToken()

    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetUrl = `${req.protocol}://${process.env.VUE_APP_URL}/resetpassword`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Use the password reset token at this url: ${resetUrl}. Reset token: ${resetToken}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({
            success: true,
            data: `Email sent`,
            email: user.email
        })
    } catch (err) {
        console.log(err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse(`Email could be sent`, 500))
    }
})


// @des         Reset password
// @route       PUT api/v1/auth/resetpassword/:resettoken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hash token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordToken: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400))
    }

    // Sent new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendTokenResponse(user, 200, res)
})


// @des         Update password
// @route       PUT api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    if (! await user.matchPassword(req.body.currentPassword)) {
        return next(new ErrorResponse(`Password is incorrect`, 401))
    }

    user.password = req.body.newPassword
    await user.save()

    sendTokenResponse(user, 200, res)
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken()

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60,
        ),
        // httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
        // options.httpOnly = true
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        data: token
    })
}
