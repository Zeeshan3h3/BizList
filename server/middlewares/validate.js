'use strict';

/**
 * Express middleware factory that validates req.body against a Joi schema.
 * Attaches the sanitized value back to req.body so downstream handlers get clean data.
 *
 * @param {import('joi').Schema} schema
 */
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,   // surface all validation errors at once
        stripUnknown: true   // drop fields not in the schema (security)
    });

    if (error) {
        const messages = error.details.map((d) => d.message).join('; ');
        return res.status(400).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message: messages
        });
    }

    req.body = value;
    next();
};

module.exports = validate;
