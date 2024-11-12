const WebSocket = require('ws');
const { createLogger } = require('../utils/logger');
const { SessionManager } = require('./sessionManager');
const { WebSocketServer } = require('./websocket');

const logger = createLogger('Server');
const PORT = process.env.PORT || 3000;

class Server {
    constructor() {
        this.wss = new WebSocket.Server({ port: PORT });
        this.sessionManager = new SessionManager();
        this.wsServer = new WebSocketServer(this.wss, this.sessionManager);
    }

    start() {
        try {
            this.wsServer.initialize();
            logger.info(`Server started on port ${PORT}`);
        } catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}

const server = new Server();
server.start(); 