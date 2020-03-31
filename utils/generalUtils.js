/**
 * Validates an object.
 *
 * @param {Object} object. An object.
 *
 * @return {Boolean} Indicating whether passed argument is an Object.
 */
const isObject = object => object && object.constructor === Object;
/**
 * Validates a string.
 *
 * @param {String} string. A string.
 *
 * @return {Boolean} Indicating whether passed argument is a String.
 */
const isString = string => typeof string === 'string' || string instanceof String;
/**
 * Retrieves the willing value from either object or a string.
 *
 * @param {String | Object} payload.
 * @param {String} property.
 *
 * @return {String}
 */
const getProperty = (payload, property) => {
    let _property = null;
    if (isObject(payload)) {
        if (Object.prototype.hasOwnProperty.call(payload, property)) {
            _property = payload[property];
        } else {
            return _property
        }
    } else if (isString(payload)) {
        _property = payload;
    }
    return _property
};

module.exports = {
    isObject,
    isString,
    getProperty
};