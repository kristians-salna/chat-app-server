const { getProperty } = require('./generalUtils');

/**
 * Finds user from the userList by name
 *
 * @param {Object | string} payload.
 * @param {Array} userList.
 *
 * @return {Object}.
 */
const findUserByName = (payload, userList) => (
    userList && userList.find((user) => user.name === getProperty(payload, 'name'))
);
/**
 * Finds user from the userList by id
 *
 * @param {Object | string} payload.
 * @param {Array} userList.
 *
 * @return {Object}.
 */
const findUserById = (payload, userList) => (
    userList && userList.find((user) => user.id === getProperty(payload, 'id'))
);
/**
 * Filters and returns new array without the object containing given id.
 *
 * @param {string} id.
 * @param {Array} userList.
 *
 * @return {Array}.
 */
const removeUserById = (id, userList) => (
    userList && userList.filter((user) => user.id !== id)
);
/**
 * Generates random avatar for the user.
 *
 * @param {string} name.
 *
 * @return {string}.
 */
const getRandomAvatar = (name = 'random') => (
    `https://api.adorable.io/avatars/175/${name}.png`
);

module.exports = {
    findUserByName,
    findUserById,
    removeUserById,
    getRandomAvatar
};