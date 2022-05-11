// https://atomizedobjects.com/blog/quick-fixes/what-do-multiple-arrow-functions-mean-in-javascript/
// https://blog.bitsrc.io/understanding-currying-in-javascript-ceb2188c339
const advanceResults = (model, populate) => async (req, res, next) => {
    let query

    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => {
        delete reqQuery[param]
    })

    // Create query string
    let queryStr = JSON.stringify(reqQuery)

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    // Finding resource
    query = model.find(JSON.parse(queryStr))

    // Select Fileds
    // https://mongoosejs.com/docs/queries.html
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort
    if (req.query.sort) {
        const fields = req.query.sort.split(',').join(' ')
        query = query.sort(fields)
    } else {
        query = query.sort('-createAt')
    }

    // Pagination
    // page=3&limit=25
    const page = parseInt(req.query.page, 10) || 1 // 3
    const limit = parseInt(req.query.limit, 10) || 25 // 25
    const startIndex = (page - 1) * limit // 50
    const endIndex = page * limit //75
    const total = await model.countDocuments()

    // Skip results
    // skip(50).limit(25). -> show results 51- 75 on the page3
    query = query.skip(startIndex).limit(limit)

    if (populate) {
        query = query.populate(populate)
    }

    // Executing query
    const results = await query

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
}

module.exports = advanceResults
