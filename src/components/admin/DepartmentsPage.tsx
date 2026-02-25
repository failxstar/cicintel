import React from 'react';
import { Building2, Users, FileCheck, Settings } from 'lucide-react';

export function DepartmentsPage() {
    const departments = [
        {
            name: 'Public Works Department',
            code: 'PWD',
            head: 'Rajesh Kumar Singh',
            staff: 45,
            activeReports: 12,
            resolved: 38,
            icon: Building2,
            color: 'blue',
        },
        {
            name: 'Waste Management Department',
            code: 'WMD',
            head: 'Priya Sharma',
            staff: 32,
            activeReports: 8,
            resolved: 45,
            icon: FileCheck,
            color: 'green',
        },
        {
            name: 'Water Supply Department',
            code: 'WSD',
            head: 'Amit Gupta',
            staff: 28,
            activeReports: 15,
            resolved: 22,
            icon: Settings,
            color: 'cyan',
        },
        {
            name: 'Drainage Department',
            code: 'DD',
            head: 'Sita Devi',
            staff: 20,
            activeReports: 6,
            resolved: 18,
            icon: FileCheck,
            color: 'purple',
        },
        {
            name: 'Electrical Department',
            code: 'ED',
            head: 'Ravi Tiwari',
            staff: 24,
            activeReports: 4,
            resolved: 31,
            icon: Settings,
            color: 'yellow',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Departments</h2>
                <p className="text-gray-600">Municipal Corporation Department Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                        <div
                            key={dept.code}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{dept.name}</p>
                                    <p className="text-sm text-gray-500">{dept.code}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-${dept.color}-50`}>
                                    <Icon className={`w-6 h-6 text-${dept.color}-600`} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Department Head</span>
                                    <span className="font-medium text-gray-900">{dept.head}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Staff Members</span>
                                    <span className="font-medium text-gray-900">{dept.staff}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Active Reports</span>
                                    <span className="font-medium text-orange-600">{dept.activeReports}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Resolved</span>
                                    <span className="font-medium text-green-600">{dept.resolved}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
