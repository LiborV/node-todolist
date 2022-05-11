
// @desc    Logs request to console
const logger = (req, res, next) => {
    req.hello = 'Hello World middleware ! '
    console.log(
        `LOGGER: ${req.method} ${req.protocol}:${req.get('host')}${req.originalUrl}`
    )
    next()
}

module.exports = logger