const mongoose = require('mongoose')
const slugify = require('slugify')
const { Schema } = mongoose

const ItemSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        unique: true,
        trim: true,
        maxlength: [50, 'Title con not be more then 50 characters']
    },
    slug: String,
    priority: {
        type: Number,
        min: [1, 'Priority items must be at least 1'],
        max: [10, 'Priority items must can not be more than 10'],
        required: [true, 'Please add a priority'],
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})

// Mongoose create slug from the title
ItemSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true })
    next()
})


module.exports = mongoose.model('Items', ItemSchema)
