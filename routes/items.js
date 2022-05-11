const express = require('express')

const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/items')

const Item = require('../models/Item')
const advancedResults = require('../middleware/advanceResults')

// mergeParams For Re-route into other resource router
const router = express.Router({ mergeParams: true })

const { protect } = require('../middleware/auth')

router.use(protect)

router
    .route('/')
    .get(advancedResults(Item, {
        path: 'user',
        select: 'name email'
    }), getItems)
    .post(createItem)

router
    .route('/:id')
    .put(updateItem)
    .delete(deleteItem)
    .get(getItem)

module.exports = router
