const importEvents = require('../constants/importEvents');
const { isValidPayload } = require('../utils/validationUtils');
const { findUserByName } = require('../utils/serverUtils');
const { MESSAGE_SCHEMA, USER_CONNECTION_SCHEMA } = require('../constants/schemas');

module.exports = {
    [importEvents.SEND_NEW_USER_MESSAGE]: (payload, userList) => {
        return findUserByName(payload, userList) && isValidPayload(payload, MESSAGE_SCHEMA)
    },
    [importEvents.SEND_NEW_USER_CONNECTION]: (payload) => {
        return isValidPayload(payload, USER_CONNECTION_SCHEMA)
    }
};