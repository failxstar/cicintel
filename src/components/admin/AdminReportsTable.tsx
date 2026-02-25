import React from 'react';
import { MoreVertical, AlertCircle } from 'lucide-react';
import { Report } from '../../App';
import { Button } from '../ui/button';

interface AdminReportsTableProps {
    reports: Report[];
    onSelectReport: (report: Report) => void;
    filters: {
        severity?: number;
        district?: string;
        status?: string;
    };
}

export function AdminReportsTable({ reports, onSelectReport, filters }: AdminReportsTableProps) {
    // Apply filters
    const filteredReports = reports.filter((report) => {
        if (filters.severity && report.severity < filters.severity) return false;
        if (filters.district && report.district !== filters.district) return false;
        if (filters.status) {
            const statusMap: Record<string, Report['status']> = {
                'Pending': 'pending',
                'In Progress': 'submitted',
                'Resolved': 'resolved',
            };
            if (report.status !== statusMap[filters.status]) return false;
        }
        return true;
    });

    const getStatusBadge = (status: Report['status']) => {
        const styles = {
            pending: 'bg-orange-100 text-orange-700 border-orange-200',
            submitted: 'bg-blue-100 text-blue-700 border-blue-200',
            resolved: 'bg-green-100 text-green-700 border-green-200',
            acknowledged: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        const labels = {
            pending: 'Pending',
            submitted: 'In Progress',
            resolved: 'Resolved',
            acknowledged: 'Acknowledged',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getSeverityIndicator = (severity: number) => {
        const color = severity >= 8 ? 'bg-red-500' : severity >= 5 ? 'bg-yellow-500' : 'bg-green-500';
        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm font-medium text-gray-900">{severity}/10</span>
            </div>
        );
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">All Reports ({filteredReports.length})</h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Issue Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Severity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500">No reports match your filters</p>
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={report.imageUrl}
                                                    alt={report.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {report.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {report.aiTag} • {report.aiConfidence}% confidence
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{report.ward}</div>
                                        <div className="text-xs text-gray-500">{report.street}</div>
                                    </td>
                                    <td className="px-6 py-4">{getSeverityIndicator(report.severity)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(report.timestamp)}</td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onSelectReport(report)}
                                            className="gap-2"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
