const { Router } = require('express');
const {
  createSubscription,
  getAllSubscription,
} = require('../controllers/subscription.controller');
const router = Router();

router.route('/').get(getAllSubscription);
router.route('/').post(createSubscription);

module.exports = router;
