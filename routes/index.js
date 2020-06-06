'use strict';
var express = require('express');
var router = express.Router();

let landing = require('../Controllers/landing');
//let viztrack = require('../Controllers/viztrack');

/* GET home page. */
router.get('/',landing.get_landing);
router.post('/', landing.redirect_viztrack);
router.get('/viztrack', landing.get_viztrack);

module.exports = router;
