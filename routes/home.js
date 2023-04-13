const express = require('express')
const router = express.Router()

const {home} = require('../Controllers/home.controller')

router.route('/').get(home);

module.exports = router;