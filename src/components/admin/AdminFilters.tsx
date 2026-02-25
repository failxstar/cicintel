import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AdminFiltersProps {
    onFilterChange: (filters: { severity?: number; district?: string; status?: string }) => void;
}

export function AdminFilters({ onFilterChange }: AdminFiltersProps) {
    const [severity, setSeverity] = useState<string>('');
    const [district, setDistrict] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = () => {
        onFilterChange({
            severity: severity ? parseInt(severity) : undefined,
            district: district || undefined,
            status: status || undefined,
        });
    };

    const clearFilters = () => {
        setSeverity('');
        setDistrict('');
        setStatus('');
        onFilterChange({});
    };

    React.useEffect(() => {
        applyFilters();
    }, [severity, district, status]);

    const hasActiveFilters = severity || district || status;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-3">
                <Button
                    variant={hasActiveFilters ? 'default' : 'outline'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                            {[severity, district, status].filter(Boolean).length}
                        </span>
                    )}
                </Button>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                        <X className="w-4 h-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                    {/* Severity Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Severity
                        </label>
                        <Select value={severity} onValueChange={setSeverity}>
                            <SelectTrigger>
                                <SelectValue placeholder="All severities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Severities</SelectItem>
                                <SelectItem value="8">High (8-10)</SelectItem>
                                <SelectItem value="5">Medium (5-7)</SelectItem>
                                <SelectItem value="1">Low (1-4)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* District Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            District
                        </label>
                        <Select value={district} onValueChange={setDistrict}>
                            <SelectTrigger>
                                <SelectValue placeholder="All districts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Districts</SelectItem>
                                <SelectItem value="Siliguri">Siliguri</SelectItem>
                                <SelectItem value="Darjeeling">Darjeeling</SelectItem>
                                <SelectItem value="Kalimpong">Kalimpong</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
}
