import http from 'http';
import { app } from './app';
import { connectDB } from './config/db';
import { configService } from './services/config.service';
import { initSocketIO } from './services/socket.service';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await configService.initializeDefaultConfig();

  const server = http.createServer(app);
  initSocketIO(server);

  server.listen(PORT, () => {
    console.log(
      `[Server] Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
    );
    console.log(`🔌 [Socket.io] Server listening for real-time WebSocket connections.`);
  });
};

startServer();
