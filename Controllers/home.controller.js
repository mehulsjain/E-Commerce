const asyncHandler = require('../services/asyncHandler')

exports.home = asyncHandler((req, res) => {
    res.status(200).json({
        success: true,
        greeting: "Hello From API"
    });
})