'use strict';

const Joi = require('joi');

// POST /api/users/sync
const syncUserSchema = Joi.object({
    clerkId: Joi.string().trim().max(100).required(),
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required(),
    username: Joi.string().trim().max(50).optional(),
    firstName: Joi.string().trim().max(50).optional(),
    lastName: Joi.string().trim().max(50).optional()
});

// POST /api/users/profile
const updateProfileSchema = Joi.object({
    clerkId: Joi.string().trim().required(),
    businessName: Joi.string().trim().max(200).optional(),
    businessPhoto: Joi.string().uri().optional()
});

// POST /api/search-businesses
const searchBusinessesSchema = Joi.object({
    businessName: Joi.string().trim().min(2).max(200).required(),
    area: Joi.string().trim().min(2).max(200).required()
});

// POST /api/audit
const runAuditSchema = Joi.object({
    placeUrl: Joi.string().uri({ scheme: ['http', 'https'] }).optional(),
    businessName: Joi.string().trim().min(2).max(200).optional(),
    area: Joi.string().trim().min(2).max(200).optional(),
    forceReaudit: Joi.boolean().optional().default(false),
    mode: Joi.string().valid('business', 'pro').optional().default('business')
}).or('placeUrl', 'businessName');

// POST /api/bookings
const createBookingSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({ 'string.pattern.base': 'Phone must be 10–15 digits, numbers only' }),
    email: Joi.string().email({ tlds: { allow: false } }).optional(),
    businessName: Joi.string().trim().max(200).required(),
    area: Joi.string().trim().max(200).optional(),
    auditId: Joi.string().optional()
});

// POST /api/autocomplete
const autocompleteSchema = Joi.object({
    query: Joi.string().trim().min(2).max(200).required(),
    area: Joi.string().trim().max(200).optional()
});

// POST /api/suggestions
const suggestionsSchema = Joi.object({
    businessName: Joi.string().trim().max(200).required(),
    totalScore: Joi.number().min(0).max(100).required(),
    brandClass: Joi.string().trim().max(100).required(),
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