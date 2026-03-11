const mongoose = require('mongoose');
const Audit = require('./models/Audit');
require('dotenv').config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const audits = await Audit.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(1).lean();
        if (audits.length) {
            console.log("Business Name:", audits[0].businessName);
            console.log("Recent Reviews:", audits[0].scrapedData.recentReviewsCount);
            console.log("Latest Date:", audits[0].scrapedData.latestReviewDate);
            console.log("Total Reviews:", audits[0].scrapedData.reviewCount);
        } else {
            console.log("No completed audits found.");
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
