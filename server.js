const path = require('path')
const express = require('express')
const app = express()
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const colors = require('colors')
const cors = require('cors')
const errorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')

// Load env vars
dotenv.config({ path: './config/config.env' })

// Connect to databese
connectDB()

// Body parser
app.use(express.json())

// Cookie parser (Populate req.cookies)
app.use(cookieParser())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Session cookies between Express.js and Vue.js with Axios
// https://medium.com/developer-rants/session-cookies-between-express-js-and-vue-js-with-axios-98a10274fae7
// EnableCors
app.use(cors({
    origin: [
        `http://${process.env.VUE_APP_URL}`,
        `https://${process.env.VUE_APP_URL}`
    ],
    credentials: true,
    exposedHeaders: ['set-cookie']
}))

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

//Prevent http param pollution
app.use(hpp())

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))


// Route files
const items = require('./routes/items')
const auth = require('./routes/auth')
const users = require('./routes/users')

// Mount routes
app.use('/api/v1/items', items)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(
        `App runnnig in ${process.env.NODE_ENV} mode on port ${PORT}`
            .yellow.bold
    )
})
