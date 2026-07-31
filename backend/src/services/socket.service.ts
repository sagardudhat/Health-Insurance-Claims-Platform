import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocketIO = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`🔌 [Socket.io] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

/**
 * Emit real-time notification to all connected clients or specific role room
 */
export const emitRealtimeNotification = (event: string, payload: Record<string, unknown>) => {
  if (io) {
    io.emit(event, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    console.log(`⚡ [Socket.io] Broadcast event '${event}' to all connected clients.`);
  }
};
