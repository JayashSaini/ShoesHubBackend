const { Router } = require('express');
const router = Router();
const { healthcheck } = require('../controllers/healthcheck.controllers.js');

router.route('/').get(healthcheck);

module.exports = router;
