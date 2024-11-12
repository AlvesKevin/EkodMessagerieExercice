# Terminal Chat

Une application de messagerie instantanée en ligne de commande, permettant aux utilisateurs de communiquer en temps réel via le terminal.

## 🚀 Fonctionnalités

- 💬 Messagerie instantanée en temps réel
- 👥 Gestion des utilisateurs connectés
- 🔒 Sessions uniques par utilisateur
- 📝 Conversations privées
- 🔔 Notifications de connexion/déconnexion
- 📜 Historique des conversations
- 🎨 Interface colorée et intuitive

## 📋 Prérequis

- Node.js (v12 ou supérieur)
- npm (Node Package Manager)

## 🛠️ Installation

1. Clonez le repository :
   ```bash
   git clone [url-du-repo]
   cd terminal-chat
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

## 🚀 Démarrage

1. Démarrez le serveur :
   ```bash
   node src/server/server.js
   ```

2. Dans un autre terminal, lancez le client :
   ```bash
   node src/client/client.js
   ```

## 📖 Commandes disponibles

- `/convs` - Afficher la liste de vos conversations
- `/conv <username>` - Démarrer ou rejoindre une conversation
- `/msg <username> <message>` - Envoyer un message privé
- `/users` - Afficher la liste des utilisateurs en ligne
- `/exit` - Quitter la conversation actuelle
- `/quit` - Quitter l'application
- `/help` - Afficher l'aide

## 🏗️ Structure du projet
src/
├── client/
│ ├── client.js # Client principal
│ ├── commands.js # Gestionnaire de commandes
│ └── ui.js # Interface utilisateur
├── server/
│ ├── server.js # Serveur WebSocket
│ ├── websocket.js # Gestionnaire WebSocket
│ └── sessionManager.js # Gestion des sessions
└── utils/
├── errors.js # Classes d'erreurs
└── logger.js # Configuration des logs


## 🔧 Technologies utilisées

- WebSocket (ws)
- Winston (logging)
- Chalk (coloration terminal)
- UUID (génération d'identifiants)
- Readline (interface terminal)

## 📝 Logs

Les logs sont générés dans :
- `error.log` - Pour les erreurs
- `combined.log` - Pour tous les logs

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT