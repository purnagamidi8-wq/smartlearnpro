const { Notification } = require('../models');
const logger = require('../utils/logger');

let ioInstance = null;

function attachSocketServer(io) {
  ioInstance = io;
}

// Creates a DB notification AND pushes it in real time over the user's
// personal socket room (see sockets/index.js which joins users to `user:<id>`).
async function notify(userId, { type, title, message, link = null }) {
  const notification = await Notification.create({ user: userId, type, title, message, link });

  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:new', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      isRead: false,
      createdAt: notification.createdAt,
    });
  } else {
    logger.warn('notification_socket_unavailable', { userId, type });
  }

  return notification;
}

async function notifyAllAdmins(User, payload) {
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(admins.map((a) => notify(a._id, payload)));
}

module.exports = { attachSocketServer, notify, notifyAllAdmins };
