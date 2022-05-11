const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('./async')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.protect = asyncHandler(async (req, res, next) => {
    let token

    // Set token from Bearer token from in header
    if (req.headers && req.headers.authorization) {

        if (req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }
    }

    // else {
    //     return next(new ErrorResponse(`Not authorized to access this route NO BEARER TOKEN`, 401))
    // }

    // Set token from cookie
    else if (req.cookies.token) {
        token = req.cookies.token
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse(`Not authorized to access this route  TOKEN`, 401))
    }


    try {
        // Verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decode.id)
        next()

    } catch (error) {
        return next(new ErrorResponse(`Not authorized to access this route CATCH`, 401))
    }
})

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 401))
        }
        next()
    }
}