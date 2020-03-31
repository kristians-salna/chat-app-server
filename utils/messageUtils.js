module.exports = {
    /**
     * Messages sent to the client can be formatted here.
     *
     * @param {string} target. Usually a user name.
     * @param {string} message. A message.
     *
     * @return {String} Formatted message.
     */
    constructMessage: (target, message) => `${target} ${message}`
};