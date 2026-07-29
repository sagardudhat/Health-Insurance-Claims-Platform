// Server Entrypoint: Initiates database connection and listens on configured port.
import { app } from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer();
