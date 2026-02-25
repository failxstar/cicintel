import React from 'react';
import { LayoutDashboard, FileText, Map, Building2, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentPage: 'dashboard' | 'reports' | 'map' | 'departments' | 'settings';
    onPageChange: (page: 'dashboard' | 'reports' | 'map' | 'departments' | 'settings') => void;
    onLogout: () => void;
}

export function AdminLayout({ children, currentPage, onPageChange, onLogout }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const menuItems = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports' as const, label: 'Reports', icon: FileText },
        { id: 'map' as const, label: 'Map View', icon: Map },
        { id: 'departments' as const, label: 'Departments', icon: Building2 },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo & Toggle */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">SC</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 text-sm">Swachh Control</h1>
                                <p className="text-xs text-gray-500">Admin Portal</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="ml-auto"
                    >
                        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                title={!sidebarOpen ? item.label : undefined}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}
            >
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {menuItems.find((item) => item.id === currentPage)?.label}
                        </h2>
                        <p className="text-xs text-gray-500">Siliguri Municipal Corporation</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">admin@siliguri.gov.in</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLogout}
                            className="gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
