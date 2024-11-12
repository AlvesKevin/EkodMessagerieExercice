const { createLogger } = require('../utils/logger');
const logger = createLogger('WebSocketServer');

class WebSocketServer {
    constructor(wss, sessionManager) {
        this.wss = wss;
        this.sessionManager = sessionManager;
    }

    initialize() {
        this.wss.on('connection', (socket) => {
            logger.info('New client connected');

            socket.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(socket, data);
                } catch (error) {
                    logger.error('Error handling message:', error);
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });

            socket.on('close', () => {
                this.handleDisconnection(socket);
            });
        });
    }

    handleMessage(socket, data) {
        switch (data.type) {
            case 'login':
                this.handleLogin(socket, data.username);
                break;
            case 'message':
                this.handleDirectMessage(data.sessionId, data.to, data.content);
                break;
            case 'get_users':
                this.sendUserList(socket);
                break;
            case 'get_conversations':
                this.handleGetConversations(data.sessionId);
                break;
            case 'start_conversation':
                this.handleStartConversation(data.sessionId, data.with);
                break;
            default:
                logger.warn(`Unknown message type: ${data.type}`);
        }
    }

    handleLogin(socket, username) {
        try {
            const sessionId = this.sessionManager.createUserSession(username, socket);
            socket.send(JSON.stringify({
                type: 'login_success',
                sessionId,
                username,
                message: `Bienvenue ${username}!`
            }));
            
            this.broadcastUserList();
        } catch (error) {
            socket.send(JSON.stringify({
                type: 'login_error',
                message: error.message
            }));
        }
    }

    broadcastUserList() {
        const onlineUsers = this.sessionManager.getOnlineUsers();
        this.wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: 'user_list',
                users: onlineUsers
            }));
        });
    }

    handleDisconnection(socket) {
        for (const [sessionId, user] of this.sessionManager.users) {
            if (user.socket === socket) {
                user.isOnline = false;
                logger.info(`User disconnected: ${user.username}`);
                
                // Notifier uniquement les utilisateurs en conversation avec cet utilisateur
                this.notifyUserStatusChange(user.username, false);
                break;
            }
        }
    }

    notifyUserStatusChange(username, isOnline) {
        const status = isOnline ? 'connecté' : 'déconnecté';
        this.wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: 'user_status',
                username,
                status,
                isNotification: true
            }));
        });
    }

    handleDirectMessage(fromSessionId, toUsername, content) {
        try {
            const fromUser = this.sessionManager.getUserBySessionId(fromSessionId);
            const toUser = this.sessionManager.getUserByUsername(toUsername);

            if (!toUser) {
                throw new UserNotFoundError('Destinataire non trouvé');
            }

            const message = {
                from: fromUser.username,
                content,
                timestamp: new Date().toISOString()
            };

            // Trouver la conversation
            const conversationId = this.sessionManager.findExistingConversation(fromSessionId, toUser.sessionId);
            if (conversationId) {
                this.sessionManager.addMessageToConversation(conversationId, message);
            }

            // Envoyer le message au destinataire uniquement
            toUser.socket.send(JSON.stringify({
                type: 'new_message',
                ...message
            }));

        } catch (error) {
            logger.error('Error sending direct message:', error);
            if (error instanceof UserNotFoundError) {
                const fromUser = this.sessionManager.getUserBySessionId(fromSessionId);
                fromUser.socket.send(JSON.stringify({
                    type: 'error',
                    message: error.message
                }));
            }
        }
    }

    sendUserList(socket) {
        socket.send(JSON.stringify({
            type: 'user_list',
            users: this.sessionManager.getOnlineUsers()
        }));
    }

    handleStartConversation(fromSessionId, toUsername) {
        try {
            const fromUser = this.sessionManager.getUserBySessionId(fromSessionId);
            const toUser = this.sessionManager.getUserByUsername(toUsername);

            if (!toUser) {
                fromUser.socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Utilisateur non trouvé'
                }));
                return;
            }

            // Vérifier si une conversation existe déjà
            const existingConvId = this.sessionManager.findExistingConversation(fromSessionId, toUser.sessionId);
            
            if (existingConvId) {
                const conversation = this.sessionManager.conversations.get(existingConvId);
                fromUser.socket.send(JSON.stringify({
                    type: 'conversation_exists',
                    with: toUsername,
                    conversationId: existingConvId,
                    messages: conversation.messages
                }));
            } else {
                const conversationId = this.sessionManager.createConversation(fromSessionId, toUser.sessionId);
                fromUser.socket.send(JSON.stringify({
                    type: 'conversation_started',
                    with: toUsername,
                    conversationId
                }));

                // Notifier l'autre utilisateur
                toUser.socket.send(JSON.stringify({
                    type: 'new_conversation',
                    with: fromUser.username,
                    conversationId
                }));
            }
        } catch (error) {
            logger.error('Error starting conversation:', error);
            const fromUser = this.sessionManager.getUserBySessionId(fromSessionId);
            fromUser.socket.send(JSON.stringify({
                type: 'error',
                message: 'Erreur lors du démarrage de la conversation'
            }));
        }
    }

    handleGetConversations(sessionId) {
        try {
            const user = this.sessionManager.getUserBySessionId(sessionId);
            const conversations = this.sessionManager.getUserConversations(sessionId);
            
            user.socket.send(JSON.stringify({
                type: 'conversations_list',
                conversations
            }));
        } catch (error) {
            logger.error('Error getting conversations:', error);
        }
    }
}

module.exports = { WebSocketServer }; 