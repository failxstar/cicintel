import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Report } from '../../App';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

interface ReportDetailPanelProps {
    report: Report;
    onClose: () => void;
    onUpdate: (reportId: string, updates: Partial<Report>) => void;
}

export function ReportDetailPanel({ report, onClose, onUpdate }: ReportDetailPanelProps) {
    const [status, setStatus] = useState(report.status);
    const [department, setDepartment] = useState(getDepartmentFromType(report.type));
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(report.priority || 'medium');
    const [remarks, setRemarks] = useState('');

    function getDepartmentFromType(type: string): string {
        const mapping: Record<string, string> = {
            road: 'PWD',
            garbage: 'Waste Management',
            water: 'Water Supply',
            drainage: 'Drainage',
            streetlight: 'Electrical',
        };
        return mapping[type] || 'Municipal Corp';
    }

    const handleSave = () => {
        onUpdate(report.id, { status, priority });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
            <div
                className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                        <p className="text-sm text-gray-500">ID: #{report.id}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image */}
                    <div className="relative w-full h-64 overflow-hidden rounded-xl bg-gray-100">
                        <img
                            src={report.imageUrl}
                            alt={report.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                        <p className="text-gray-600">{report.description}</p>
                    </div>

                    {/* Location & AI Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
                            <p className="text-sm font-semibold text-gray-900">{report.ward}</p>
                            <p className="text-xs text-gray-600">{report.street}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">AI Classification</p>
                            <p className="text-sm font-semibold text-gray-900">{report.aiTag}</p>
                            <p className="text-xs text-gray-600">{report.aiConfidence}% Confidence</p>
                        </div>
                    </div>

                    {/* Severity & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Severity</p>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${report.severity >= 8 ? 'bg-red-500' :
                                        report.severity >= 5 ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}
                                />
                                <span className="text-lg font-bold text-gray-900">{report.severity}/10</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Upvotes</p>
                            <p className="text-lg font-bold text-gray-900">{report.upvotes}</p>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Admin Controls */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Admin Controls</h4>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as Report['status'])}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="submitted">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assigned Department
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="PWD">Public Works Department</option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Water Supply">Water Supply</option>
                                <option value="Drainage">Drainage</option>
                                <option value="Electrical">Electrical</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {(['high', 'medium', 'low'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium text-sm transition-all ${priority === p
                                            ? p === 'high'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : p === 'medium'
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                    : 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Remarks
                            </label>
                            <Textarea
                                placeholder="Add notes or action taken..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3">
                        <Button onClick={handleSave} className="flex-1 gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>

                    {/* Comments Section */}
                    {report.comments.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                                Citizen Comments ({report.comments.length})
                            </h4>
                            <div className="space-y-3">
                                {report.comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
