const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Load models
const Item = require('./models/Item')
const User = require('./models/User')


// Connect to database
mongoose.connect(process.env.MONGO_URI)

// Read JSON file
const items = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/items.json`, 'utf-8')
)

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/user.json`, 'utf-8')
)

// Import into DB
const importData = async () => {
    try {
        await Item.create(items)
        await User.create(users)
        console.log('Data Imported...'.green.inverse)
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

// Remove data from DB
const deleteData = async () => {
    try {
        await Item.deleteMany()
        await User.deleteMany()
        console.log('Data Destroyed...'.red.inverse)
        process.exit()
    } catch (err) {
        console.error(err)
    }
}

// process.argv[2] === '-i' = node seeder -i
// process.argv[2] === '-d' = node seeder -d
if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
}
