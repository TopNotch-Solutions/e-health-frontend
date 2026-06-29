import { io } from 'socket.io-client';
import {
  getAccessToken,
  handleSessionExpired,
  isAccessTokenExpired,
  refreshAccessToken,
} from './authSession';
import { getApiBase } from './client';

let socket = null;

/**
 * Shared Socket.io client (JWT in handshake.auth.token).
 */
export function getSocket() {
  const token = getAccessToken();
  if (!token) return null;

  if (isAccessTokenExpired(token)) {
    refreshAccessToken().then((refreshed) => {
      if (!refreshed) handleSessionExpired();
    });
    return null;
  }

  if (!socket || socket.disconnected) {
    socket = io(getApiBase(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socket.on('connect_error', (err) => {
      const msg = err?.message || '';
      if (
        msg === 'Invalid token'
        || msg === 'Authentication required'
        || msg.toLowerCase().includes('token')
      ) {
        disconnectSocket();
        handleSessionExpired();
      }
    });
  } else if (socket.auth?.token !== token) {
    socket.auth = { token };
    socket.disconnect().connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function requestDepartmentQueueRefresh(department) {
  const s = getSocket();
  if (s?.connected) {
    s.emit('queue:request_refresh', department);
  }
}

export function requestNurseQueueRefresh() {
  requestDepartmentQueueRefresh('nurse');
}

export function requestDoctorQueueRefresh() {
  requestDepartmentQueueRefresh('doctor');
}
