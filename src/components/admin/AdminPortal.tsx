import React, { useState } from 'react';
import { Report } from '../../App';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { EnhancedAdminDashboard } from './EnhancedAdminDashboard';
import { AdminReportsTable } from './AdminReportsTable';
import { AdminMapView } from './AdminMapView';
import { DepartmentsPage } from './DepartmentsPage';
import { AdminSettings } from './AdminSettings';
import { ReportDetailPanel } from './ReportDetailPanel';
import { AdminFilters } from './AdminFilters';

interface AdminPortalProps {
    reports: Report[];
    onLogout: () => void;
    onUpdateReport: (reportId: string, updates: Partial<Report>) => void;
}

export function AdminPortal({ reports, onLogout, onUpdateReport }: AdminPortalProps) {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'reports' | 'map' | 'departments' | 'settings'>('dashboard');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filters, setFilters] = useState<{ severity?: number; district?: string; status?: string }>({});

    return (
        <>
            <AdminLayout
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onLogout={onLogout}
            >
                {currentPage === 'dashboard' && <EnhancedAdminDashboard reports={reports} />}

                {currentPage === 'reports' && (
                    <div className="space-y-6">
                        <AdminFilters onFilterChange={setFilters} />
                        <AdminReportsTable
                            reports={reports}
                            onSelectReport={setSelectedReport}
                            filters={filters}
                        />
                    </div>
                )}

                {currentPage === 'map' && (
                    <AdminMapView
                        reports={reports}
                        onSelectReport={setSelectedReport}
                    />
                )}

                {currentPage === 'departments' && <DepartmentsPage />}

                {currentPage === 'settings' && <AdminSettings />}
            </AdminLayout>

            {selectedReport && (
                <ReportDetailPanel
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onUpdate={onUpdateReport}
                />
            )}
        </>
    );
}
