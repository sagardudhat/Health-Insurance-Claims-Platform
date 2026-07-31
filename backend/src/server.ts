// Server Entrypoint: Initiates database connection and listens on configured port.
import { app } from './app';
import { connectDB } from './config/db';
import { configService } from './services/config.service';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await configService.initializeDefaultConfig();
  app.listen(PORT, () => {
    console.log(
      `[Server] Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
    );
  });
};

startServer();
