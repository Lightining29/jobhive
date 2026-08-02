const router = require('express').Router();
const { protect } = require('../middleware/auth');
const notifications = require('../controllers/notifications.controller');

router.use(protect);

router.get('/', notifications.listNotifications);
router.post('/read-all', notifications.markRead);
router.patch('/:id/read', notifications.markOneRead);

module.exports = router;
