const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const { verifyToken } = require('../utils/generateToken');

const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    const rawCookies = socket.handshake.headers.cookie || '';
    const token = rawCookies
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('admin_session='))
      ?.split('=')[1];

    if (token) {
      try {
        const payload = verifyToken(token);
        if (mongoose.connection.readyState === 1) {
          const admin = await Admin.findById(payload.sub);
          if (admin?.isActive && admin.role === 'admin') {
            socket.join('admins');
            socket.data.admin = true;
          }
        }
      } catch {
        socket.disconnect(true);
        return;
      }
    }

    socket.on('order:track', async ({ orderId, trackingToken, mobile }) => {
      if (!orderId || !trackingToken || !mobile) {
        socket.emit('order:tracking-error', { message: 'Order tracking details are required' });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        socket.emit('order:tracking-error', { message: 'Invalid order identifier' });
        return;
      }
      const order = await Order.findById(orderId).select('+trackingToken');
      if (
        !order ||
        order.trackingToken !== trackingToken ||
        order.customer.mobile !== String(mobile).replace(/\D/g, '').slice(-10)
      ) {
        socket.emit('order:tracking-error', { message: 'Unable to access order tracking' });
        return;
      }
      socket.join(`order:${order._id}`);
      socket.emit('order:tracking-active', { orderId: order._id.toString() });
    });

    socket.on('disconnect', () => {});
  });

  app.set('io', io);
  return io;
};

module.exports = { initializeSocket };