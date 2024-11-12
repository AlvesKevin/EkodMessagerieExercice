const { createLogger } = require('../utils/logger');

const logger = createLogger('CommandHandler');

class CommandHandler {
    constructor(client) {
        this.client = client;
    }

    handleCommand(input) {
        if (!input.startsWith('/')) {
            this.handleChatMessage(input);
            return;
        }

        const [command, ...args] = input.slice(1).split(' ');

        switch (command) {
            case 'users':
                this.sendToServer({
                    type: 'get_users'
                });
                break;

            case 'msg':
                if (args.length < 2) {
                    this.client.ui.showError('Usage: /msg <username> <message>');
                    return;
                }
                const recipient = args[0];
                const messageContent = args.slice(1).join(' ');
                this.sendToServer({
                    type: 'message',
                    to: recipient,
                    content: messageContent
                });
                break;

            case 'convs':
                this.sendToServer({
                    type: 'get_conversations'
                });
                break;

            case 'conv':
                if (args.length !== 1) {
                    this.client.ui.showError('Usage: /conv <username>');
                    return;
                }
                this.client.ui.showSuccess(`Tentative de connexion avec ${args[0]}...`);
                this.sendToServer({
                    type: 'start_conversation',
                    with: args[0]
                });
                break;

            case 'exit':
                this.client.currentConversation = null;
                this.client.ui.showSuccess('Conversation terminée');
                break;

            case 'quit':
                process.exit(0);
                break;

            case 'help':
                this.client.ui.showHelp();
                break;

            default:
                this.client.ui.showError('Commande inconnue. Tapez /help pour voir les commandes disponibles.');
        }
    }

    handleChatMessage(message) {
        if (!this.client.currentConversation) {
            this.client.ui.showError('Vous n\'êtes pas dans une conversation. Utilisez /conv <username> pour en démarrer une.');
            return;
        }

        this.sendToServer({
            type: 'message',
            to: this.client.currentConversation,
            content: message,
            from: this.client.username
        });

        this.client.ui.showNewMessage({
            from: this.client.username,
            content: message
        });
    }

    sendToServer(data) {
        try {
            data.sessionId = this.client.sessionId;
            this.client.ws.send(JSON.stringify(data));
        } catch (error) {
            logger.error('Error sending message to server:', error);
            this.client.ui.showError('Erreur lors de l\'envoi du message');
        }
    }
}

module.exports = { CommandHandler }; 