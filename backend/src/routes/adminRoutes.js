const express = require('express');
const { requireAdmin } = require('../middlewares/authMiddleware');
const { getStats, getUsers } = require('../controllers/adminController');

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);

module.exports = router;
