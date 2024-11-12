const chalk = require('chalk');

class ClientUI {
    showWelcome() {
        console.clear();
        console.log(chalk.blue('=== Terminal Chat ==='));
        console.log(chalk.gray('Bienvenue dans votre messagerie instantanée\n'));
    }

    showHelp() {
        console.log(chalk.yellow('\nCommandes disponibles:'));
        console.log(chalk.gray('/convs') + ' - Afficher vos conversations');
        console.log(chalk.gray('/conv <username>') + ' - Démarrer ou rejoindre une conversation');
        console.log(chalk.gray('/exit') + ' - Quitter la conversation actuelle');
        console.log(chalk.gray('/quit') + ' - Quitter l\'application\n');
    }

    showUserList(users) {
        console.log(chalk.yellow('\nUtilisateurs en ligne:'));
        users.forEach(user => {
            console.log(chalk.gray(`- ${user.username}`));
        });
        console.log('');
    }

    showNewMessage(message) {
        if (message.isNotification) {
            console.log(chalk.blue(`[NOTIFICATION] ${message.username} s'est ${message.status}`));
            return;
        }

        const isOwnMessage = message.from === this.client?.username;
        const prefix = isOwnMessage 
            ? chalk.cyan('[Vous]')
            : chalk.magenta(`[${message.from}]`);
        
        console.log(`${prefix} ${message.content}`);
    }

    showError(message) {
        console.log(chalk.red(`Erreur: ${message}`));
    }

    showSuccess(message) {
        console.log(chalk.green(message));
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            process.stdout.write(chalk.yellow(question));
            process.stdin.once('data', (data) => {
                resolve(data.toString().trim());
            });
        });
    }

    showConversationHistory(messages) {
        console.log(chalk.yellow('\n=== Historique de la conversation ==='));
        messages.forEach(msg => {
            const isOwnMessage = msg.from === this.client?.username;
            const prefix = isOwnMessage 
                ? chalk.cyan('[Vous]')
                : chalk.magenta(`[${msg.from}]`);
            console.log(`${prefix} ${msg.content}`);
        });
        console.log(chalk.yellow('================================\n'));
    }

    showConversations(conversations) {
        console.log(chalk.yellow('\nVos conversations:'));
        conversations.forEach(conv => {
            const lastMessage = conv.lastMessage 
                ? ` - Dernier message: ${conv.lastMessage.content.substring(0, 30)}...`
                : ' - Aucun message';
            console.log(chalk.gray(`- ${conv.with}${lastMessage}`));
        });
        console.log('');
    }
}

module.exports = { ClientUI }; 