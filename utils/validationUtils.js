module.exports = {
    /**
     * Validates incoming payload object against the schema.
     *
     * @param {Object} payload.
     * @param {Object} schema.
     *
     * @return {Boolean}.
     */
    isValidPayload: (payload, schema) => {
        try {
            return (
                payload && (
                    Object.entries(schema).every(([key, value]) => (
                        typeof payload[key] === value.toLowerCase()
                    ))
                )
            )
        } catch (e) {
            return false
        }
    }
};