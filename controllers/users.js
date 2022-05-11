const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')

// @des         Get all users
// @route       GET api/v1/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @des         Get single users
// @route       GET api/v1/users/:id
// @access      Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorResponse(
        `User not found with id of ${req.params.id}`, 404)
    )

    res.status(200).json({
        success: true,
        data: user
    })
})

// @des         Create single users
// @route       POST api/v1/users
// @access      Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body)

    res.status(201).json({
        success: true,
        data: user
    })
})

// @des         Update single users
// @route       PUT api/v1/users/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {

    if (req.body.password) return next(new ErrorResponse(
        `You don't access to update password`, 400)
    )

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!user) return next(new ErrorResponse(
        `User not found with id of ${req.params.id}`, 404)
    )

    res.status(200).json({
        success: true,
        data: user
    })
})

// @des         Delete single users
// @route       PELETE api/v1/users/:id
// @access      Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorResponse(
        `User not found with id of ${req.params.id}`, 404)
    )

    user.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})
