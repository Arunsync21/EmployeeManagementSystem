import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Users, Building2, TrendingUp } from 'lucide-react';
import { type ReportFilter, type Department, EmploymentStatus } from '../../types';
import axiosClient from '../../api/axiosClient';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState('employee');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<ReportFilter>({
        startDate: '',
        endDate: '',
        departmentId: undefined,
        employmentStatus: undefined,
        employeeId: undefined,
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axiosClient.get<Department[]>('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const reportTypes = [
        {
            id: 'employee-directory',
            name: 'Employee Directory',
            description: 'Complete list of all employees with their details',
            icon: Users,
            endpoint: 'employee-directory',
            hasFilters: false,
        },
        {
            id: 'departments',
            name: 'Department Reports',
            description: 'Department-wise employee distribution and analytics',
            icon: Building2,
            endpoint: 'departments',
            hasFilters: false,
        },
        {
            id: 'attendance',
            name: 'Attendance Reports',
            description: 'Employee attendance patterns and statistics',
            icon: Calendar,
            endpoint: 'attendance',
            hasFilters: true,
        },
        {
            id: 'salary',
            name: 'Salary Reports',
            description: 'Employee salary information and department-wise analysis',
            icon: TrendingUp,
            endpoint: 'salary',
            hasFilters: true,
        },
        {
            id: 'comprehensive',
            name: 'Comprehensive Report',
            description: 'Complete HR report with all employee data',
            icon: FileText,
            endpoint: 'comprehensive',
            hasFilters: false,
        },
    ];

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value === '' ? undefined : (name === 'departmentId' || name === 'employeeId') ? parseInt(value) : value,
        }));
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            const currentReport = reportTypes.find(report => report.id === activeTab);
            if (!currentReport) return;

            // Construct query parameters based on the report type
            const queryParams = new URLSearchParams();

            // Add filters based on report type
            if (currentReport.hasFilters) {
                if (filters.startDate) queryParams.append('startDate', filters.startDate);
                if (filters.endDate) queryParams.append('endDate', filters.endDate);

                if (activeTab === 'attendance' && filters.employeeId) {
                    queryParams.append('employeeId', filters.employeeId.toString());
                }

                if (activeTab === 'salary' && filters.departmentId) {
                    queryParams.append('departmentId', filters.departmentId.toString());
                }
            }

            // Make API call to generate report
            const endpoint = `/reports/${currentReport.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await axiosClient.get(endpoint, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from response headers or create default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.xlsx`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50';
            successMessage.textContent = 'Excel report generated and downloaded successfully!';
            document.body.appendChild(successMessage);

            setTimeout(() => {
                document.body.removeChild(successMessage);
            }, 3000);

        } catch (error) {
            console.error('Error generating report:', error);

            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50';
            errorMessage.textContent = 'Error generating report. Please try again.';
            document.body.appendChild(errorMessage);

            setTimeout(() => {
                document.body.removeChild(errorMessage);
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            </div>

            {/* Report Type Tabs */}
            <div className="card">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {reportTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setActiveTab(type.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === type.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <type.icon className="w-4 h-4 mr-2" />
                                    {type.name}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-6">
                    {reportTypes.map((type) => (
                        <div
                            key={type.id}
                            className={activeTab === type.id ? 'block' : 'hidden'}
                        >
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                            </div>

                            {/* Filters - only show for reports that support them */}
                            {type.hasFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate || ''}
                                            onChange={handleFilterChange}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate || ''}
                                            onChange={handleFilterChange}
                                            className="input-field"
                                        />
                                    </div>

                                    {/* Department filter - only for salary reports */}
                                    {activeTab === 'salary' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Department
                                            </label>
                                            <select
                                                name="departmentId"
                                                value={filters.departmentId || ''}
                                                onChange={handleFilterChange}
                                                className="input-field"
                                            >
                                                <option value="">All Departments</option>
                                                {departments.map(dept => (
                                                    <option key={dept.departmentId} value={dept.departmentId}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Employee filter - only for attendance reports */}
                                    {activeTab === 'attendance' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Employee ID
                                            </label>
                                            <input
                                                type="number"
                                                name="employeeId"
                                                value={filters.employeeId || ''}
                                                onChange={handleFilterChange}
                                                placeholder="Optional - specific employee"
                                                className="input-field"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Generate Report Button */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isLoading}
                                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate Excel Report'
                                    )}
                                </button>

                                {type.hasFilters && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Tip:</span> Leave filters empty to include all data
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Report Information */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Available Report Types</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-primary-600" />
                                Employee Directory - Complete employee information
                            </li>
                            <li className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-primary-600" />
                                Department Reports - Department-wise analytics
                            </li>
                            <li className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                                Attendance Reports - Attendance patterns and statistics
                            </li>
                            <li className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-2 text-primary-600" />
                                Salary Reports - Employee salary information
                            </li>
                            <li className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-primary-600" />
                                Comprehensive Report - Complete HR data
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Report Features</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <Download className="w-4 h-4 mr-2 text-green-600" />
                                Excel format - Ready for analysis and sharing
                            </li>
                            <li className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                Date filtering - Filter by date ranges where applicable
                            </li>
                            <li className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                                Department filtering - Filter by specific departments
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-800">
                                <strong>Note:</strong> Reports are generated in real-time based on current data and applied filters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;