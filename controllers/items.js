const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Item = require('../models/Item')
const User = require('../models/User')

// @des         Get all items
// @route       GET api/v1/items
// @route       GET api/v1/users/:userId/items
// @access      Private
exports.getItems = asyncHandler(async (req, res, next) => {
    if (req.params.userId) {
        const items = await Item.find({ user: req.params.userId })
        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        })
    } else if (req.user.role === 'admin') {
        res.status(200).json(res.advancedResults)
    } else {
        return next(new ErrorResponse(`The user does not have access`, 401))
    }
})

// @des         Get single items
// @route       GET api/v1/items/:id
// @access      Private
exports.getItem = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id)

    if (!item) return next(new ErrorResponse(
        `Item not found with id of ${req.params.id}`, 404)
    )

    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to get item`, 401)
        )
    }

    res.status(200).json({
        success: true,
        data: item
    })
})

// @des         Create single items
// @route       POST api/v1/users/:userId/items
// @access      Private
exports.createItem = asyncHandler(async (req, res, next) => {
    req.body.user = req.params.userId

    const user = await User.findById(req.params.userId)

    if (!user) {
        next(
            new ErrorResponse(`No user with the id ${req.params.userId}`, 404)
        )
    }

    // Make sure user is items owner
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to add items`, 401)
        )
    }

    const item = await Item.create(req.body)

    res.status(201).json({
        success: true,
        data: item
    })
})

// @des         Update single items
// @route       PUT api/v1/items/:id
// @access      Private
exports.updateItem = asyncHandler(async (req, res, next) => {
    let item = await Item.findById(req.params.id)

    if (!item) return next(new ErrorResponse(
        `Item not found with id of ${req.params.id}`, 404)
    )

    // Make sure user is items owner
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update item`, 401)
        )
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: item
    })
})

// @des         Delete single items
// @route       PELETE api/v1/items/:id
// @access      Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id)

    if (!item) return next(new ErrorResponse(
        `Item not found with id of ${req.params.id}`, 404)
    )

    // Make sure user is items owner
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete item`, 401)
        )
    }

    await item.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})
