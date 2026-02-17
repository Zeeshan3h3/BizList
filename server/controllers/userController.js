const User = require('../models/User');

/**
 * Syncs user data from Clerk to MongoDB
 * Upserts the user record based on clerkId
 */
exports.syncUser = async (req, res) => {
    try {
        const { clerkId, email, username, firstName, lastName } = req.body;

        if (!clerkId || !email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Upsert user (Update if exists, Insert if new)
        const user = await User.findOneAndUpdate(
            { clerkId },
            {
                email,
                username,
                firstName,
                lastName,
                $setOnInsert: { createdAt: Date.now() }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            user,
            onboardingCompleted: user.onboardingCompleted
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ success: false, message: 'Server error syncing user' });
    }
};

/**
 * Updates user profile (Business Name, Photo)
 * Sets onboardingCompleted to true
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { clerkId, businessName, businessPhoto } = req.body;

        if (!clerkId) {
            return res.status(400).json({ success: false, message: 'Missing Clerk ID' });
        }

        const user = await User.findOneAndUpdate(
            { clerkId },
            {
                businessName,
                businessPhoto,
                onboardingCompleted: true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};
