const { v4: uuidv4 } = require('uuid');
const { createLogger } = require('../utils/logger');
const { UserNotFoundError, SessionError } = require('../utils/errors');

const logger = createLogger('SessionManager');

class SessionManager {
    constructor() {
        this.users = new Map();
        this.conversations = new Map();
    }

    createUserSession(username, socket) {
        if (this.isUsernameTaken(username)) {
            throw new SessionError('Ce pseudo est déjà utilisé');
        }

        const sessionId = uuidv4();
        this.users.set(sessionId, {
            username,
            socket,
            conversations: new Set(),
            isOnline: true
        });
        logger.info(`New session created for user: ${username}`);
        return sessionId;
    }

    createConversation(user1Id, user2Id) {
        const conversationId = uuidv4();
        this.conversations.set(conversationId, {
            participants: [user1Id, user2Id],
            messages: []
        });
        
        const user1 = this.users.get(user1Id);
        const user2 = this.users.get(user2Id);
        
        user1.conversations.add(conversationId);
        user2.conversations.add(conversationId);
        
        return conversationId;
    }

    getOnlineUsers() {
        const onlineUsers = [];
        for (const [sessionId, user] of this.users) {
            if (user.isOnline) {
                onlineUsers.push({
                    sessionId,
                    username: user.username
                });
            }
        }
        return onlineUsers;
    }

    getUserBySessionId(sessionId) {
        const user = this.users.get(sessionId);
        if (!user) {
            throw new UserNotFoundError('Session non trouvée');
        }
        return user;
    }

    getUserByUsername(username) {
        for (const [sessionId, user] of this.users) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return { sessionId, ...user };
            }
        }
        return null;
    }

    addMessageToConversation(conversationId, message) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new SessionError('Conversation non trouvée');
        }
        conversation.messages.push({
            ...message,
            timestamp: new Date().toISOString()
        });
    }

    findExistingConversation(user1Id, user2Id) {
        for (const [convId, conv] of this.conversations) {
            if (conv.participants.includes(user1Id) && conv.participants.includes(user2Id)) {
                return convId;
            }
        }
        return null;
    }

    getUserConversations(userId) {
        const userConversations = [];
        for (const [convId, conv] of this.conversations) {
            if (conv.participants.includes(userId)) {
                const otherUserId = conv.participants.find(id => id !== userId);
                const otherUser = this.users.get(otherUserId);
                userConversations.push({
                    id: convId,
                    with: otherUser.username,
                    lastMessage: conv.messages[conv.messages.length - 1]
                });
            }
        }
        return userConversations;
    }

    isUsernameTaken(username) {
        for (const [_, user] of this.users) {
            if (user.username.toLowerCase() === username.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
}

module.exports = { SessionManager }; 