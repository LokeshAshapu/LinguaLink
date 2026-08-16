import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import { authRouter } from './modules/auth/auth.controller';
import { usersRouter } from './modules/users/users.controller';
import { contactsRouter } from './modules/contacts/contacts.controller';
import { languagesRouter } from './modules/languages/languages.controller';
import { callsRouter } from './modules/calls/calls.controller';
import { latencyRouter } from './modules/audit/latency.controller';
import { SignalingGateway } from './modules/signaling/signaling.gateway';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LinguaLink Core API',
    version: 'v0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Module API Routers
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/contacts`, contactsRouter);
app.use(`${API_PREFIX}/languages`, languagesRouter);
app.use(`${API_PREFIX}/calls`, callsRouter);
app.use(`${API_PREFIX}/metrics`, latencyRouter);

// Initialize Signaling WebSockets Gateway
export const signalingGateway = new SignalingGateway(server);

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Only listen if not in Jest test environment to prevent EADDRINUSE errors
if (process.env.NODE_ENV !== 'test') {
  const portNum = Number(PORT);
  const lanIp = getLocalIpAddress();
  server.listen(portNum, '0.0.0.0', () => {
    console.log(`🚀 LinguaLink Core API server running on http://0.0.0.0:${PORT}`);
    console.log(`   LAN Access: http://${lanIp}:${PORT}${API_PREFIX}`);
    console.log(`   Health Check: http://${lanIp}:${PORT}/health`);
    console.log(`   Signaling Gateway: ws://${lanIp}:${PORT}/signaling`);
  });
}
