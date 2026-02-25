/**
 * Enhanced Admin Dashboard Component
 * Real-time metrics, statistics, and analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Report } from '../../App';
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    MapPin,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface EnhancedAdminDashboardProps {
    reports: Report[];
}

interface DashboardStats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    avgResolutionTime: number;
    trendsToday: number;
    departmentDistribution: Record<string, number>;
}

export function EnhancedAdminDashboard({ reports }: EnhancedAdminDashboardProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Calculate statistics
    const calculateStats = useMemo((): DashboardStats => {
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const inProgress = reports.filter(r => r.status === 'submitted').length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const highPriority = reports.filter(r => r.priority === 'high').length;

        // Calculate average resolution time (mock for now)
        const avgResolutionTime = 24; // hours

        // Reports submitted today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const trendsToday = reports.filter(r => r.timestamp >= today).length;

        // Department distribution
        const departmentDistribution: Record<string, number> = {};
        reports.forEach(r => {
            const dept = r.type || 'other';
            departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
        });

        return {
            total,
            pending,
            inProgress,
            resolved,
            highPriority,
            avgResolutionTime,
            trendsToday,
            departmentDistribution
        };
    }, [reports]);

    useEffect(() => {
        setStats(calculateStats);
    }, [calculateStats]);

    if (!stats) return <div>Loading...</div>;

    const resolvedPercentage = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : '0';

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Real-time analytics and system overview</p>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            +{stats.trendsToday} today
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting review
                        </p>
                    </CardContent>
                </Card>

                {/* High Priority */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires immediate attention
                        </p>
                    </CardContent>
                </Card>

                {/* Resolved */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                        <p className="text-xs text-green-600 font-medium">
                            {resolvedPercentage}% resolution rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Avg. Resolution Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgResolutionTime}h</div>
                        <p className="text-xs text-muted-foreground">
                            Target: 24-48h
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Active Today
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.trendsToday}</div>
                        <p className="text-xs text-muted-foreground">
                            New reports submitted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently being addressed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Department Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Department Workload</CardTitle>
                    <CardDescription>Report distribution across departments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(stats.departmentDistribution)
                            .sort(([, a], [, b]) => b - a)
                            .map(([dept, count]) => {
                                const percentage = ((count / stats.total) * 100).toFixed(1);
                                return (
                                    <div key={dept} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium capitalize">{dept}</span>
                                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Latest 5 submitted reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.slice(0, 5).map((report) => (
                            <div key={report.id} className="flex items-start gap-4 border-b pb-3 last:border-0">
                                <div className={`mt-1 w-2 h-2 rounded-full ${report.status === 'resolved'
                                    ? 'bg-green-500'
                                    : report.status === 'submitted'
                                        ? 'bg-blue-500'
                                        : 'bg-yellow-500'
                                    }`} />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{report.title}</p>
                                    <p className="text-xs text-muted-foreground">{report.district} • {report.type}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(report.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
