import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserSync = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const syncUser = async () => {
            if (isLoaded && user) {
                try {
                    // Prepare user data
                    const userData = {
                        clerkId: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    };

                    // Call backend sync
                    const response = await axios.post('/api/users/sync', userData);

                    // Check onboarding status
                    if (response.data.success && response.data.onboardingCompleted === false) {
                        // Redirect to onboarding if not completed
                        // But verify we aren't ALREADY on the onboarding page to avoid loops
                        if (window.location.pathname !== '/onboarding') {
                            console.log('Redirecting to Onboarding...');
                            navigate('/onboarding');
                        }
                    }
                } catch (error) {
                    console.error('Error syncing user:', error);
                }
            }
        };

        syncUser();
    }, [isLoaded, user, navigate]);

    return null; // This component renders nothing
};

export default UserSync;
