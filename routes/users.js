const express = require('express')

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users')

const User = require('../models/User')

const router = express.Router()

// Include other resource router
const itemsRouter = require('./items')

const advancedResults = require('../middleware/advanceResults')
const { protect, authorize } = require('../middleware/auth')

// Re-route into other resource router
router.use('/:userId/items', itemsRouter)

router.use(protect)
router.use(authorize('admin'))

router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser)

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router

