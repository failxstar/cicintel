import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { AdminPortal } from './components/admin/AdminPortal';
import { dataService } from './services/dataService';
import { Report } from './App';

export function AdminApp() {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        // Load initial data
        setReports(dataService.getReports());

        // Subscribe to data changes
        const unsubscribe = dataService.subscribe((updatedReports) => {
            setReports(updatedReports);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
        dataService.updateReport(reportId, updates);
        toast.success('Report updated successfully');
    };

    const handleLogout = () => {
        // In a real app, this would clear session/auth
        toast.info('Logged out from admin portal');
        // Could redirect to login page
    };

    return (
        <>
            <AdminPortal
                reports={reports}
                onLogout={handleLogout}
                onUpdateReport={handleUpdateReport}
            />
            <Toaster />
        </>
    );
}
