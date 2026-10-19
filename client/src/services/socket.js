import { io } from 'socket.io-client';

let socket = null;

// Socket auth is cookie-based (same JWT as REST), so no token needs to be
// passed manually - see server/sockets/index.js.
export function connectSocket() {
  if (socket) return socket;
  socket = io('/', { withCredentials: true, autoConnect: true });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
