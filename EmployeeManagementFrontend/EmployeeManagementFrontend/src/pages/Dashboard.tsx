import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Building2, Calendar, TrendingUp, Clock, Activity, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import {
    RechartsBarChart,
    RechartsLineChart,
    RechartsPieChart,
    RechartsAreaChart,
    MetricCard,
    ProgressChart
} from '../components/charts';

interface HiringTrendData {
    month: number;
    hires: number;
}

interface DepartmentGrowthData {
    department: string;
    employeeCount: number;
}

interface AttendancePatternData {
    employeeId: number;
    employeeName: string;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
}

interface DashboardStats {
    totalEmployees: number;
    newHires: number;
    totalDepartments: number;
    presentToday: number;
    attendanceRate: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [hiringTrend, setHiringTrend] = useState<HiringTrendData[]>([]);
    const [departmentGrowth, setDepartmentGrowth] = useState<DepartmentGrowthData[]>([]);
    const [attendancePattern, setAttendancePattern] = useState<AttendancePatternData[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalEmployees: 0,
        newHires: 0,
        totalDepartments: 0,
        presentToday: 0,
        attendanceRate: 0
    });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Check if user has administrative privileges (not Employee role)
    const hasAdminAccess = Number(user?.role) !== 3;

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [selectedYear, selectedMonth]);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedYear, selectedMonth]);

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchHiringTrend(),
                fetchDepartmentGrowth(),
                fetchAttendancePattern(),
                fetchDashboardStats()
            ]);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedYear, selectedMonth]);

    const fetchHiringTrend = async () => {
        try {
            const response = await axiosClient.get(`/dashboard/hiring-trend?year=${selectedYear}`);
            // Handle ASP.NET Core response format
            const data = response.data.$values || response.data;
            setHiringTrend(data);
        } catch (error) {
            console.error('Error fetching hiring trend:', error);
            throw error;
        }
    };

    const fetchDepartmentGrowth = async () => {
        try {
            const response = await axiosClient.get('/dashboard/department-growth');
            // Handle ASP.NET Core response format
            const data = response.data.$values || response.data;
            setDepartmentGrowth(data);
        } catch (error) {
            console.error('Error fetching department growth:', error);
            throw error;
        }
    };

    const fetchAttendancePattern = async () => {
        try {
            const response = await axiosClient.get(`/dashboard/attendance-pattern?year=${selectedYear}&month=${selectedMonth}`);
            // Handle ASP.NET Core response format
            const data = response.data.$values || response.data;
            setAttendancePattern(data);
        } catch (error) {
            console.error('Error fetching attendance pattern:', error);
            throw error;
        }
    };

    const fetchDashboardStats = async () => {
        try {
            // Calculate stats from the fetched data
            const totalEmployees = departmentGrowth.reduce((sum, dept) => sum + dept.employeeCount, 0);
            const newHires = hiringTrend.reduce((sum, month) => sum + month.hires, 0);
            const totalDepartments = departmentGrowth.length;
            const presentToday = attendancePattern.reduce((sum, emp) => sum + emp.presentDays, 0);
            const attendanceRate = attendancePattern.length > 0
                ? (presentToday / (attendancePattern.length * new Date(selectedYear, selectedMonth, 0).getDate())) * 100
                : 0;

            setDashboardStats({
                totalEmployees,
                newHires,
                totalDepartments,
                presentToday,
                attendanceRate
            });
        } catch (error) {
            console.error('Error calculating dashboard stats:', error);
        }
    };

    const getMonthName = (monthNumber: number) => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return months[monthNumber - 1];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Employees"
                    value={dashboardStats.totalEmployees.toString()}
                    change={`+${Math.floor(dashboardStats.newHires / 12 * 100)}%`}
                    changeType="increase"
                    icon={Users}
                    subtitle="Active employees"
                />
                <MetricCard
                    title="New Hires"
                    value={dashboardStats.newHires.toString()}
                    change={`${selectedYear}`}
                    changeType="neutral"
                    icon={UserPlus}
                    subtitle={`This year (${selectedYear})`}
                />
                <MetricCard
                    title="Departments"
                    value={dashboardStats.totalDepartments.toString()}
                    change="Active"
                    changeType="neutral"
                    icon={Building2}
                    subtitle="Total departments"
                />
                <MetricCard
                    title="Attendance Rate"
                    value={`${dashboardStats.attendanceRate.toFixed(1)}%`}
                    change={dashboardStats.attendanceRate > 85 ? '+Good' : '-Low'}
                    changeType={dashboardStats.attendanceRate > 85 ? 'increase' : 'decrease'}
                    icon={Calendar}
                    subtitle={`${getMonthName(selectedMonth)} ${selectedYear}`}
                />
            </div> */}

            {/* Analytics Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Analytics Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <div className="relative">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[80px]"
                                    disabled={isLoading}
                                >
                                    {[2022, 2023, 2024, 2025].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <div className="relative">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[100px]"
                                    disabled={isLoading}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                        <option key={month} value={month}>{getMonthName(month)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <div className="text-sm text-gray-500">
                                {isLoading && (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        Loading...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Hiring Trend Bar Chart */}
                <RechartsBarChart
                    title={`Monthly Hiring Trend - ${selectedYear}`}
                    data={hiringTrend.length > 0 ? hiringTrend.map(item => ({
                        name: getMonthName(item.month),
                        value: item.hires
                    })) : []}
                    height={280}
                    primaryColor="#3B82F6"
                />

                {/* Department Distribution Pie Chart */}
                <RechartsPieChart
                    title="Department Distribution"
                    data={departmentGrowth.length > 0 ? departmentGrowth.slice(0, 6).map((dept, index) => ({
                        name: dept.department,
                        value: dept.employeeCount,
                        color: [
                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                            '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
                        ][index % 8]
                    })) : []}
                    size={280}
                    donut={true}
                    showLegend={false}
                />

                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-600" />
                            Top Performers - {getMonthName(selectedMonth)} {selectedYear}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : attendancePattern.length > 0 ? (
                            <div className="space-y-3">
                                {attendancePattern.slice(0, 5).map((emp, index) => (
                                    <div key={emp.employeeId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{emp.employeeName}</p>
                                                <p className="text-xs text-gray-500">{emp.totalHours.toFixed(1)} hours</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-600">{emp.presentDays}</p>
                                            <p className="text-xs text-gray-500">days</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No attendance data for {getMonthName(selectedMonth)} {selectedYear}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Analysis */}
                {/* <RechartsAreaChart
                    title={`Attendance Analysis - ${getMonthName(selectedMonth)} ${selectedYear}`}
                    data={attendancePattern.length > 0 ? attendancePattern.slice(0, 10).map(emp => ({
                        name: emp.employeeName.split(' ')[0],
                        value: emp.presentDays,
                        secondaryValue: emp.absentDays + emp.lateDays
                    })) : []}
                    height={320}
                    primaryColor="#10B981"
                    secondaryColor="#EF4444"
                    showLegend={true}
                /> */}

                {/* Department Performance */}
                <RechartsLineChart
                    title="Department Employee Count"
                    data={departmentGrowth.length > 0 ? departmentGrowth.slice(0, 8).map(dept => ({
                        name: dept.department.length > 10 ? dept.department.substring(0, 10) + '...' : dept.department,
                        value: dept.employeeCount
                    })) : []}
                    height={320}
                    primaryColor="#8B5CF6"
                    smooth={true}
                />
            </div>

            {/* Recent Activities & Quick Actions */}
            <div className={`grid grid-cols-1 ${hasAdminAccess ? 'lg:grid-cols-2' : ''} gap-6`}>
                {/* Recent Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-600" />
                            Recent Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendancePattern.slice(0, 4).map((emp, index) => (
                                <div key={emp.employeeId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            {emp.employeeName} - {emp.presentDays} days present
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {emp.totalHours.toFixed(1)} total hours in {getMonthName(selectedMonth)}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-xs text-gray-400">
                                        {getMonthName(selectedMonth)}
                                    </div>
                                </div>
                            ))}
                            {attendancePattern.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No recent activities</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions - Only show for non-Employee roles */}
                {hasAdminAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gray-600" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/employees/add')}
                                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                                >
                                    <UserPlus className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">Add Employee</span>
                                </button>
                                <button
                                    onClick={() => navigate('/attendance')}
                                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                                >
                                    <Calendar className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">Mark Attendance</span>
                                </button>
                                <button
                                    onClick={() => navigate('/reports')}
                                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                                >
                                    <TrendingUp className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">View Reports</span>
                                </button>
                                <button
                                    onClick={() => navigate('/departments')}
                                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                                >
                                    <Building2 className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-gray-900">Manage Departments</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Dashboard;