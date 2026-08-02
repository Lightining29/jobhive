const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, notifications, unreadCount });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true, message: 'Notifications marked as read.' });
});

const markOneRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { $set: { read: true } });
  res.json({ success: true });
});

module.exports = { listNotifications, markRead, markOneRead };
