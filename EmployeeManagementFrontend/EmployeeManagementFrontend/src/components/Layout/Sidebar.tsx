import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    UserPlus,
    BarChart3,
    Calendar,
    Building2,
    FileText,
    Settings,
    LogOut,
    UsersIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';

const Sidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const { isCollapsed } = useSidebar();

    // Helper function to convert numeric role to role name
    const getRoleName = (role: any): string => {
        if (typeof role === 'string') return role;

        // Convert numeric role to string
        switch (Number(role)) {
            case 0: return 'Admin';
            case 1: return 'HR';
            case 2: return 'Manager';
            case 3: return 'Employee';
            default: return 'Employee';
        }
    };

    // Define all navigation items with role permissions
    const allNavigationItems = [
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        { name: 'Employees', href: '/employees', icon: Users, roles: ['Admin', 'HR', 'Manager'] },
        { name: 'Add Employee', href: '/employees/add', icon: UserPlus, roles: ['Admin', 'HR'] },
        { name: 'Departments', href: '/departments', icon: Building2, roles: ['Admin', 'HR', 'Manager'] },
        { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        { name: 'Reports', href: '/reports', icon: FileText, roles: ['Admin', 'HR', 'Manager', 'Employee'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: [] },
    ];

    // Get the current user's role name
    const userRoleName = getRoleName(user?.role) ?? null;

    // Filter navigation items based on user role
    const navigation = allNavigationItems.filter(item =>
        userRoleName && item.roles.includes(userRoleName)
    );

    return (
        <div className={`flex flex-col bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            {/* Header */}
            <div className={`flex items-center h-16 bg-primary-600 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
                {isCollapsed ? (
                    // Collapsed state - only icon
                    <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-lg">
                        <UsersIcon className="h-5 w-5 text-black" />
                    </div>
                ) : (
                    // Expanded state - icon and text
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-lg mr-3">
                            <UsersIcon className="h-5 w-5 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">HR Management</span>
                            <span className="text-xs text-white text-opacity-80">Employee System</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className={`flex-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <nav className="space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center text-sm font-medium rounded-lg transition-all duration-200 group relative ${isCollapsed
                                    ? 'justify-center p-3 mx-1'
                                    : 'px-4 py-2'
                                } ${isActive
                                    ? 'bg-primary-50 text-primary-700' + (isCollapsed ? '' : ' border-r-2 border-primary-600')
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 ${isCollapsed ? 'flex-shrink-0' : 'mr-3 flex-shrink-0'}`} />

                            {/* Text label - only show when expanded */}
                            {!isCollapsed && (
                                <span className="transition-opacity duration-300 truncate">
                                    {item.name}
                                </span>
                            )}

                            {/* Tooltip - only show when collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                                    {item.name}
                                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* User section */}
            <div className={`border-t border-gray-200 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                {/* User info - expanded state */}
                {!isCollapsed && (
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-white">
                                {user?.employee?.firstName?.charAt(0) || user?.username?.charAt(0)}
                                {user?.employee?.lastName?.charAt(0) || user?.username?.charAt(1)}
                            </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.username}
                            </p>
                            {/* <p className="text-xs text-gray-500 truncate">{user?.role}</p> */}
                        </div>
                    </div>
                )}

                {/* User avatar - collapsed state */}
                {isCollapsed && (
                    <div className="flex justify-center mb-3 group relative">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                                {user?.employee?.firstName?.charAt(0) || user?.username?.charAt(0)}
                                {user?.employee?.lastName?.charAt(0) || user?.username?.charAt(1)}
                            </span>
                        </div>
                        {/* User tooltip */}
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                            <div className="font-medium">
                                {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.username}
                            </div>
                            {/* <div className="text-xs text-gray-300">{user?.role}</div> */}
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    </div>
                )}

                {/* Logout button */}
                <button
                    onClick={logout}
                    className={`flex items-center w-full text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group relative ${isCollapsed
                        ? 'justify-center p-3'
                        : 'px-4 py-2'
                        }`}
                >
                    <LogOut className={`w-5 h-5 ${isCollapsed ? 'flex-shrink-0' : 'mr-3 flex-shrink-0'}`} />

                    {/* Text - only show when expanded */}
                    {!isCollapsed && <span>Sign out</span>}

                    {/* Tooltip - only show when collapsed */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                            Sign out
                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;