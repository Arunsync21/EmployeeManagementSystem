import React, { useState } from 'react';
import { Save, User, Bell, Shield, Database } from 'lucide-react';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        profile: {
            firstName: 'John',
            lastName: 'Admin',
            email: 'admin@company.com',
            phone: '+1 (555) 123-4567',
        },
        notifications: {
            emailNotifications: true,
            pushNotifications: false,
            weeklyReports: true,
            systemAlerts: true,
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: '30',
            passwordExpiry: '90',
        },
        system: {
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12',
            timezone: 'America/New_York',
            language: 'en',
        },
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'system', name: 'System', icon: Database },
    ];

    const handleSave = () => {
        // Save settings logic here
        alert('Settings saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <button onClick={handleSave} className="btn-primary flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </button>
            </div>

            <div className="flex space-x-6">
                {/* Sidebar */}
                <div className="w-64 card">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5 mr-3" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 card">
                    {activeTab === 'profile' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.profile.firstName}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, firstName: e.target.value }
                                        })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.profile.lastName}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, lastName: e.target.value }
                                        })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.profile.email}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, email: e.target.value }
                                        })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={settings.profile.phone}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            profile: { ...settings.profile, phone: e.target.value }
                                        })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                            <div className="space-y-4">
                                {Object.entries(settings.notifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {key === 'emailNotifications' && 'Receive notifications via email'}
                                                {key === 'pushNotifications' && 'Receive push notifications in browser'}
                                                {key === 'weeklyReports' && 'Get weekly summary reports'}
                                                {key === 'systemAlerts' && 'Receive system maintenance alerts'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    notifications: { ...settings.notifications, [key]: e.target.checked }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.security.twoFactorAuth}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                security: { ...settings.security, twoFactorAuth: e.target.checked }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Session Timeout (minutes)
                                    </label>
                                    <select
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            security: { ...settings.security, sessionTimeout: e.target.value }
                                        })}
                                        className="input-field max-w-xs"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password Expiry (days)
                                    </label>
                                    <select
                                        value={settings.security.passwordExpiry}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            security: { ...settings.security, passwordExpiry: e.target.value }
                                        })}
                                        className="input-field max-w-xs"
                                    >
                                        <option value="30">30 days</option>
                                        <option value="60">60 days</option>
                                        <option value="90">90 days</option>
                                        <option value="180">180 days</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-6">System Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date Format
                                    </label>
                                    <select
                                        value={settings.system.dateFormat}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            system: { ...settings.system, dateFormat: e.target.value }
                                        })}
                                        className="input-field"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time Format
                                    </label>
                                    <select
                                        value={settings.system.timeFormat}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            system: { ...settings.system, timeFormat: e.target.value }
                                        })}
                                        className="input-field"
                                    >
                                        <option value="12">12 Hour</option>
                                        <option value="24">24 Hour</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Timezone
                                    </label>
                                    <select
                                        value={settings.system.timezone}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            system: { ...settings.system, timezone: e.target.value }
                                        })}
                                        className="input-field"
                                    >
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        value={settings.system.language}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            system: { ...settings.system, language: e.target.value }
                                        })}
                                        className="input-field"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;