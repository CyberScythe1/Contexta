const express = require('express');
const { googleLogin, completeTutorial } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/google', googleLogin);
router.put('/tutorial', requireAuth, completeTutorial);

module.exports = router;
