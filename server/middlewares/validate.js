const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,       // Show ALL errors, not just first
            stripUnknown: true       // Remove unexpected fields (security)
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                message: error.details.map(d => d.message).join(', ')
            });
        }

        req.body = value; // Replace with sanitized data
        next();
    };
};

module.exports = validate;
