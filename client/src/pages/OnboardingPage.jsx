import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Image as ImageIcon, ArrowRight, CheckCircle } from 'lucide-react';

const OnboardingPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        businessPhoto: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [fileState, setFileState] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (!user) {
                throw new Error("User not authenticated");
            }

            // 1. Sync to Backend (MongoDB)
            // We still send the Base64 to backend for our own records/fallback
            await axios.post('/api/users/profile', {
                clerkId: user.id,
                businessName: formData.businessName,
                businessPhoto: formData.businessPhoto // Base64
            });

            // 2. Update Clerk Profile (Client-side)
            // We use publicMetadata for Business Name so we don't lose the Founder's Name (firstName/lastName)
            console.log('Updating Clerk metadata to:', formData.businessName);
            await user.update({
                unsafeMetadata: {
                    businessName: formData.businessName
                }
            });
            // Note: We don't overwrite firstName/lastName anymore, so those stay as "MD Zeeshan" (Founder)

            // 3. Update Clerk Avatar
            if (fileState) {
                console.log('Updating Clerk avatar...');
                await user.setProfileImage({ file: fileState });
            }

            // Force refresh user data
            await user.reload();
            console.log('Clerk profile updated successfully!');

            // Redirect to home on success
            navigate('/');
        } catch (err) {
            console.error('Error during profile update:', err);
            setError(err.response?.data?.message || err.message || 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full inline-flex mb-4">
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.firstName}!</h1>
                    <p className="text-slate-500 mt-2">Let's set up your business profile.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Business Name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. Acme Corp"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Business Photo
                        </label>
                        <div className="space-y-4">
                            {/* Image Preview */}
                            {formData.businessPhoto && (
                                <div className="relative w-32 h-32 mx-auto">
                                    <img
                                        src={formData.businessPhoto}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, businessPhoto: '' })}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            )}

                            {/* File Input */}
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition-colors text-center cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                                                setError("File size too large (Max 2MB)");
                                                return;
                                            }
                                            // Save raw file for Clerk Upload
                                            setFileState(file);

                                            // Read as Base64 for Preview & MongoDB
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, businessPhoto: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500 group-hover:text-blue-600">
                                    <ImageIcon className="w-8 h-8" />
                                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs text-slate-400">SVG, PNG, JPG (max 2MB)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span>Saving...</span>
                        ) : (
                            <>
                                <span>Complete Setup</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;
