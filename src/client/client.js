const WebSocket = require('ws');
const readline = require('readline');
const { ClientUI } = require('./ui');
const { CommandHandler } = require('./commands');
const { createLogger } = require('../utils/logger');
const chalk = require('chalk');

const logger = createLogger('Client');

class ChatClient {
    constructor() {
        this.ws = null;
        this.sessionId = null;
        this.username = null;
        this.currentConversation = null;
        
        this.ui = new ClientUI();
        this.ui.client = this;
        this.commandHandler = new CommandHandler(this);
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });
    }

    async start() {
        try {
            this.ws = new WebSocket('ws://localhost:3000');
            this.setupWebSocket();
            await this.ui.showWelcome();
            await this.login();
        } catch (error) {
            logger.error('Failed to start client:', error);
            process.exit(1);
        }
    }

    setupWebSocket() {
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleServerMessage(message);
            } catch (error) {
                logger.error('Error handling server message:', error);
            }
        });

        this.ws.on('close', () => {
            this.ui.showError('Déconnecté du serveur');
            process.exit(0);
        });
    }

    async login() {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow('Entrez votre pseudo: '), (username) => {
                this.ws.send(JSON.stringify({
                    type: 'login',
                    username
                }));
                resolve();
            });
        });
    }

    startInputLoop() {
        this.rl.removeAllListeners('line');
        
        this.rl.on('line', (input) => {
            if (input.trim() !== '') {
                this.commandHandler.handleCommand(input.trim());
            }
            this.rl.prompt();
        });

        this.rl.prompt();
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'login_error':
                this.ui.showError(message.message);
                this.login();
                break;
                
            case 'login_success':
                this.sessionId = message.sessionId;
                this.username = message.username;
                this.ui.showSuccess(message.message);
                this.ui.showHelp();
                this.startInputLoop();
                break;
                
            case 'user_list':
                this.ui.showUserList(message.users);
                this.rl.prompt();
                break;
                
            case 'new_message':
                console.log();
                this.ui.showNewMessage(message);
                this.rl.prompt();
                break;
                
            case 'error':
                this.ui.showError(message.message);
                break;
                
            case 'message_sent':
                break;
                
            case 'conversation_started':
                this.currentConversation = message.with;
                this.ui.showSuccess(`Conversation démarrée avec ${message.with}`);
                break;
                
            case 'conversation_history':
                this.ui.showConversationHistory(message.messages);
                break;
                
            case 'conversations_list':
                this.ui.showConversations(message.conversations);
                break;
                
            case 'conversation_exists':
                this.currentConversation = message.with;
                this.ui.showSuccess(`Conversation existante rejointe avec ${message.with}`);
                break;
                
            case 'user_status':
                if (!this.currentConversation) {
                    this.ui.showNewMessage(message);
                }
                break;
                
            default:
                if (message.type !== 'message_sent') {
                    this.rl.prompt();
                }
        }
    }
}

const client = new ChatClient();
client.start();