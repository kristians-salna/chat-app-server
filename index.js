const express = require('express')();
const http = require('http');
const debounce = require('debounce');

const server = http.Server(express);
const io = require('socket.io')(server);

const logger = require('./logger/logger');

const {
    IDLE_TIMEOUT,
    SERVER_PORT
} = require('./config/config');
const {
    findUserByName,
    findUserById,
    removeUserById,
    getRandomAvatar
} = require('./utils/serverUtils');
const { constructMessage } = require('./utils/messageUtils');

const {
    RECEIVE_NEW_USER_MESSAGE,
    RECEIVE_NEW_USER_DISCONNECTION,
    RECEIVE_NEW_USER_DISCONNECTION_IDLE,
    RECEIVE_NEW_USER_DISCONNECTION_SUCCESS,
    RECEIVE_NEW_USER_CONNECTION,
    RECEIVE_NEW_USER_CONNECTION_SUCCESS,
    RECEIVE_NEW_USER_CONNECTION_LIST,
    RECEIVE_NEW_USER_CONNECTION_ERROR
} = require('./constants/exportEvents');
const {
    CONNECTION,
    DISCONNECT,
    SEND_NEW_USER_CONNECTION,
    SEND_NEW_USER_DISCONNECTION,
    SEND_NEW_USER_MESSAGE
} = require('./constants/importEvents');
const {
    INACTIVITY_DISCONNECT,
    HAS_CONNECTED,
    NAME_TAKEN,
    LEFT_CHAT,
    YOU,
} = require('./constants/messages');


const validator = require('./validator/validator');

/**
 * List of all users within the session.
 */
let userList = [];

const getUserList = () => {
    return userList;
};

/**
 * Establishes socket.io connection.
 */
io.on(CONNECTION, socket => {
    logger.info(`New ${socket.id} connection.`);
    /**
     * Validates incoming packets from the client.
     */
    validator(socket, getUserList, logger);
    /**
     * Socket listener for receiving user messages.
     */
    socket.on(SEND_NEW_USER_MESSAGE, ({ name, message }) => {
        logger.info(`${SEND_NEW_USER_MESSAGE} ${JSON.stringify({ name, message })}`);
        const user = findUserByName(name, userList);
        if (user) {
            const { avatar } = user;
            /**
             * Sending new message to all the clients.
             */
            io.emit(RECEIVE_NEW_USER_MESSAGE, {
                name,
                message,
                date: new Date().toString(),
                avatar
            });
            /**
             * Resetting debouncer due to new message.
             */
            if (user && user.idleTimer) {
                user.idleTimer();
            }
        }
    });
    /**
     * Socket listener for new user connection.
     */
    socket.on(SEND_NEW_USER_CONNECTION, ({ name }) => {
        logger.info(`${SEND_NEW_USER_CONNECTION} - ${name}`);
        /**
         * Validates if the user name doesn't already exist.
         */
        if (!findUserByName(name, userList)) {
            const avatar = getRandomAvatar(name);
            /**
             * Creates a debouncer for particular user to disconnect user on idle.
             */
            const idleTimer = debounce(() => {
                logger.info(`${name} ${INACTIVITY_DISCONNECT}`);
                /**
                 * Notify all users about the user being disconnected on idle.
                 */
                socket.broadcast.emit(RECEIVE_NEW_USER_DISCONNECTION, {
                    name,
                    message: constructMessage(name, INACTIVITY_DISCONNECT)
                });
                /**
                 * Notify particular user about idle to display message in the lobby.
                 */
                io.to(socket.id).emit(RECEIVE_NEW_USER_DISCONNECTION_IDLE, constructMessage(YOU, INACTIVITY_DISCONNECT));
                /**
                 * Emit disconnect socket event.
                 */
                socket.disconnect();
            }, IDLE_TIMEOUT);
            /**
             * Initiate the idle timer.
             */
            idleTimer();
            /**
             * User list holds all the active users relevant data.
             */
            userList.push({
                id: socket.id,
                name,
                avatar,
                idleTimer
            });
            /**
             * Notify privately connecting user about successful connection.
             */
            io.to(socket.id).emit(RECEIVE_NEW_USER_CONNECTION_SUCCESS, {
                name,
                avatar
            });
            /**
             * Notify all users about the new user connecting to the server.
             */
            socket.broadcast.emit(RECEIVE_NEW_USER_CONNECTION, {
                message: constructMessage(name, HAS_CONNECTED),
                date: new Date().toString(),
                avatar
            });
            /**
             * Notify all users about the new total list of users.
             */
            io.emit(RECEIVE_NEW_USER_CONNECTION_LIST, {
                userList
            });
        } else {
            logger.info(`${socket.id} error - ${NAME_TAKEN}`);
            /**
             * Notify client about user name already being taken.
             */
            io.to(socket.id).emit(RECEIVE_NEW_USER_CONNECTION_ERROR, NAME_TAKEN);
        }
        /**
         * Socket listener for disconnect.
         */
        socket.on(DISCONNECT, () => {
            logger.info(`${socket.id} - disconnected.`);
            const user = findUserById(socket.id, userList);
            /**
             * Clear debouncer as it's no longer relevant.
             */
            if (user && user.idleTimer && user.idleTimer.clear) {
                user.idleTimer.clear();
            }
            /**
             * Remove user from the users list.
             */
            userList = removeUserById(socket.id, userList);
            /**
             * Notify all clients with the new list.
             */
            io.emit(RECEIVE_NEW_USER_CONNECTION_LIST, {
                userList
            });
        });
        /**
         * Socket listener for forced user disconnection.
         */
        socket.on(SEND_NEW_USER_DISCONNECTION, () => {
            const user = findUserById(socket.id, userList);
            if (user) {
                const { name } = user;
                /**
                 * Notify user privately about successful disconnection.
                 */
                io.to(socket.id).emit(RECEIVE_NEW_USER_DISCONNECTION_SUCCESS);
                /**
                 * Notify users in the room about user disconnecting.
                 */
                socket.broadcast.emit(RECEIVE_NEW_USER_DISCONNECTION, {
                    name,
                    message: constructMessage(name, LEFT_CHAT)
                });
                /**
                 * Emit disconnect socket event.
                 */
                socket.disconnect();
            }
        });
    });
});

server.listen(SERVER_PORT, () => {
    logger.info('Server booted.');
});

const unboot = () => {
    logger.info('Server unboot.');
    server.close();
    io.close();
    process.exit();
};

process.on('SIGINT', unboot);
process.on('SIGTERM', unboot);