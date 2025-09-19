import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, LogIn, LogOut, Plane, Sun } from 'lucide-react';
import { type Attendance, type Employee, AttendanceStatus } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const AttendancePage: React.FC = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentUserAttendance, setCurrentUserAttendance] = useState<Attendance | null>(null);

    useEffect(() => {
        fetchEmployees();
        fetchAttendanceRecords();
    }, [selectedDate]);

    useEffect(() => {
        // Find current user's attendance for today
        if (user?.employeeId && attendanceRecords.length > 0) {
            const userAttendance = attendanceRecords.find(record =>
                record.employeeId === user.employeeId &&
                record.attendanceDate.split('T')[0] === selectedDate
                // && record.checkInTime !== null && record.checkOutTime === null
            );
            setCurrentUserAttendance(userAttendance || null);
        }
    }, [attendanceRecords, user?.employeeId, selectedDate]);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get<Employee[]>('/employees');

            // Handle ASP.NET Core System.Text.Json reference handling format
            let employeesData: Employee[] = [];
            if (response.data && typeof response.data === 'object' && '$values' in response.data) {
                employeesData = Array.isArray((response.data as any).$values) ? (response.data as any).$values : [];
            } else if (Array.isArray(response.data)) {
                employeesData = response.data;
            }

            setEmployees(employeesData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendanceRecords = async () => {
        try {
            const response = await axiosClient.get<Attendance[]>(`/attendance?date=${selectedDate}`);

            // Handle ASP.NET Core System.Text.Json reference handling format
            let attendanceData: Attendance[] = [];
            if (response.data && typeof response.data === 'object' && '$values' in response.data) {
                attendanceData = Array.isArray((response.data as any).$values) ? (response.data as any).$values : [];
            } else if (Array.isArray(response.data)) {
                attendanceData = response.data;
            }

            setAttendanceRecords(attendanceData);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!user?.employeeId) return;

        setIsProcessing(true);
        try {
            await axiosClient.post(`/attendance/checkin/${user.employeeId}`);
            await fetchAttendanceRecords();

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            successDiv.textContent = 'Checked in successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
        } catch (error: any) {
            console.error('Error checking in:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            errorDiv.textContent = error.response?.data || 'Error checking in. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCheckOut = async () => {
        if (!user?.employeeId) return;

        setIsProcessing(true);
        try {
            await axiosClient.post(`/attendance/checkout/${user.employeeId}`);
            await fetchAttendanceRecords();

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            successDiv.textContent = 'Checked out successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
        } catch (error: any) {
            console.error('Error checking out:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            errorDiv.textContent = error.response?.data || 'Error checking out. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarkLeave = async () => {
        if (!user?.employeeId) return;

        setIsProcessing(true);
        try {
            await axiosClient.post(`/attendance/leave/${user.employeeId}?date=${selectedDate}`);
            await fetchAttendanceRecords();

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            successDiv.textContent = 'Leave marked successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
        } catch (error: any) {
            console.error('Error marking leave:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            errorDiv.textContent = error.response?.data || 'Error marking leave. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMarkHoliday = async () => {
        if (!user?.employeeId) return;

        setIsProcessing(true);
        try {
            await axiosClient.post(`/attendance/holiday/${user.employeeId}?date=${selectedDate}`);
            await fetchAttendanceRecords();

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            successDiv.textContent = 'Holiday marked successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => document.body.removeChild(successDiv), 3000);
        } catch (error: any) {
            console.error('Error marking holiday:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            errorDiv.textContent = error.response?.data || 'Error marking holiday. Please try again.';
            document.body.appendChild(errorDiv);
            setTimeout(() => document.body.removeChild(errorDiv), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusIcon = (status: any) => {
        const statusString = getStatusFromNumber(status);
        switch (statusString) {
            case AttendanceStatus.Present:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case AttendanceStatus.Late:
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case AttendanceStatus.Absent:
                return <XCircle className="w-5 h-5 text-red-500" />;
            case AttendanceStatus.HalfDay:
                return <Clock className="w-5 h-5 text-blue-500" />;
            case AttendanceStatus.Holiday:
                return <Calendar className="w-5 h-5 text-purple-500" />;
            case AttendanceStatus.Leave:
                return <Users className="w-5 h-5 text-orange-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: any) => {
        const statusString = getStatusFromNumber(status);
        switch (statusString) {
            case AttendanceStatus.Present:
                return 'bg-green-100 text-green-800';
            case AttendanceStatus.Late:
                return 'bg-yellow-100 text-yellow-800';
            case AttendanceStatus.Absent:
                return 'bg-red-100 text-red-800';
            case AttendanceStatus.HalfDay:
                return 'bg-blue-100 text-blue-800';
            case AttendanceStatus.Holiday:
                return 'bg-purple-100 text-purple-800';
            case AttendanceStatus.Leave:
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to convert numeric status to string status
    const getStatusFromNumber = (status: any): string => {
        if (typeof status === 'string') return status;

        switch (Number(status)) {
            case 0: return AttendanceStatus.Present;
            case 1: return AttendanceStatus.Absent;
            case 2: return AttendanceStatus.Late;
            case 3: return AttendanceStatus.HalfDay;
            case 4: return AttendanceStatus.Holiday;
            case 5: return AttendanceStatus.Leave;
            default: return AttendanceStatus.Absent;
        }
    };

    // Calculate attendance statistics reactively when attendance records change
    const attendanceStats = useMemo(() => {
        console.log('Calculating stats for records:', attendanceRecords);

        const stats = {
            present: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.Present;
            }).length,
            late: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.Late;
            }).length,
            absent: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.Absent;
            }).length,
            halfDay: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.HalfDay;
            }).length,
            holiday: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.Holiday;
            }).length,
            leave: attendanceRecords.filter(r => {
                const status = getStatusFromNumber(r.status);
                return status === AttendanceStatus.Leave;
            }).length,
        };

        console.log('Calculated stats:', stats);
        return stats;
    }, [attendanceRecords]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Attendance Action Buttons */}
            {user?.employeeId && (
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        {/* Check In Button */}
                        <button
                            onClick={handleCheckIn}
                            disabled={isProcessing || (currentUserAttendance?.checkInTime !== null && currentUserAttendance?.checkInTime !== undefined)}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentUserAttendance?.checkInTime ?
                                'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Check In'}
                        </button>

                        {/* Check Out Button */}
                        <button
                            onClick={handleCheckOut}
                            disabled={isProcessing || (currentUserAttendance?.checkOutTime !== null && currentUserAttendance?.checkOutTime !== undefined)}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${!currentUserAttendance?.checkInTime || currentUserAttendance?.checkOutTime ?
                                'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Check Out'}
                        </button>

                        {/* Mark Leave Button */}
                        <button
                            onClick={handleMarkLeave}
                            disabled={isProcessing || currentUserAttendance !== null}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentUserAttendance ?
                                'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                'bg-orange-600 hover:bg-orange-700 text-white'
                                }`}
                        >
                            <Plane className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Mark Leave'}
                        </button>

                        {/* Mark Holiday Button - Only for HR/Admin */}
                        {(Number(user?.role) === 0 || Number(user?.role) === 1) && (
                            <button
                                onClick={handleMarkHoliday}
                                disabled={isProcessing}
                                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                <Sun className="w-4 h-4 mr-2" />
                                {isProcessing ? 'Processing...' : 'Mark Holiday'}
                            </button>
                        )}
                    </div>

                    {/* Current Status Display */}
                    {/* {currentUserAttendance && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {getStatusIcon(currentUserAttendance.status)}
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        Current Status: {currentUserAttendance.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {currentUserAttendance.checkInTime && (
                                        <span>
                                            In: {new Date(currentUserAttendance.checkInTime).toLocaleTimeString()}
                                        </span>
                                    )}
                                    {currentUserAttendance.checkOutTime && (
                                        <span className="ml-4">
                                            Out: {new Date(currentUserAttendance.checkOutTime).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            )}

            {/* Attendance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
                            <p className="text-sm text-gray-500">Present</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{attendanceStats.late}</p>
                            <p className="text-sm text-gray-500">Late</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <XCircle className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
                            <p className="text-sm text-gray-500">Absent</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <Clock className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{attendanceStats.halfDay}</p>
                            <p className="text-sm text-gray-500">Half Day</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Records */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                        Attendance for {new Date(selectedDate).toLocaleDateString()}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                            {attendanceRecords.length} employees
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Check Out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hours Worked
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceRecords.map((record) => {
                                const employee = employees.find(emp => emp.employeeId === record.employeeId) || record.employee;
                                return (
                                    <tr key={record.attendanceId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(record.status)}
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {employee?.department?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        #{employee?.employeeCode}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.totalHours ? `${record.totalHours}h` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                                {getStatusFromNumber(record.status)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;