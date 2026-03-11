const Joi = require('joi');

//Post /api/users/sync
const syncUserSchema = Joi.object({
    clerkId: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional()
});

//POST /api/users/profile

const updateProfileSchema = Joi.object(
    {
        clearId: Joi.string().required(),
        buissnessName: Joi.string().max(200).optional(),
        businessPhoto: Joi.string().uri().optional(),


    }
);

const searchBusinessesSchema = Joi.object({
    businessName: Joi.string().min(2).max(200).required(),
    area: Joi.string().min(2).max(200).required()
});




// POST /api/audit
const runAuditSchema = Joi.object({
    placeUrl: Joi.string().uri().optional(),
    businessName: Joi.string().min(2).optional(),
    area: Joi.string().min(2).optional(),
    forceReaudit: Joi.boolean().optional().default(false),
    mode: Joi.string().valid('business', 'pro').optional().default('business')
}).or('placeUrl', 'businessName'); // At least one must be provided

// POST /api/bookings
const createBookingSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required()
        .messages({ 'string.pattern.base': 'Phone must be 10-15 digits' }),
    email: Joi.string().email().optional(),
    businessName: Joi.string().required(),
    area: Joi.string().optional(),
    auditId: Joi.string().optional()
});
// POST /api/autocomplete
const autocompleteSchema = Joi.object({
    query: Joi.string().min(2).required(),
    area: Joi.string().optional()
});
// POST /api/suggestions
const suggestionsSchema = Joi.object({
    businessName: Joi.string().required(),
    totalScore: Joi.number().required(),
    brandClass: Joi.string().required(),
    brandIntelligence: Joi.object().optional(),
    performanceBreakdown: Joi.object().optional()
});
module.exports = {
    syncUserSchema,
    updateProfileSchema,
    searchBusinessesSchema,
    runAuditSchema,
    createBookingSchema,
    autocompleteSchema,
    suggestionsSchema
};