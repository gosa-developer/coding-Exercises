// src/server.ts

import app from './examples/app';
import { consoleLogger } from './utils/console-logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  consoleLogger.info(`🚀 Server is running on port ${PORT}`);
  consoleLogger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  consoleLogger.info(`✨ http://localhost:${PORT}`);
  consoleLogger.info(`\n📋 Test the logging middleware:`);
  consoleLogger.info(`   GET  http://localhost:${PORT}/users`);
  consoleLogger.info(`   POST http://localhost:${PORT}/users -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'`);
  consoleLogger.info(`   GET  http://localhost:${PORT}/users/999`);
  consoleLogger.info(`   POST http://localhost:${PORT}/login -d '{"username":"admin","password":"secret","token":"abc123"}'`);
  consoleLogger.info(`   GET  http://localhost:${PORT}/slow`);
  consoleLogger.info(`   GET  http://localhost:${PORT}/error`);
});