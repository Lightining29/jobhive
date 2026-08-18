const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const userId = req.user._id || req.user.mongoId || req.user.id;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  const unreadCount = await Notification.countDocuments({ user: userId, read: false });
  res.json({ success: true, notifications, unreadCount });
});

const markRead = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.mongoId || req.user.id;
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  res.json({ success: true, message: 'Notifications marked as read.' });
});

const markOneRead = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.mongoId || req.user.id;
  await Notification.updateOne({ _id: req.params.id, user: userId }, { $set: { read: true } });
  res.json({ success: true });
});

module.exports = { listNotifications, markRead, markOneRead };
