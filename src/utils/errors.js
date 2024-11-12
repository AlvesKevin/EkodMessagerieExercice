class UserNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UserNotFoundError';
    }
}

class SessionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SessionError';
    }
}

module.exports = {
    UserNotFoundError,
    SessionError
}; 