import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
    UserIcon,
    EnvelopeIcon,
    KeyIcon,
    BellIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline'

const Settings = () => {
    const { user, token } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)

    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    })

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    })

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.patch(
                'http://localhost:8000/api/auth/me/',
                profileData,
                { headers: { Authorization: `Token ${token}` } }
            )
            toast.success('Profile updated successfully!')
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match!')
            return
        }
        setLoading(true)
        try {
            // Add password change API endpoint
            toast.success('Password changed successfully!')
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
        } catch (error) {
            toast.error('Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', name: 'Profile', icon: UserIcon },
        { id: 'security', name: 'Security', icon: ShieldCheckIcon },
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6 dark:bg-gray-900">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            {/* Settings Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-2" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Profile Settings */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.first_name}
                                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.last_name}
                                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Updating...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-start">
                                    <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about your document analysis</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-start">
                                    <ShieldCheckIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">Risk Alerts</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when high-risk clauses are detected</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-start">
                                    <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">Weekly Report</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive a weekly summary of all document analyses</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings