import React from 'react';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { Report } from '../../App';

interface AdminDashboardProps {
    reports: Report[];
}

export function AdminDashboard({ reports }: AdminDashboardProps) {
    const stats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === 'pending').length,
        inProgress: reports.filter((r) => r.status === 'submitted').length,
        resolved: reports.filter((r) => r.status === 'resolved').length,
        highSeverity: reports.filter((r) => r.severity >= 8).length,
    };

    const cards = [
        {
            title: 'Total Reports',
            value: stats.total,
            icon: FileText,
            color: 'blue',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-900',
        },
        {
            title: 'Pending Issues',
            value: stats.pending,
            icon: Clock,
            color: 'orange',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-900',
        },
        {
            title: 'Resolved Issues',
            value: stats.resolved,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            textColor: 'text-green-900',
        },
        {
            title: 'High Severity Alerts',
            value: stats.highSeverity,
            icon: AlertTriangle,
            color: 'red',
            bgColor: 'bg-red-50',
            iconColor: 'text-red-600',
            textColor: 'text-red-900',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                                    <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                                </div>
                                <div className={`${card.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                    <div className="space-y-3">
                        {reports.slice(0, 5).map((report) => (
                            <div
                                key={report.id}
                                className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 ${report.severity >= 8 ? 'bg-red-500' :
                                    report.severity >= 5 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {report.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{report.district}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                    report.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {report.status === 'pending' ? 'Pending' :
                                        report.status === 'submitted' ? 'In Progress' :
                                            'Resolved'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Overview */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">By Department</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Public Works (Road)', count: reports.filter(r => r.type === 'road').length },
                            { name: 'Waste Management', count: reports.filter(r => r.type === 'garbage').length },
                            { name: 'Water Supply', count: reports.filter(r => r.type === 'water').length },
                            { name: 'Drainage', count: reports.filter(r => r.type === 'drainage').length },
                            { name: 'Street Lighting', count: reports.filter(r => r.type === 'streetlight').length },
                        ].map((dept) => (
                            <div key={dept.name} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{dept.name}</span>
                                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                                    {dept.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
