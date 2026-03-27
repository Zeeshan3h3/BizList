const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    previewImage: { type: String, default: '' },
    demoUrl: { type: String, default: '#' },
    emoji: { type: String, default: '🌐' },
    gradient: { type: String, default: 'from-slate-800 to-slate-900' },
    badge: { type: String, default: '' },
    price: { type: String, default: 'Free' },
    tags: [String],
    features: [String],
    isFree: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
}, { timestamps: true });

const Template = mongoose.model('Template', templateSchema);
module.exports = Template;
