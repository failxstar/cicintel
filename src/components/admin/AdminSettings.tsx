import React from 'react';
import { User, Bell, Shield, Database } from 'lucide-react';

export function AdminSettings() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                <p className="text-gray-600">Manage your admin portal preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name</span>
                            <span className="font-medium">Admin User</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="font-medium">admin@siliguri.gov.in</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Role</span>
                            <span className="font-medium">Super Admin</span>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Bell className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Email Alerts</span>
                            <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">High Priority Issues</span>
                            <div className="w-10 h-6 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Weekly Reports</span>
                            <div className="w-10 h-6 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Security</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Two-Factor Auth</span>
                            <span className="font-medium text-green-600">Enabled</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Login</span>
                            <span className="font-medium">2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Session Timeout</span>
                            <span className="font-medium">30 minutes</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Database className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">System Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Version</span>
                            <span className="font-medium">v1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Database Status</span>
                            <span className="font-medium text-green-600">Connected</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Backup</span>
                            <span className="font-medium">1 hour ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
