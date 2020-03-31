const importEvents = require('../constants/importEvents');
const validations = require('./validations');

module.exports = function (socket, getUserList, logger) {
    socket.use((packet, next) => {
        const [event, payload] = packet;
        /** Finds a validation based on the incoming packet event name. */
        const validationMethod = validations[Object.values(importEvents).find((_event) => _event === event)];
        if (validationMethod) {
            if (validationMethod(payload, getUserList(), socket)) {
                return next();
            } else {
                logger.info(`Validation error - ${event}`);
                return next(new Error());
            }
        }
        return next();
    });
};
