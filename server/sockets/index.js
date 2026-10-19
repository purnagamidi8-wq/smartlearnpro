const jwt = require('jsonwebtoken');
const { User } = require('../models');
const notificationService = require('../services/notificationService');
const proctorController = require('../controllers/proctorController');

// Section 7 / 20: Socket.IO powers both the in-app notification stream and
// the real-time admin proctoring dashboard. Auth happens via the same JWT
// used for REST calls, passed in the handshake.
function initSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.cookie || '')
          .split('; ')
          .find((c) => c.startsWith((process.env.JWT_COOKIE_NAME || 'slp_token') + '='))
          ?.split('=')[1];

      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    socket.join(`user:${user._id}`);

    if (user.role === 'admin') {
      socket.join('admins:proctoring');
    }

    socket.on('disconnect', () => {
      // no-op: rooms are cleaned up automatically
    });
  });

  notificationService.attachSocketServer(io);
  proctorController.attachSocketServer(io);
}

module.exports = initSockets;
